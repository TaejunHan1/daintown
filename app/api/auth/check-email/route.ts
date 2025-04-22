import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 환경 변수 가져오기
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// 서비스 롤 키로 Supabase 클라이언트 생성
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export async function POST(request: NextRequest) {
  try {
    // 요청 본문에서 이메일 가져오기
    const { email } = await request.json();

    // 이메일 유효성 검사
    if (!email) {
      console.log('이메일이 제공되지 않음');
      return NextResponse.json(
        { error: '이메일이 제공되지 않았습니다.' },
        { status: 400 }
      );
    }

    console.log('이메일 중복 검사 시작:', email);
    
    // Admin API를 통해 사용자 목록 조회
    const { data, error } = await supabaseAdmin.auth.admin.listUsers();
    
    if (error) {
      console.error('사용자 목록 조회 오류:', error);
      return NextResponse.json(
        { error: '사용자 목록 조회 중 오류가 발생했습니다.' },
        { status: 500 }
      );
    }
    
    // 이메일로 사용자 찾기
    const userExists = data.users.some(user => 
      user.email && user.email.toLowerCase() === email.toLowerCase()
    );
    
    console.log('이메일 중복 검사 결과:', userExists ? '존재함' : '존재하지 않음');
    
    return NextResponse.json({ exists: userExists });
    
  } catch (err: any) {
    console.error('이메일 확인 API 오류:', err);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.', details: err.message },
      { status: 500 }
    );
  }
}