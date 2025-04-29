// app/api/auth/request-otp/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendOTPMessage } from '../../../lib/sms-service';

// 환경 변수 가져오기
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// 서비스 롤 키로 Supabase 클라이언트 생성
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    // 요청 본문에서 전화번호 가져오기
    const { phoneNumber } = await request.json();

    // 전화번호 유효성 검사
    if (!phoneNumber) {
      return NextResponse.json(
        { error: '전화번호가 제공되지 않았습니다.' },
        { status: 400 }
      );
    }

    // 숫자만 추출
    const cleanPhoneNumber = phoneNumber.replace(/\D/g, '');
    
    // 한국 전화번호 형식 검증 (간단한 검증)
    if (cleanPhoneNumber.length !== 11 || !cleanPhoneNumber.startsWith('010')) {
      return NextResponse.json(
        { error: '유효한 전화번호 형식이 아닙니다.' },
        { status: 400 }
      );
    }

    console.log('OTP 요청:', cleanPhoneNumber);
    
    // 6자리 OTP 생성
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // OTP 만료 시간 설정 (3분)
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 3);
    
    // RPC 함수를 사용하여 OTP 생성 (RLS 우회)
    try {
      const { data, error } = await supabaseAdmin.rpc('admin_request_otp', {
        p_phone_number: cleanPhoneNumber,
        p_otp_code: otp,
        p_expires_at: expiresAt.toISOString()
      });
      
      if (error) {
        console.error('OTP 생성 RPC 오류:', error);
        
        // 직접 SQL 방식으로 우회 시도
        try {
          // 기존 OTP 삭제
          await supabaseAdmin.rpc('execute_sql', {
            sql_query: `DELETE FROM phone_verifications WHERE phone_number = '${cleanPhoneNumber}'`
          });
          
          // 새 OTP 삽입
          await supabaseAdmin.rpc('execute_sql', {
            sql_query: `
              INSERT INTO phone_verifications (phone_number, otp_code, expires_at, verified, attempts)
              VALUES ('${cleanPhoneNumber}', '${otp}', '${expiresAt.toISOString()}', false, 0)
            `
          });
        } catch (sqlError) {
          console.error('직접 SQL 실행 오류:', sqlError);
          throw new Error('OTP 생성 중 오류가 발생했습니다: ' + error.message);
        }
      }
    } catch (rpcError) {
      console.error('RPC 함수 호출 오류:', rpcError);
      return NextResponse.json(
        { error: 'OTP 생성 중 오류가 발생했습니다.' },
        { status: 500 }
      );
    }
    
    // 솔라피 API를 사용한 실제 문자 발송
    try {
      // SMS 발송 시도
      const smsSent = await sendOTPMessage(cleanPhoneNumber, otp);
      
      if (!smsSent && process.env.NODE_ENV !== 'development') {
        throw new Error('SMS 발송에 실패했습니다.');
      }
      
      // 개발 환경에서는 콘솔에 OTP 출력 (테스트 용도)
      if (process.env.NODE_ENV === 'development') {
        console.log(`개발 환경 OTP 코드: ${otp}`);
      }
      
      return NextResponse.json({ 
        success: true, 
        message: '인증번호가 발송되었습니다.',
        // 개발 환경에서만 OTP 코드 포함
        dev_otp: process.env.NODE_ENV === 'development' ? otp : undefined
      });
    } catch (smsError: any) {
      console.error('SMS 발송 오류:', smsError);
      
      // 개발 환경에서는 SMS 발송 실패해도 성공으로 처리
      if (process.env.NODE_ENV === 'development') {
        return NextResponse.json({ 
          success: true, 
          message: '개발 환경: SMS 발송 오류가 있지만 인증번호가 생성되었습니다.',
          dev_otp: otp
        });
      }
      
      // 실제 환경에서는 SMS 발송 실패 시 에러 반환
      return NextResponse.json(
        { error: '인증번호 발송에 실패했습니다. 잠시 후 다시 시도해주세요.' },
        { status: 500 }
      );
    }
    
  } catch (err: any) {
    console.error('OTP 요청 API 오류:', err);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.', details: err.message },
      { status: 500 }
    );
  }
}

