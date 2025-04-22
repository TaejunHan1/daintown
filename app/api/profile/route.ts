// app/api/profile/route.ts
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
    const countOnly = searchParams.get('countOnly');

    // countOnly 파라미터가 있으면 전체 사용자 수만 반환
    if (countOnly === 'true') {
      console.log('Fetching total user count');
      
      // profiles 테이블의 전체 사용자 수 조회
      const { count, error } = await supabaseAdmin
        .from('profiles')
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        console.error('User count fetch error:', error);
        return NextResponse.json(
          { error: '사용자 수 조회 중 오류가 발생했습니다.', details: error.message },
          { status: 500 }
        );
      }

      return NextResponse.json({ count: count || 0 });
    }

    // userId 파라미터가 없으면 에러 반환
    if (!userId) {
      return NextResponse.json(
        { error: '사용자 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    console.log('Fetching profile for user:', userId);

    // 서비스 롤 키로 프로필 정보 조회
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Profile fetch error:', error);
      return NextResponse.json(
        { error: '프로필 정보 조회 중 오류가 발생했습니다.', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (err: any) {
    console.error('Profile API error:', err);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.', details: err.message },
      { status: 500 }
    );
  }
}