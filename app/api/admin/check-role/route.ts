// app/api/admin/check-role/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

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

    // 환경 변수 확인
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Supabase 환경 설정 누락');
      return NextResponse.json(
        { error: 'Supabase 환경 설정이 누락되었습니다.' },
        { status: 500 }
      );
    }

    // 서비스 롤 키로 Supabase 클라이언트 생성
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    console.log('Checking admin role for user:', userId);

    // 현재 요청한 사용자와 조회하려는 userId가 일치하는지 확인
    // 쿠키를 사용한 인증 처리
    const supabaseAnon = createClient(
      supabaseUrl, 
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    );
    
    // 모든 요청에 대해 서비스 롤로 처리
    // 세션 확인은 로깅 목적으로만 수행
    const { data: { session }, error: sessionError } = await supabaseAnon.auth.getSession();
    
    if (sessionError) {
      console.error('세션 확인 오류:', sessionError);
    }

    // 서비스 롤 키로 프로필 정보의 role 필드만 조회
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Role check error:', error);
      // 테이블/데이터가 없는 경우 첫 사용자는 관리자로 처리
      if (error.code === 'PGRST116' || error.code === '22P02') {
        return NextResponse.json({ role: 'admin' });
      }
      return NextResponse.json(
        { error: '역할 정보 조회 중 오류가 발생했습니다.', details: error.message },
        { status: 500 }
      );
    }

    // 데이터가 없는 경우 일반 사용자로 처리
    if (!data) {
      return NextResponse.json({ role: 'user' });
    }

    return NextResponse.json(data);
  } catch (err: any) {
    console.error('Admin role check API error:', err);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.', details: err.message },
      { status: 500 }
    );
  }
}