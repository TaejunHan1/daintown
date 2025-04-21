// app/auth/callback/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    // Supabase 클라이언트 생성
    const supabase = createRouteHandlerClient({ cookies });
    
    // code를 사용하여 사용자 세션 교환
    await supabase.auth.exchangeCodeForSession(code);
  }

  // 이메일 확인 완료 페이지로 리디렉션
  return NextResponse.redirect(new URL('/auth/email-confirmed', request.url));
}