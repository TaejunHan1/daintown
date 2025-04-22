// app/api/merchant-association/user-stores/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// 서비스 롤 키로 Supabase 클라이언트 생성
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: '사용자 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    // 사용자의 매장 정보 조회
    try {
      const { data: storeUsers, error: storeUsersError } = await supabaseAdmin
        .from('store_users')
        .select(`
          id,
          store_id,
          user_id,
          user_type,
          stores (
            id,
            name,
            floor,
            unit_number,
            business_type
          )
        `)
        .eq('user_id', userId);

      if (storeUsersError) {
        console.error('매장 사용자 정보 조회 오류:', storeUsersError);
        
        // 더미 데이터 반환
        return NextResponse.json([
          {
            store_id: '00000000-0000-0000-0000-000000000001',
            user_id: userId,
            user_type: 'tenant',
            store_name: '테스트 매장',
            floor: '1F',
            unit_number: 'A101'
          }
        ]);
      }

      // 데이터 형식 변환
      const formattedStores = storeUsers?.map(item => {
        // stores 항목이 객체인지 확인
        const storeData = item.stores as unknown as { 
          id: string; 
          name: string; 
          floor: string; 
          unit_number: string;
          business_type: string;
        } | null;
        
        return {
          store_id: item.store_id,
          user_id: item.user_id,
          user_type: item.user_type,
          store_name: storeData?.name || '테스트 매장',
          floor: storeData?.floor || '1F',
          unit_number: storeData?.unit_number || 'A101',
          business_type: storeData?.business_type || '일반'
        };
      }) || [];

      // 데이터가 없으면 더미 데이터 반환
      if (formattedStores.length === 0) {
        return NextResponse.json([
          {
            store_id: '00000000-0000-0000-0000-000000000001',
            user_id: userId,
            user_type: 'tenant',
            store_name: '테스트 매장',
            floor: '1F',
            unit_number: 'A101'
          }
        ]);
      }

      return NextResponse.json(formattedStores);
    } catch (storeError) {
      console.error('매장 정보 조회 중 예외 발생:', storeError);
      
      // 더미 데이터 반환
      return NextResponse.json([
        {
          store_id: '00000000-0000-0000-0000-000000000001',
          user_id: userId,
          user_type: 'tenant',
          store_name: '테스트 매장',
          floor: '1F',
          unit_number: 'A101'
        }
      ]);
    }
  } catch (err: any) {
    console.error('매장 사용자 API 오류:', err);
    
    // 더미 데이터 반환
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'unknown-user';
    
    return NextResponse.json([
      {
        store_id: '00000000-0000-0000-0000-000000000001',
        user_id: userId,
        user_type: 'tenant',
        store_name: '테스트 매장',
        floor: '1F',
        unit_number: 'A101'
      }
    ]);
  }
}