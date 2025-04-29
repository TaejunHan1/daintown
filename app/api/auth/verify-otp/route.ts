import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 환경 변수 가져오기
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// 서비스 롤 키로 Supabase 클라이언트 생성
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    // 요청 본문에서 전화번호와 OTP 코드 가져오기
    const { phoneNumber, otpCode } = await request.json();
    
    console.log('요청된 데이터:', { phoneNumber, otpCode });

    // 파라미터 유효성 검사
    if (!phoneNumber || !otpCode) {
      console.log('유효성 검사 실패: 전화번호 또는 OTP 누락');
      return NextResponse.json(
        { error: '전화번호와 인증번호가 모두 필요합니다.' },
        { status: 400 }
      );
    }

    // 숫자만 추출
    const cleanPhoneNumber = phoneNumber.replace(/\D/g, '');
    
    console.log('OTP 확인 요청:', cleanPhoneNumber, otpCode);
    
    // 개발 환경에서 하드코딩된 OTP 코드로 우회
    if (process.env.NODE_ENV === 'development' && otpCode === '999999') {
      console.log('개발 환경: 테스트 OTP 코드 인증 성공');
      return NextResponse.json({ 
        success: true, 
        message: '휴대폰 번호가 성공적으로 인증되었습니다.' 
      });
    }
    
    // 직접 데이터베이스 조회
    try {
      // 1. 먼저 OTP 레코드가 있는지 확인 (디버깅)
      console.log('DB 조회 시작');
      const { data: checkData, error: checkError } = await supabaseAdmin
        .from('phone_verifications')
        .select('*')
        .eq('phone_number', cleanPhoneNumber)
        .limit(1);
      
      if (checkError) {
        console.error('전화번호 조회 오류:', checkError);
      } else {
        console.log('전화번호 조회 결과:', checkData);
      }
      
      // 2. 현재 시간 (ISO 형식)
      const now = new Date().toISOString();
      console.log('현재 시간:', now);
      
      // 3. 직접 OTP 확인 쿼리
      console.log('OTP 확인 쿼리 실행');
      const { data: verifyData, error: verifyError } = await supabaseAdmin
        .from('phone_verifications')
        .select('*')
        .eq('phone_number', cleanPhoneNumber)
        .eq('otp_code', otpCode)
        .gt('expires_at', now)
        .limit(1);
      
      if (verifyError) {
        console.error('OTP 확인 쿼리 오류:', verifyError);
        throw new Error('OTP 확인 중 오류: ' + verifyError.message);
      }
      
      console.log('OTP 확인 결과:', verifyData);
      
      // 4. 결과 확인
      if (verifyData && verifyData.length > 0) {
        // 성공: OTP 레코드 업데이트
        console.log('유효한 OTP 발견, 업데이트 중');
        const { error: updateError } = await supabaseAdmin
          .from('phone_verifications')
          .update({ verified: true })
          .eq('phone_number', cleanPhoneNumber)
          .eq('otp_code', otpCode);
        
        if (updateError) {
          console.error('OTP 업데이트 오류:', updateError);
        }
        
        console.log('OTP 확인 성공');
        return NextResponse.json({ 
          success: true, 
          message: '휴대폰 번호가 성공적으로 인증되었습니다.' 
        });
      } else {
        // 실패: 유효한 OTP 없음
        console.log('유효한 OTP를 찾을 수 없음');
        
        // 혹시 OTP는 있지만 만료된 건지 확인 (디버깅)
        const { data: expiredData } = await supabaseAdmin
          .from('phone_verifications')
          .select('*')
          .eq('phone_number', cleanPhoneNumber)
          .eq('otp_code', otpCode)
          .limit(1);
        
        if (expiredData && expiredData.length > 0) {
          const expiryTime = new Date(expiredData[0].expires_at);
          const currentTime = new Date();
          console.log('OTP 존재하지만 만료됨:', {
            expiry: expiryTime.toISOString(),
            current: currentTime.toISOString(),
            diff_seconds: Math.floor((currentTime.getTime() - expiryTime.getTime()) / 1000)
          });
        }
        
        return NextResponse.json(
          { error: '유효하지 않은 인증번호입니다. 다시 확인해주세요.' },
          { status: 400 }
        );
      }
    } catch (dbError: any) {
      console.error('데이터베이스 작업 오류:', dbError);
      
      // 개발 환경에서는 백업 인증 허용
      if (process.env.NODE_ENV === 'development') {
        console.log('개발 환경: 백업 인증 로직 실행');
        
        // 테스트용 OTP 코드 또는 마지막 6자리 전화번호와 일치하면 성공 처리
        const lastSixDigits = cleanPhoneNumber.slice(-6);
        if (otpCode === '999999' || otpCode === lastSixDigits) {
          console.log('개발 환경: 백업 인증 성공');
          return NextResponse.json({
            success: true,
            message: '개발 환경: 휴대폰 번호가 인증되었습니다 (백업 인증).'
          });
        }
      }
      
      return NextResponse.json(
        { error: 'OTP 확인 중 데이터베이스 오류가 발생했습니다.', details: dbError.message },
        { status: 500 }
      );
    }
  } catch (err: any) {
    console.error('OTP 확인 API 오류:', err);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.', details: err.message },
      { status: 500 }
    );
  }
}