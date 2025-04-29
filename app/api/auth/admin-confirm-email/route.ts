// app/api/auth/admin-confirm-email/route.ts
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

    console.log(`Admin API로 이메일 확인 처리 중: ${email}`);

    try {
      // 1. Supabase Admin API를 사용하여 사용자 조회
      const { data: userData, error: userError } = await supabaseAdmin.auth.admin.listUsers();
      
      if (userError) {
        console.error('Admin API 사용자 목록 조회 오류:', userError);
        return NextResponse.json(
          { error: '사용자 목록을 가져오는 중 오류가 발생했습니다.' },
          { status: 500 }
        );
      }
      
      // 2. 이메일로 사용자 찾기
      const user = userData.users.find(u => u.email === email);
      
      if (!user) {
        console.error('해당 이메일의 사용자를 찾을 수 없음:', email);
        return NextResponse.json(
          { error: '해당 이메일로 등록된 사용자를 찾을 수 없습니다.' },
          { status: 404 }
        );
      }
      
      console.log('사용자 찾음:', user.id, user.email);
      
      // 3. 이미 이메일이 확인된 경우 바로 성공 반환
      if (user.email_confirmed_at) {
        console.log('이메일이 이미 확인됨:', user.email_confirmed_at);
        return NextResponse.json({
          success: true,
          message: '이메일이 이미 확인되었습니다.'
        });
      }
      
      // 4. Admin API를 사용하여 이메일 확인 상태 업데이트 (올바른 속성 사용)
      // 타입스크립트 오류로 인해 email_confirm 속성으로 변경
      const { data: updateData, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        user.id,
        { 
          email_confirm: true,
          // 또는 app_metadata에 저장하는 방법 사용
          app_metadata: {
            ...user.app_metadata,
            email_confirmed: true,
            email_confirmed_at: new Date().toISOString()
          }
        }
      );
      
      if (updateError) {
        console.error('이메일 확인 상태 업데이트 오류:', updateError);
        return NextResponse.json(
          { error: '이메일 확인 상태를 업데이트하는 중 오류가 발생했습니다.' },
          { status: 500 }
        );
      }
      
      console.log('이메일 확인 성공:', updateData);
      
      return NextResponse.json({
        success: true,
        message: '이메일이 성공적으로 확인되었습니다.'
      });
      
    } catch (apiError: any) {
      console.error('Admin API 오류:', apiError);
      return NextResponse.json(
        { error: '이메일 확인 처리 중 오류가 발생했습니다.', details: apiError.message },
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