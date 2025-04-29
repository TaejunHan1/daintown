// app/api/auth/confirm-email/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 환경 변수 가져오기
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// 서비스 롤 키로 Supabase 클라이언트 생성 (RLS 우회)
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    // 요청 데이터 파싱
    const { email } = await request.json();

    // 이메일 유효성 검사
    if (!email) {
      return NextResponse.json(
        { error: '이메일이 제공되지 않았습니다.' },
        { status: 400 }
      );
    }

    console.log(`사용자 이메일 확인 처리 중: ${email}`);

    try {
      // 1. 올바른 SQL 쿼리로 사용자 조회
      const { data: userData, error: userError } = await supabaseAdmin.rpc('execute_sql', {
        sql_query: `
          SELECT id, email FROM auth.users 
          WHERE email = '${email}'
          LIMIT 1
        `
      });
      
      console.log('사용자 조회 결과:', userData);
      
      if (userError || !userData || userData.length === 0) {
        console.error('사용자 조회 오류:', userError);
        return NextResponse.json(
          { error: '해당 이메일로 등록된 사용자를 찾을 수 없습니다.' },
          { status: 404 }
        );
      }
      
      // 사용자 ID 가져오기
      const userId = userData[0].id;
      
      // 2. 이메일 확인 상태 업데이트
      const { error: updateError } = await supabaseAdmin.rpc('execute_sql', {
        sql_query: `
          UPDATE auth.users
          SET email_confirmed_at = CURRENT_TIMESTAMP
          WHERE id = '${userId}'
        `
      });
      
      if (updateError) {
        console.error('이메일 확인 상태 업데이트 오류:', updateError);
        return NextResponse.json(
          { error: '이메일 확인 상태 업데이트 중 오류가 발생했습니다.' },
          { status: 500 }
        );
      }
      
      // 3. 업데이트 확인
      const { data: verifyData, error: verifyError } = await supabaseAdmin.rpc('execute_sql', {
        sql_query: `
          SELECT id, email, email_confirmed_at 
          FROM auth.users 
          WHERE id = '${userId}'
        `
      });
      
      console.log('업데이트 후 사용자 데이터:', verifyData);
      
      return NextResponse.json({
        success: true,
        message: '이메일이 성공적으로 확인되었습니다.'
      });
      
    } catch (dbError: any) {
      console.error('데이터베이스 작업 오류:', dbError);
      return NextResponse.json(
        { error: '이메일 확인 처리 중 오류가 발생했습니다.', details: dbError.message },
        { status: 500 }
      );
    }
  } catch (err: any) {
    console.error('이메일 확인 API 오류:', err);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.', details: err.message },
      { status: 500 }
    );
  }
}