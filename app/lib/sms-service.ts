// lib/sms-service.ts
import axios from 'axios';
import crypto from 'crypto';

// 솔라피 API 관련 정보
const SOLAPI_API_KEY = process.env.SOLAPI_API_KEY || 'NCS6QWWLNQ6VLV2Z';
const SOLAPI_SENDER = process.env.SOLAPI_SENDER || '01058479358';
const SOLAPI_API_SECRET = process.env.SOLAPI_API_SECRET || ''; // API Secret은 환경변수로 관리해야 합니다

// 솔라피 API URL
const SOLAPI_API_URL = 'https://api.solapi.com/messages/v4/send';

// 인증 헤더 생성 함수
const generateSolapiAuthHeader = () => {
  const date = new Date().toISOString();
  const salt = crypto.randomBytes(32).toString('hex');
  const hmacData = date + salt;
  
  const signature = crypto.createHmac('sha256', SOLAPI_API_SECRET)
    .update(hmacData)
    .digest('hex');
    
  return {
    'Authorization': `HMAC-SHA256 apiKey=${SOLAPI_API_KEY}, date=${date}, salt=${salt}, signature=${signature}`,
    'Content-Type': 'application/json'
  };
};

/**
 * 문자 메시지 발송 함수
 * @param phoneNumber 수신자 전화번호 (하이픈 없는 형식, 예: 01012345678)
 * @param message 발송할 메시지 내용
 */
export const sendSMS = async (phoneNumber: string, message: string): Promise<boolean> => {
  try {
    // 전화번호 형식이 올바른지 확인 (하이픈 제거)
    const cleanPhoneNumber = phoneNumber.replace(/-/g, '');
    
    if (cleanPhoneNumber.length !== 11 || !cleanPhoneNumber.startsWith('010')) {
      throw new Error('유효하지 않은 전화번호 형식입니다.');
    }
    
    // API 요청 데이터 구성
    const requestData = {
      message: {
        to: cleanPhoneNumber,
        from: SOLAPI_SENDER.replace(/-/g, ''),
        text: message
      }
    };
    
    // 솔라피 API 호출
    const response = await axios.post(
      SOLAPI_API_URL,
      requestData,
      { headers: generateSolapiAuthHeader() }
    );
    
    // 응답 검증
    if (response.status === 200 && response.data.statusCode === '2000') {
      console.log('SMS 발송 성공:', response.data);
      return true;
    } else {
      console.error('SMS 발송 실패:', response.data);
      return false;
    }
    
  } catch (error: any) {
    console.error('SMS 발송 중 오류 발생:', error);
    
    // 개발 환경에서는 에러에도 불구하고 성공으로 처리 (테스트 용도)
    if (process.env.NODE_ENV === 'development') {
      console.log('개발 환경: SMS 발송 오류를 무시하고 성공으로 처리');
      return true;
    }
    
    throw new Error(`SMS 발송 실패: ${error.message}`);
  }
};

/**
 * OTP 문자 발송 함수
 * @param phoneNumber 수신자 전화번호
 * @param otpCode OTP 코드
 */
export const sendOTPMessage = async (phoneNumber: string, otpCode: string): Promise<boolean> => {
  const message = `[다인타운] 인증번호는 [${otpCode}]입니다. 인증번호는 3분간 유효합니다.`;
  return await sendSMS(phoneNumber, message);
};