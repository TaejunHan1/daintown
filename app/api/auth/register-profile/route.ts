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
    // 요청 데이터 파싱
    const { userId, fullName, phoneNumber, businessDocUrl, signatureData } = await request.json();

    // 필요한 파라미터 체크
    if (!userId || !fullName) {
      return NextResponse.json(
        { error: '필수 정보가 누락되었습니다.' },
        { status: 400 }
      );
    }

    console.log('Updating profile for user:', userId);

    try {
      // SQL 쿼리를 직접 사용하여 RLS 우회
      const { data, error } = await supabaseAdmin.rpc('admin_update_profile', {
        p_user_id: userId,
        p_full_name: fullName,
        p_phone_number: phoneNumber,
        p_business_doc: businessDocUrl,
        p_signature_data: signatureData,
        p_role: 'user',
        p_status: 'pending'
      });

      if (error) {
        console.error('RPC error:', error);
        throw error;
      }

      return NextResponse.json(
        { success: true, message: '프로필이 성공적으로 생성되었습니다.' },
        { status: 200 }
      );
    } catch (rpcError) {
      console.error('RPC method failed, trying direct SQL:', rpcError);
      
      // RPC 함수를 먼저 시도하고, 없으면 직접 SQL 실행
      try {
        // 직접 SQL 쿼리 실행
        const { data, error } = await supabaseAdmin.rpc('execute_sql', {
          sql_query: `
            UPDATE profiles 
            SET full_name = '${fullName}',
                phone_number = '${phoneNumber}',
                business_registration_doc = ${businessDocUrl ? `'${businessDocUrl}'` : 'NULL'},
                signature_data = ${signatureData ? `'${signatureData}'` : 'NULL'},
                role = 'user',
                status = 'pending',
                updated_at = NOW()
            WHERE id = '${userId}'
          `
        });

        if (error) {
          console.error('SQL execution error:', error);
          throw error;
        }

        return NextResponse.json(
          { success: true, message: '프로필이 성공적으로 생성되었습니다.' },
          { status: 200 }
        );
      } catch (sqlError) {
        console.error('Direct SQL failed, trying from() method:', sqlError);
        
        // 마지막 방법: .from() 메서드 사용
        const { error } = await supabaseAdmin
          .from('profiles')
          .update({
            full_name: fullName,
            phone_number: phoneNumber,
            business_registration_doc: businessDocUrl,
            signature_data: signatureData,
            role: 'user',
            status: 'pending',
            updated_at: new Date().toISOString(),
          })
          .eq('id', userId);

        if (error) {
          console.error('Profile update error with from() method:', error);
          throw error;
        }

        return NextResponse.json(
          { success: true, message: '프로필이 성공적으로 생성되었습니다.' },
          { status: 200 }
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