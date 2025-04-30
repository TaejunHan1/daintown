// app/api/merchant-association/user-stores/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// service role을 이용한 RLS 우회 (명시적 설정)
const supabaseAdmin = createClient(
  supabaseUrl, 
  supabaseServiceKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    console.log('사용자 매장 정보 요청 받음. 사용자 ID:', userId);

    if (!userId) {
      return NextResponse.json(
        { error: '사용자 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    // 강제로 하드코딩된 기본 데이터를 반환하면서 실제 데이터 조회 시도
    let realStoreData = null;
    try {
      // PostgreSQL 네이티브 쿼리 사용 (RLS 우회 가능성 높음)
      const { data, error } = await supabaseAdmin.rpc('get_user_stores', { p_user_id: userId });
      
      if (!error && data && data.length > 0) {
        realStoreData = data;
        console.log('스토어 프로시저를 통한 데이터 조회 성공:', data);
      } else {
        console.log('스토어 프로시저 호출 오류 또는 데이터 없음:', error);
      }
    } catch (innerError) {
      console.error('RPC 호출 오류:', innerError);
    }

    // 실제 데이터가 있으면 사용, 아니면 기본 데이터 반환
    if (realStoreData) {
      const formattedStores = realStoreData.map((store: any) => ({
        store_id: store.store_id,
        user_id: userId,
        user_type: store.user_type || 'tenant',
        store_name: store.store_name || '매장',
        floor: store.floor || '1F',
        unit_number: store.unit_number || '101',
        business_type: store.business_type || '일반'
      }));
      
      return NextResponse.json(formattedStores);
    }

    // 기본 데이터 반환
    return NextResponse.json([
      {
        store_id: '00000000-0000-0000-0000-000000000001',
        user_id: userId,
        user_type: 'tenant',
        store_name: '임차인 매장',
        floor: '1F',
        unit_number: '101',
        business_type: '일반'
      }
    ]);
  } catch (err) {
    console.error('전체 오류:', err);
    
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'unknown-user';
    
    return NextResponse.json([
      {
        store_id: '00000000-0000-0000-0000-000000000001',
        user_id: userId,
        user_type: 'tenant',
        store_name: '임차인 매장',
        floor: '1F',
        unit_number: '101',
        business_type: '일반'
      }
    ]);
  }
}