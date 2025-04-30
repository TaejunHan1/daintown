// app/api/auth/register-profile/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 서비스 롤 키 확인을 위한 로깅 (키 자체는 노출하지 않음)
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
console.log('Service Role Key length:', serviceRoleKey.length);
console.log('Service Role Key first 10 chars:', serviceRoleKey.substring(0, 10) + '...');

// 직접 서비스 롤 키를 사용하여 Supabase 클라이언트 생성
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  {
    auth: {
      persistSession: false, // 세션 유지 안함
      autoRefreshToken: false, // 토큰 자동 갱신 안함
    }
  }
);

export async function POST(request: NextRequest) {
  try {
    // 요청 데이터 로깅 추가
    const requestData = await request.json();
    console.log('Received request data:', JSON.stringify(requestData));
    
    // 요청 데이터 파싱 - 매장 ID도 받도록 수정
    const { userId, fullName, phoneNumber, businessDocUrl, signatureData, verified, userType, selectedStoreId } = requestData;

    // 필수 파라미터 확인 로깅
    console.log('Required fields check:', {
      userId: !!userId,
      fullName: !!fullName,
      phoneNumber: !!phoneNumber
    });

    // 필요한 파라미터 체크
    if (!userId || !fullName || !phoneNumber) {
      return NextResponse.json(
        { error: '필수 정보가 누락되었습니다.' },
        { status: 400 }
      );
    }

    // userType 기본값 설정
    const finalUserType = userType === 'landlord' ? 'landlord' : 'tenant';

    console.log('Updating profile for user:', userId, 'with type:', finalUserType);
    
    // 휴대폰 인증 여부에 따른 status 설정
    const status = verified === true ? 'pending' : 'pending';
    
    // 트랜잭션 처리
    try {
      // 1. 먼저 프로필 정보 업데이트
      console.log('1. 프로필 정보 업데이트 중...');
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .update({
          full_name: fullName,
          phone_number: phoneNumber,
          business_registration_doc: businessDocUrl,
          signature_data: signatureData,
          role: 'user',
          status: status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (profileError) {
        console.error('Profile update error:', profileError);
        throw profileError;
      }
      
      // 매장 ID (선택한 매장 ID 또는 기존 매장 중 하나 사용)
      let storeId = selectedStoreId;
      
      // 선택한 매장이 없는 경우에만, 매장 찾기를 시도
      if (!storeId) {
        // 기존 매장 찾기 시도
        console.log('2-1. 매장 정보 찾기 시도...');
        const { data: existingStores, error: storeError } = await supabaseAdmin
          .from('stores')
          .select('id')
          .eq('owner_id', userId)
          .limit(1);
        
        if (storeError || !existingStores || existingStores.length === 0) {
          console.error('Store lookup error:', storeError || 'No existing stores found');
          // 매장이 없는 경우만 생성
          console.log('2-2. 매장이 없어 기본 매장 생성 중...');
          const storeName = finalUserType === 'landlord' ? '임대인 매장' : '임차인 매장';
          
          // 매장 정보 생성
          const { data: newStore, error: createStoreError } = await supabaseAdmin
            .from('stores')
            .insert({
              name: storeName,
              floor: finalUserType === 'landlord' ? 'ALL' : '1F',
              unit_number: finalUserType === 'landlord' ? 'ALL' : '101',
              description: `${finalUserType === 'landlord' ? '임대인' : '임차인'} 기본 매장`,
              owner_id: userId
            })
            .select('id')
            .single();
            
          if (createStoreError) {
            console.error('Store creation error:', createStoreError);
            throw createStoreError;
          }
          
          storeId = newStore.id;
          console.log('2-3. 새 매장 생성 성공:', storeId);
        } else {
          storeId = existingStores[0].id;
          console.log('2-3. 기존 매장 발견:', storeId);
        }
      } else {
        console.log('2. 선택한 매장 사용:', storeId);
      }

      // 3. 이제 store_users 테이블에 사용자-매장 연결 레코드 생성
      console.log('3. 사용자-매장 연결 생성 중...');
      
      // 기존 연결 확인 (중복 방지)
      const { data: existingLinks, error: checkLinkError } = await supabaseAdmin
        .from('store_users')
        .select('id')
        .eq('user_id', userId)
        .eq('store_id', storeId);
        
      if (checkLinkError) {
        console.error('Check store user link error:', checkLinkError);
        // 계속 진행 (재연결 시도)
      }
      
      // 기존 연결이 없을 경우에만 새 연결 생성
      if (!existingLinks || existingLinks.length === 0) {
        const { error: storeUserError } = await supabaseAdmin
          .from('store_users')
          .insert({
            user_id: userId,
            store_id: storeId,
            user_type: finalUserType
          });

        if (storeUserError) {
          console.error('Store user link error:', storeUserError);
          throw storeUserError;
        }
        console.log('3-1. 새 사용자-매장 연결 생성됨');
      } else {
        console.log('3-2. 기존 사용자-매장 연결 있음, 업데이트 중...');
        
        // 기존 연결 업데이트 (유형 업데이트)
        const { error: updateLinkError } = await supabaseAdmin
          .from('store_users')
          .update({ user_type: finalUserType })
          .eq('user_id', userId)
          .eq('store_id', storeId);
          
        if (updateLinkError) {
          console.error('Update store user link error:', updateLinkError);
          throw updateLinkError;
        }
      }

      return NextResponse.json(
        { 
          success: true, 
          message: '프로필이 성공적으로 생성되었습니다.', 
          userType: finalUserType 
        },
        { status: 200 }
      );
    } catch (transactionError: any) {
      console.error('Transaction error:', transactionError);
      
      // 기존 백업 방법 시도 (실패한 경우)
      console.log('4. 기존 방법으로 프로필만 업데이트 시도...');
      
      try {
        // 직접 프로필 업데이트
        const { error } = await supabaseAdmin
          .from('profiles')
          .update({
            full_name: fullName,
            phone_number: phoneNumber,
            business_registration_doc: businessDocUrl,
            signature_data: signatureData,
            role: 'user',
            status: status,
            updated_at: new Date().toISOString(),
          })
          .eq('id', userId);

        if (error) {
          console.error('Fallback profile update error:', error);
          throw error;
        }

        return NextResponse.json(
          { success: true, message: '프로필만 업데이트되었습니다.' },
          { status: 200 }
        );
      } catch (fallbackError) {
        console.error('Fallback error:', fallbackError);
        return NextResponse.json(
          { error: '프로필 업데이트 중 오류가 발생했습니다.', details: transactionError.message },
          { status: 500 }
        );
      }
    }
  } catch (err: any) {
    console.error('Register profile API error:', err);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.', details: err.message },
      { status: 500 }
    );
  }
}