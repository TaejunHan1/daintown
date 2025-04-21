// app/api/admin/stores/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  try {
    // 환경 변수 확인
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Supabase 환경 설정이 누락되었습니다.' },
        { status: 500 }
      );
    }

    // 서비스 롤 키로 Supabase 클라이언트 생성 (모든 권한)
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // 모든 매장 정보 조회
    const { data: stores, error: storesError } = await supabaseAdmin
      .from('stores')
      .select(`
        id,
        name,
        floor,
        unit_number,
        business_type,
        contact_info,
        owner_id
      `)
      .order('floor', { ascending: true })
      .order('unit_number', { ascending: true });

    if (storesError) {
      console.error('Error fetching stores:', storesError);
      return NextResponse.json(
        { error: '매장 정보를 가져오는 중 오류가 발생했습니다.', details: storesError.message },
        { status: 500 }
      );
    }

    // 데이터가 없는 경우도 빈 배열 반환 (더미 데이터 사용 안함)
    return NextResponse.json(stores || []);
  } catch (err: any) {
    console.error('Admin stores API error:', err);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.', details: err.message },
      { status: 500 }
    );
  }
}