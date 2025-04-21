// app/api/admin/dashboard-stats/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// 서비스 롤 키로 Supabase 클라이언트 생성
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: NextRequest) {
  try {
    console.log('Fetching dashboard statistics');

    // 전체 사용자 수
    const { count: totalUsers, error: usersError } = await supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    if (usersError) throw usersError;

    // 승인 대기 중인 사용자 수
    const { count: pendingUsers, error: pendingError } = await supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    if (pendingError) throw pendingError;

    // 전체 매장 수
    const { count: totalStores, error: storesError } = await supabaseAdmin
      .from('stores')
      .select('*', { count: 'exact', head: true });

    if (storesError) throw storesError;

    // 전체 피드백 수
    const { count: feedbackCount, error: feedbackError } = await supabaseAdmin
      .from('feedback')
      .select('*', { count: 'exact', head: true });

    if (feedbackError) throw feedbackError;

    // 통계 데이터 반환
    return NextResponse.json({
      totalUsers: totalUsers || 0,
      pendingUsers: pendingUsers || 0,
      totalStores: totalStores || 0,
      feedbackCount: feedbackCount || 0,
    });
  } catch (err: any) {
    console.error('Dashboard stats API error:', err);
    return NextResponse.json(
      { error: '통계 데이터를 가져오는 중 오류가 발생했습니다.', details: err.message },
      { status: 500 }
    );
  }
}