'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import supabase from '@/lib/supabase';
import Signature from '@/components/ui/Signature';

interface Store {
  id: string;
  name: string;
  floor: string;
  unit_number: string;
  business_type: string;
}

// 다양한 한글 폰트 옵션 추가 (약 30개)
const fontOptions = [
  { id: 'gowundodum', name: '고운돋움', value: "'Gowun Dodum', sans-serif", preview: "안녕하세요" },
  { id: 'songmyung', name: '송명체', value: "'Song Myung', serif", preview: "안녕하세요" },
  { id: 'gaemildam', name: '개밀당체', value: "'Gaemildam', cursive", preview: "안녕하세요" },
  { id: 'dohyeon', name: '도현체', value: "'Do Hyeon', sans-serif", preview: "안녕하세요" },
  { id: 'yangjin', name: '양진체', value: "'Yangjin', cursive", preview: "안녕하세요" },
  { id: 'nanumpen', name: '나눔 펜', value: "'Nanum Pen Script', cursive", preview: "안녕하세요" },
  { id: 'jejugothic', name: '제주고딕', value: "'Jeju Gothic', sans-serif", preview: "안녕하세요" },
  { id: 'nanumbrush', name: '나눔 브러시', value: "'Nanum Brush Script', cursive", preview: "안녕하세요" },
  { id: 'nanumgothic', name: '나눔 고딕', value: "'Nanum Gothic', sans-serif", preview: "안녕하세요" },
  { id: 'nanumsquare', name: '나눔 스퀘어', value: "'NanumSquare', sans-serif", preview: "안녕하세요" },
  { id: 'nanumsquareround', name: '나눔스퀘어라운드', value: "'NanumSquareRound', sans-serif", preview: "안녕하세요" },
  { id: 'nanumbarunpen', name: '나눔바른펜', value: "'NanumBarunpen', cursive", preview: "안녕하세요" },
  { id: 'nanummyeongjo', name: '나눔명조', value: "'Nanum Myeongjo', serif", preview: "안녕하세요" },
  { id: 'kopubbatang', name: '코펍바탕', value: "'KoPub Batang', serif", preview: "안녕하세요" },
  { id: 'hahmlet', name: '함렛', value: "'Hahmlet', serif", preview: "안녕하세요" },
  { id: 'blackhansans', name: '블랙한산스', value: "'Black Han Sans', sans-serif", preview: "안녕하세요" },
  { id: 'jua', name: '주아체', value: "'Jua', sans-serif", preview: "안녕하세요" },
  { id: 'eastseadokdo', name: '동해독도체', value: "'East Sea Dokdo', cursive", preview: "안녕하세요" },
  { id: 'hanna', name: '한나체', value: "'Hanna', sans-serif", preview: "안녕하세요" },
  { id: 'hannaaira', name: '한나에어', value: "'Hanna Air', sans-serif", preview: "안녕하세요" },
  { id: 'gyeonggimedium', name: '경기체 미디움', value: "'Gyeonggi Medium', sans-serif", preview: "안녕하세요" },
  { id: 'gyeonggibold', name: '경기체 볼드', value: "'Gyeonggi Bold', sans-serif", preview: "안녕하세요" },
  { id: 'gmarket', name: '지마켓 산스', value: "'GmarketSans', sans-serif", preview: "안녕하세요" },
  { id: 'pretendard', name: '프리텐다드', value: "'Pretendard', sans-serif", preview: "안녕하세요" },
  { id: 'spoqahansans', name: '스포카 한 산스', value: "'Spoqa Han Sans', sans-serif", preview: "안녕하세요" },
  { id: 'sunbatang', name: '순바탕', value: "'SunBatang', serif", preview: "안녕하세요" },
  { id: 'kcceunyoung', name: 'KCC은영체', value: "'KCC-eunyoung', cursive", preview: "안녕하세요" },
  { id: 'applegothic', name: '애플고딕', value: "'Apple Gothic', sans-serif", preview: "안녕하세요" },
  { id: 'malgun', name: '맑은 고딕', value: "'Malgun Gothic', sans-serif", preview: "안녕하세요" },
  { id: 'batang', name: '바탕체', value: "'Batang', serif", preview: "안녕하세요" }
];

export default function Register() {
  const router = useRouter();

  // 기본 상태 정보
  const [fullName, setFullName] = useState('');
  const [signatureData, setSignatureData] = useState<string>('');
  const [selectedStore, setSelectedStore] = useState<string>('');
  const [selectedStoreName, setSelectedStoreName] = useState<string>('');
  const [userType, setUserType] = useState<string>('tenant');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [businessDoc, setBusinessDoc] = useState<File | null>(null);
  const [selectedFont, setSelectedFont] = useState(fontOptions[0]);

  // UI 상태 관리
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [animateDirection, setAnimateDirection] = useState<'forward' | 'backward'>('forward');
  const [isTransitioning, setIsTransitioning] = useState(false);

  // 매장 관련 상태
  const [stores, setStores] = useState<Store[]>([]);
  const [storesLoading, setStoresLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isFontDropdownOpen, setIsFontDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // 인증 관련 상태
  const [phoneVerificationStep, setPhoneVerificationStep] = useState(0); // 0: 시작 안함, 1: OTP 요청됨, 2: 인증 완료
  const [otpCode, setOtpCode] = useState('');
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [otpResendCountdown, setOtpResendCountdown] = useState(0);

  // 이메일 확인 상태
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [emailAvailable, setEmailAvailable] = useState<boolean | null>(null);

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const fontDropdownRef = useRef<HTMLDivElement>(null);
  const emailCheckTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const otpInputRef = useRef<HTMLInputElement>(null);
  
  // 사용자 안내 메시지 - 더 자세한 설명으로 확장
  const stepHints = {
    1: '법적 효력이 있는 서명을 위해 실명을 입력해주세요. 이후 계약서 및 공식 문서에 사용됩니다.',
    2: '자필 서명은 전자계약 및 결제 요청 시 법적 효력이 있는 서명으로 사용됩니다.',
    3: '소속된 매장 정보는 상인회 활동 및 매장 관리에 활용됩니다.',
    4: '임대인은 상가 소유자, 임차인은 매장 운영자입니다. 권한과 기능이 다르게 제공됩니다.',
    5: '이메일은 로그인 아이디 및 중요 알림 수신에 사용됩니다. 자주 사용하는 이메일을 입력해주세요.',
    6: '휴대폰 번호 인증은 본인 확인 및 계정 보안 강화를 위해 필요합니다.',
    7: '안전한 계정 보호를 위해 영문, 숫자, 특수문자 조합으로 비밀번호를 설정해주세요.',
    // 8: '사업자 등록증은 매장 인증 및 세금계산서 발행 등에 활용됩니다.'
  };

  // 폰트 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (fontDropdownRef.current && !fontDropdownRef.current.contains(event.target as Node)) {
        setIsFontDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // 애니메이션 및 전환 관리
  const handleNextStep = () => {
    const isValid = validateCurrentStep();
    if (!isValid) return;

    setAnimateDirection('forward');
    setIsTransitioning(true);
    
    setTimeout(() => {
      setCurrentStep(prev => prev + 1);
      setIsTransitioning(false);
    }, 300);
  };

  const handlePrevStep = () => {
    if (currentStep === 1) return;
    
    setAnimateDirection('backward');
    setIsTransitioning(true);
    
    setTimeout(() => {
      setCurrentStep(prev => prev - 1);
      setIsTransitioning(false);
    }, 300);
  };

  // 현재 단계 유효성 검사
  const validateCurrentStep = () => {
    let isValid = true;
    const newErrors: {[key: string]: string} = {};

    switch (currentStep) {
      case 1: // 이름
        if (!fullName.trim()) {
          newErrors.fullName = '이름을 입력해주세요';
          isValid = false;
        } else if (fullName.trim().length < 2) {
          newErrors.fullName = '올바른 이름을 입력해주세요';
          isValid = false;
        }
        break;
      case 2: // 서명
        if (!signatureData) {
          newErrors.signature = '서명이 필요합니다';
          isValid = false;
        }
        break;
      case 3: // 매장 선택
        if (!selectedStore) {
          newErrors.store = '매장을 선택해주세요';
          isValid = false;
        }
        break;
      case 4: // 사용자 유형
        if (!userType) {
          newErrors.userType = '사용자 유형을 선택해주세요';
          isValid = false;
        }
        break;
      case 5: // 이메일
        if (!email) {
          newErrors.email = '이메일을 입력해주세요';
          isValid = false;
        } else if (!/\S+@\S+\.\S+/.test(email)) {
          newErrors.email = '올바른 이메일 형식이 아닙니다';
          isValid = false;
        } else if (emailAvailable === false) {
          newErrors.email = '이미 등록된 이메일입니다';
          isValid = false;
        } else if (emailAvailable === null && !isCheckingEmail) {
          // 이메일 중복 체크가 아직 완료되지 않았으면 체크 실행
          checkEmailAvailability(email);
          isValid = false;
          newErrors.email = '이메일 확인 중입니다';
        }
        break;
      case 6: // 휴대폰 인증
        if (!phoneVerified) {
          newErrors.phoneVerification = '휴대폰 인증이 필요합니다';
          isValid = false;
        }
        break;
      case 7: // 비밀번호
        if (!password) {
          newErrors.password = '비밀번호를 입력해주세요';
          isValid = false;
        } else if (password.length < 6) {
          newErrors.password = '비밀번호는 6자 이상이어야 합니다';
          isValid = false;
        } else if (!confirmPassword) {
          newErrors.confirmPassword = '비밀번호 확인을 입력해주세요';
          isValid = false;
        } else if (password !== confirmPassword) {
          newErrors.confirmPassword = '비밀번호가 일치하지 않습니다';
          isValid = false;
        }
        break;
    }

    setErrors(newErrors);
    return isValid;
  };

  // 전체 폼 유효성 검사
  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!fullName) newErrors.fullName = '이름을 입력해주세요';
    if (!signatureData) newErrors.signature = '서명이 필요합니다';
    if (!selectedStore) newErrors.store = '매장을 선택해주세요';
    if (!userType) newErrors.userType = '사용자 유형을 선택해주세요';
    
    if (!email) newErrors.email = '이메일을 입력해주세요';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = '올바른 이메일 형식이 아닙니다';
    else if (emailAvailable === false) newErrors.email = '이미 등록된 이메일입니다';
    
    if (!phoneNumber) newErrors.phoneNumber = '연락처를 입력해주세요';
    if (!phoneVerified) newErrors.phoneVerification = '휴대폰 인증이 필요합니다';
    
    if (!password) newErrors.password = '비밀번호를 입력해주세요';
    else if (password.length < 6) newErrors.password = '비밀번호는 6자 이상이어야 합니다';
    
    if (!confirmPassword) newErrors.confirmPassword = '비밀번호 확인을 입력해주세요';
    else if (password !== confirmPassword) newErrors.confirmPassword = '비밀번호가 일치하지 않습니다';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // OTP 재발송 카운트다운
  useEffect(() => {
    if (otpResendCountdown > 0) {
      const timer = setTimeout(() => {
        setOtpResendCountdown(otpResendCountdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [otpResendCountdown]);

  // 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // 매장 목록 가져오기
  useEffect(() => {
    const fetchStores = async () => {
      if (currentStep === 3) {
        setStoresLoading(true);
        try {
          const response = await fetch('/api/admin/stores');
          
          if (!response.ok) {
            throw new Error('매장 목록을 가져오는 중 오류가 발생했습니다.');
          }
          
          const storeData = await response.json();
          console.log('매장 데이터 로드됨:', storeData);
          
          if (!storeData || storeData.length === 0) {
            console.warn('매장 데이터가 비어있습니다.');
          }
          
          setStores(storeData || []);
        } catch (error) {
          console.error('Error fetching stores:', error);
          setGeneralError('매장 정보를 불러오는 중 오류가 발생했습니다. 관리자에게 문의하세요.');
        } finally {
          setStoresLoading(false);
        }
      }
    };

    fetchStores();
  }, [currentStep]);

  // 타임아웃 정리
  useEffect(() => {
    return () => {
      if (emailCheckTimeoutRef.current) {
        clearTimeout(emailCheckTimeoutRef.current);
      }
    };
  }, []);

  // OTP 입력 필드에 자동 포커스
  useEffect(() => {
    if (phoneVerificationStep === 1 && otpInputRef.current) {
      setTimeout(() => {
        otpInputRef.current?.focus();
      }, 100);
    }
  }, [phoneVerificationStep]);

  // 이메일 중복 확인 함수
  const checkEmailAvailability = async (emailToCheck: string) => {
    try {
      setIsCheckingEmail(true);
      
      console.log('이메일 중복 확인 요청:', emailToCheck);
      
      // 서버 측 API를 통해 이메일 중복 확인
      const response = await fetch('/api/auth/check-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: emailToCheck }),
      });
      
      const data = await response.json();
      console.log('이메일 중복 확인 응답:', data);
      
      if (response.ok) {
        if (data.exists === true) {
          // 이메일이 이미 존재함
          console.log('이메일이 이미 존재합니다');
          setEmailAvailable(false);
          setErrors(prev => ({ ...prev, email: '이미 등록된 이메일입니다' }));
        } else {
          // 이메일이 존재하지 않음
          console.log('이메일 사용 가능');
          setEmailAvailable(true);
          setErrors(prev => ({ ...prev, email: '' }));
        }
      } else {
        // API 오류 발생
        console.error('이메일 확인 API 오류:', data.error);
        setEmailAvailable(null);
        setErrors(prev => ({ ...prev, email: '이메일 확인 중 오류가 발생했습니다' }));
      }
    } catch (err) {
      console.error('이메일 중복 확인 처리 오류:', err);
      setEmailAvailable(null);
      setErrors(prev => ({ ...prev, email: '서버 연결 중 오류가 발생했습니다' }));
    } finally {
      setIsCheckingEmail(false);
    }
  };

  // 이메일 변경 핸들러
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    
    // 기존 타임아웃 클리어
    if (emailCheckTimeoutRef.current) {
      clearTimeout(emailCheckTimeoutRef.current);
    }
    
    // 이메일 상태 초기화
    setErrors(prev => ({ ...prev, email: '' }));
    setEmailAvailable(null);
    
    // 이메일이 비어있거나 형식이 올바르지 않으면 중복 확인 상태 초기화
    if (!newEmail) {
      setErrors(prev => ({ ...prev, email: '이메일을 입력해주세요' }));
      return;
    }
    
    if (!/\S+@\S+\.\S+/.test(newEmail)) {
      setErrors(prev => ({ ...prev, email: '올바른 이메일 형식이 아닙니다' }));
      return;
    }
    
    // 이메일 형식이 올바르면 중복 확인 상태 업데이트 중으로 설정
    setIsCheckingEmail(true);
    
    // 타이핑 멈춘 후 500ms 후에 중복 확인 실행
    emailCheckTimeoutRef.current = setTimeout(() => {
      checkEmailAvailability(newEmail);
    }, 500);
  };

  // 휴대폰 번호 변경 핸들러
  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newPhone = e.target.value.replace(/[^0-9-]/g, ''); // 숫자와 하이픈만 허용
    
    // 자동으로 하이픈 추가
    if (newPhone.length > 0) {
      newPhone = newPhone.replace(/-/g, ''); // 모든 하이픈 제거
      if (newPhone.length <= 3) {
        // 첫 3자리까지는 그대로
      } else if (newPhone.length <= 7) {
        // 4-7자리는 xxx-xxxx 형식
        newPhone = `${newPhone.slice(0, 3)}-${newPhone.slice(3)}`;
      } else {
        // 8자리 이상은 xxx-xxxx-xxxx 형식
        newPhone = `${newPhone.slice(0, 3)}-${newPhone.slice(3, 7)}-${newPhone.slice(7, 11)}`;
      }
    }
    
    setPhoneNumber(newPhone);
    
    // 인증이 완료된 상태에서 번호가 변경되면 인증 상태 초기화
    if (phoneVerified && newPhone !== phoneNumber) {
      setPhoneVerified(false);
      setPhoneVerificationStep(0);
      setErrors(prev => ({ ...prev, phoneVerification: '번호가 변경되어 재인증이 필요합니다' }));
    }
    
    setErrors(prev => ({ ...prev, phoneNumber: '' }));
  };

  // OTP 요청 함수
  const requestOTP = async () => {
    // 전화번호 형식 확인
    const cleanPhoneNumber = phoneNumber.replace(/-/g, '');
    if (!cleanPhoneNumber || cleanPhoneNumber.length !== 11 || !cleanPhoneNumber.startsWith('010')) {
      setErrors(prev => ({ ...prev, phoneNumber: '올바른 전화번호를 입력해주세요' }));
      return;
    }
    
    setOtpSending(true);
    setErrors(prev => ({ ...prev, phoneVerification: '' }));
    
    try {
      const response = await fetch('/api/auth/request-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber: cleanPhoneNumber }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || '인증번호 발송에 실패했습니다');
      }
      
      // 성공
      setPhoneVerificationStep(1);
      setOtpResendCountdown(180); // 3분 타이머 시작
      setErrors(prev => ({ ...prev, otpSent: '인증번호가 발송되었습니다. 3분 이내에 입력해주세요.' }));
      
      // OTP 입력 필드에 포커스
      setTimeout(() => {
        if (otpInputRef.current) {
          otpInputRef.current.focus();
        }
      }, 100);
    } catch (error: any) {
      console.error('OTP request error:', error);
      setErrors(prev => ({ ...prev, phoneVerification: error.message || '인증번호 발송 중 오류가 발생했습니다' }));
    } finally {
      setOtpSending(false);
    }
  };

  // OTP 확인 함수
  const verifyOTP = async () => {
    if (!otpCode || otpCode.length !== 6) {
      setErrors(prev => ({ ...prev, phoneVerification: '6자리 인증번호를 입력해주세요' }));
      return;
    }
    
    setOtpVerifying(true);
    setErrors(prev => ({ ...prev, phoneVerification: '' }));
    
    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          phoneNumber: phoneNumber.replace(/-/g, ''),
          otpCode
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        // 토스 스타일 에러 처리
        setErrors(prev => ({ 
          ...prev, 
          phoneVerification: data.error || '인증번호 확인에 실패했습니다' 
        }));
        return;
      }
      
      // 성공
      setPhoneVerified(true);
      setPhoneVerificationStep(2);
      setErrors(prev => ({ ...prev, phoneNumber: '', phoneVerification: '' }));
    } catch (error: any) {
      console.error('OTP verification error:', error);
      setErrors(prev => ({ 
        ...prev, 
        phoneVerification: error.message || '인증번호 확인 중 오류가 발생했습니다' 
      }));
    } finally {
      setOtpVerifying(false);
    }
  };

  // 매장 선택 핸들러
  const handleStoreSelect = (store: Store) => {
    setSelectedStore(store.id);
    setSelectedStoreName(`${store.name} (${store.floor} ${store.unit_number})`);
    setIsDropdownOpen(false);
    setErrors(prev => ({ ...prev, store: '' }));
  };

  // 검색어에 따른 매장 필터링
  const filteredStores = stores.filter(store => 
    store.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    store.floor.toLowerCase().includes(searchTerm.toLowerCase()) || 
    store.unit_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (store.business_type && store.business_type.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // 파일 업로드 핸들러
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors({ ...errors, businessDoc: '파일 크기는 5MB 이하여야 합니다' });
        return;
      }
      
      const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        setErrors({ ...errors, businessDoc: 'JPG, PNG, PDF 파일만 업로드 가능합니다' });
        return;
      }
      
      setBusinessDoc(file);
      setErrors({ ...errors, businessDoc: '' });
    }
  };

  // 파일 입력 트리거
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // 서명 변경 핸들러
  const handleSignatureChange = (data: string) => {
    setSignatureData(data);
    if (data) {
      setErrors({ ...errors, signature: '' });
    }
  };

  // 회원가입 제출 핸들러
  const handleRegister = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setGeneralError(null);
  
    try {
      // 1. 사용자 계정 생성 (이메일 확인 옵션 활성화)
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone_number: phoneNumber,
            signature: signatureData
          },
          // 이메일 확인은 건너뛰지만, 관리자 승인은 필요
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
  
      if (authError) {
        throw authError;
      }
  
      if (!authData.user) {
        throw new Error('회원가입 중 오류가 발생했습니다.');
      }
  
      // 2. 사업자 등록증 업로드 (선택사항)
      let businessDocUrl = null;
      if (businessDoc) {
        try {
          // 파일 경로 단순화
          const fileName = `${Date.now()}_${businessDoc.name}`;
          
          // 파일 업로드 시도
          const { data: fileData, error: fileError } = await supabase.storage
            .from('businessdocuments')
            .upload(fileName, businessDoc, {
              cacheControl: '3600',
              upsert: true // 동일 경로에 파일이 있을 경우 덮어쓰기
            });
  
          if (fileError) {
            console.error('File upload error:', fileError);
            throw fileError;
          }
  
          // 파일 URL 생성
          const { data } = supabase.storage
            .from('businessdocuments')
            .getPublicUrl(fileName);
            
          businessDocUrl = data.publicUrl;
        } catch (error: any) {
          console.error('File processing error:', error);
          // 사업자 등록증 선택사항이므로 오류가 발생해도 계속 진행
          console.warn('사업자 등록증 업로드 실패, 프로필 정보는 계속 저장합니다.');
        }
      }
  
      // 3. 프로필 정보를 직접 서버로 전송 - status를 pending으로 설정하여 관리자 승인 필요하게 함
      try {
        // API 방식으로 전송
        const response = await fetch('/api/auth/register-profile', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: authData.user.id,
            fullName: fullName,
            phoneNumber: phoneNumber,
            businessDocUrl: businessDocUrl,
            signatureData: signatureData,
            verified: true, // 휴대폰 인증 완료
            status: 'pending', // 관리자 승인 대기 상태로 설정
          }),
        });
  
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || errorData.error || '프로필 정보 저장 중 오류가 발생했습니다');
        }
      } catch (error: any) {
        console.error('Profile update error:', error);
        throw new Error('프로필 정보 저장 중 오류가 발생했습니다: ' + error.message);
      }
      
      // 4. 매장-사용자 연결 정보 저장
      try {
        const response = await fetch('/api/auth/store-user', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: authData.user.id,
            storeId: selectedStore,
            userType: userType,
          }),
        });
  
        const storeUserData = await response.json();
        
        // 성공 응답이 돌아오면 진행, 실패해도 회원가입 프로세스는 계속
        if (!storeUserData.success) {
          console.warn('매장 연결 정보 저장 실패:', storeUserData);
          console.warn('관리자 수동 작업 필요: 다음 정보를 기록하세요');
          console.warn(`사용자 ID: ${authData.user.id}`);
          console.warn(`매장 ID: ${selectedStore}`);
          console.warn(`사용자 유형: ${userType}`);
        } else {
          console.log('매장 연결 응답:', storeUserData);
          
          if (storeUserData.adminRequired || storeUserData.adminNote) {
            console.warn('관리자 수동 작업 필요: 사용자 ID, 매장, 역할 정보를 기록해두세요.');
            console.warn(`사용자 ID: ${authData.user.id}`);
            console.warn(`매장 ID: ${selectedStore}`);
            console.warn(`사용자 유형: ${userType}`);
          }
        }
      } catch (error: any) {
        console.error('Store-user connection error:', error);
        console.error('연결 실패 상세 정보:', error.message);
        console.warn('관리자 수동 대응 필요: 다음 정보를 별도 기록하세요');
        console.warn(`사용자 ID: ${authData.user.id}`);
        console.warn(`매장 ID: ${selectedStore}`);
        console.warn(`사용자 유형: ${userType}`);
      }
  
      // 회원가입 성공 처리
      setSuccess(true);
      
      // 승인 대기 상태이므로 로그아웃
      await supabase.auth.signOut();
      
    } catch (error: any) {
      console.error('회원가입 오류:', error);
      
      // 구체적인 에러 메시지 처리
      if (error.message.includes('bucket') || error.message.includes('Bucket not found')) {
        setGeneralError('저장소 오류: 시스템 관리자에게 문의해주세요');
      } else if (error.message.includes('already registered')) {
        setErrors({ ...errors, email: '이미 등록된 이메일입니다' });
      } else {
        setGeneralError(error.message || '회원가입 중 오류가 발생했습니다');
      }
    } finally {
      setLoading(false);
    }
  };

  // 진행률 계산
  const progressPercentage = (currentStep / 8) * 100;

  // 단계별 폼 렌더링
  const renderStepContent = () => {
    switch (currentStep) {
      case 1: // 이름 입력
        return (
          <div className={`transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
            <div className="mb-2 text-sm text-gray-500">
              {stepHints[1]}
            </div>
            <label htmlFor="fullName" className="block text-xl font-medium text-[#333] mb-3">
              {userType === 'landlord' ? '임대인' : '임차인'}의 실명을 입력해주세요
            </label>
            <input
              id="fullName"
              type="text"
              className={`w-full px-4 py-4 text-lg rounded-xl border ${errors.fullName ? "border-[#FF4E4E] bg-[#FFF5F5]" : "border-gray-200"} focus:outline-none focus:ring-2 focus:ring-[#0F6FFF] focus:border-transparent transition-colors`}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="이름 입력 (실명)"
              autoFocus
            />
            {errors.fullName && (
              <p className="mt-2 text-[#FF4E4E] text-sm flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                {errors.fullName}
              </p>
            )}

            <div className="mt-4 p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
              <div className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="font-medium mb-1">입력하신 이름은 다음과 같은 용도로 사용됩니다:</p>
                  <ul className="list-disc list-inside pl-1">
                    <li>계약서 작성 및 전자 서명</li>
                    <li>상인회 공식 문서</li>
                    <li>계정 소유자 인증</li>
                  </ul>
                  <p className="mt-2">법적 효력이 있는 문서에 사용되므로 <span className="font-medium text-[#0F6FFF]">반드시 실명</span>을 입력해주세요.</p>
                </div>
              </div>
            </div>
          </div>
        );
        
      case 2: // 서명 입력
        return (
          <div className={`transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
            <div className="mb-2 text-sm text-gray-500">
              {stepHints[2]}
            </div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-xl font-medium text-[#333]">
                서명을 입력해주세요
              </label>
              
              {/* 토스 스타일 드롭다운 */}
              <div ref={fontDropdownRef} className="relative">
                <button
                  type="button"
                  className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg text-gray-700 flex items-center"
                  onClick={() => setIsFontDropdownOpen(!isFontDropdownOpen)}
                >
                  <span className="mr-1">폰트:</span>
                  <span className="font-medium">{selectedFont.name}</span>
                  <svg className={`w-4 h-4 ml-1 transition-transform ${isFontDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </button>
                
                {isFontDropdownOpen && (
                  <div className="absolute right-0 mt-1 w-56 bg-white rounded-xl shadow-lg border border-gray-100 z-30 overflow-hidden">
                    <div className="p-2 sticky top-0 bg-white border-b border-gray-100">
                      <input
                        type="text"
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F6FFF]"
                        placeholder="폰트 검색..."
                        onChange={(e) => {
                          // 폰트 검색 기능 (여기서는 구현하지 않음)
                        }}
                      />
                    </div>
                    <div className="max-h-72 overflow-y-auto py-1">
                      {fontOptions.map(font => (
                        <button
                          key={font.id}
                          className={`w-full text-left px-4 py-2.5 hover:bg-gray-50 flex flex-col ${selectedFont.id === font.id ? 'bg-[#EBF4FF] text-[#0F6FFF]' : ''}`}
                          onClick={() => {
                            setSelectedFont(font);
                            setIsFontDropdownOpen(false);
                          }}
                        >
                          <span className="font-medium">{font.name}</span>
                          <span 
                            className="mt-1 text-sm"
                            style={{ fontFamily: font.value }}
                          >
                            {font.preview}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* 서명 컴포넌트 */}
            <div
              style={{ fontFamily: selectedFont.value }}
              className="transition-all duration-300"
            >
              <Signature name={fullName} onChange={handleSignatureChange} />
            </div>
            
            {errors.signature && (
              <p className="mt-2 text-[#FF4E4E] text-sm flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                {errors.signature}
              </p>
            )}
            
            <div className="mt-4 p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
              <div className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="font-medium mb-1">전자 서명의 중요성:</p>
                  <ul className="list-disc list-inside pl-1">
                    <li>실제 서명과 유사하게 작성해주세요</li>
                    <li>결제요청, 상인회 동의서, 계약서 등에 사용됩니다</li>
                    <li>법적 효력이 있는 전자 서명으로 활용됩니다</li>
                    <li>다양한 한글 폰트 중에서 선택할 수 있습니다</li>
                  </ul>
                  {/* <p className="mt-2">마우스나 터치로 서명하시거나, 키보드로 이름을 입력하세요.</p> */}
                </div>
              </div>
            </div>
          </div>
        );
        
      case 3: // 매장 선택
        return (
          <div className={`transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
            <div className="mb-2 text-sm text-gray-500">
              {stepHints[3]}
            </div>
            <label className="block text-xl font-medium text-[#333] mb-3">
              소속된 매장을 선택해주세요
            </label>
            
            <div ref={dropdownRef} className="relative">
              <div
                className={`flex justify-between items-center w-full px-4 py-4 text-lg rounded-xl border ${errors.store ? "border-[#FF4E4E] bg-[#FFF5F5]" : "border-gray-200"} cursor-pointer`}
                onClick={() => !storesLoading && setIsDropdownOpen(!isDropdownOpen)}
              >
                {storesLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-[#0F6FFF] mr-2"></div>
                    <span className="text-gray-500">매장 정보를 불러오는 중...</span>
                  </div>
                ) : selectedStore ? (
                  <span className="text-[#333]">{selectedStoreName}</span>
                ) : (
                  <span className="text-gray-400">매장을 선택해주세요</span>
                )}
                {!storesLoading && (
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                )}
              </div>

              {isDropdownOpen && stores.length > 0 && (
                <div className="absolute z-10 mt-1 w-full bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                  <div className="p-2 sticky top-0 bg-white border-b border-gray-100">
                    <div className="relative">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <input
                        type="text"
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0F6FFF] focus:border-transparent text-sm"
                        placeholder="매장 검색 (매장명, 층, 호수, 업종)"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  </div>
                  
                  <div className="max-h-60 overflow-y-auto">
                    {filteredStores.length === 0 ? (
                      <div className="px-4 py-3 text-sm text-gray-500">
                        검색 결과가 없습니다
                      </div>
                    ) : (
                      filteredStores.map((store) => (
                        <div
                          key={store.id}
                          className={`px-4 py-3 cursor-pointer transition-colors ${selectedStore === store.id ? 'bg-[#EBF4FF] text-[#0F6FFF]' : 'hover:bg-gray-50'}`}
                          onClick={() => handleStoreSelect(store)}
                        >
                          <div className="font-medium">{store.name}</div>
                          <div className="text-sm text-gray-500 mt-0.5">
                            {store.floor} {store.unit_number} • {store.business_type}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            
            {errors.store && (
              <p className="mt-2 text-[#FF4E4E] text-sm flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                {errors.store}
              </p>
            )}
            
            {!storesLoading && stores.length === 0 ? (
              <div className="mt-3 p-4 bg-[#FFF5F5] text-[#FF4E4E] rounded-lg text-sm flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>매장 정보를 불러올 수 없습니다. 관리자에게 문의하세요.</span>
              </div>
            ) : (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
                <div className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="font-medium mb-1">매장 선택 시 참고사항:</p>
                    <ul className="list-disc list-inside pl-1">
                      <li>매장명, 층, 호수, 업종으로 검색할 수 있습니다</li>
                      {/* <li>하나의 계정으로 여러 매장을 관리할 수 있습니다</li> */}
                      <li>매장 정보는 상인회 활동 및 공지 수신에 활용됩니다</li>
                      <li>소속 매장이 목록에 없다면 카카오톡 오픈채팅방에 문의해주세요</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
        
      case 4: // 사용자 유형
        return (
          <div className={`transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
            <div className="mb-2 text-sm text-gray-500">
              {stepHints[4]}
            </div>
            <p className="block text-xl font-medium text-[#333] mb-3">
              사용자 유형을 선택해주세요
            </p>
            
            <div className="space-y-4">
              <label className={`block p-4 rounded-xl border transition-all ${userType === 'landlord' ? 'border-[#0F6FFF] bg-[#EBF4FF] ring-1 ring-[#0F6FFF]' : 'border-gray-200 hover:border-gray-300'} cursor-pointer`}>
                <input
                  type="radio"
                  className="sr-only"
                  name="userType"
                  value="landlord"
                  checked={userType === 'landlord'}
                  onChange={() => setUserType('landlord')}
                />
                <div className="flex items-center">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 transition-colors ${userType === 'landlord' ? 'bg-[#0F6FFF]' : 'border border-gray-300'}`}>
                    {userType === 'landlord' && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <span className={`text-lg font-medium transition-colors ${userType === 'landlord' ? 'text-[#0F6FFF]' : 'text-gray-700'}`}>임대인</span>
                    <p className="text-sm text-gray-500 mt-0.5">구분소유자(상가주)</p>
                  </div>
                </div>
                
                <div className="pl-12 mt-3 text-sm text-gray-600">
                  <p>부동산을 소유하고 임대료를 받는 사람입니다.</p>
                  {/* <div className="mt-2 bg-gray-100 p-3 rounded-lg">
                    <p className="font-medium text-[#0F6FFF]">임대인으로 등록 시 이용 가능한 기능:</p>
                    <ul className="list-disc list-inside mt-1 pl-1">
                      <li>임대료 수납 및 관리</li>
                      <li>임대 계약 갱신 알림</li>
                      <li>부동산 소유 정보 관리</li>
                      <li>소유주 모임 및 결정사항 참여</li>
                    </ul>
                  </div> */}
                </div>
              </label>
              
              <label className={`block p-4 rounded-xl border transition-all ${userType === 'tenant' ? 'border-[#0F6FFF] bg-[#EBF4FF] ring-1 ring-[#0F6FFF]' : 'border-gray-200 hover:border-gray-300'} cursor-pointer`}>
                <input
                  type="radio"
                  className="sr-only"
                  name="userType"
                  value="tenant"
                  checked={userType === 'tenant'}
                  onChange={() => setUserType('tenant')}
                />
                <div className="flex items-center">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 transition-colors ${userType === 'tenant' ? 'bg-[#0F6FFF]' : 'border border-gray-300'}`}>
                    {userType === 'tenant' && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <span className={`text-lg font-medium transition-colors ${userType === 'tenant' ? 'text-[#0F6FFF]' : 'text-gray-700'}`}>임차인</span>
                    <p className="text-sm text-gray-500 mt-0.5">매장주</p>
                  </div>
                </div>
                
                <div className="pl-12 mt-3 text-sm text-gray-600">
                  <p>상점이나 사무실을 임대해 사업을 운영하는 사람입니다.</p>
                  {/* <div className="mt-2 bg-gray-100 p-3 rounded-lg">
                    <p className="font-medium text-[#0F6FFF]">임차인으로 등록 시 이용 가능한 기능:</p>
                    <ul className="list-disc list-inside mt-1 pl-1">
                      <li>온라인 임대료 납부</li>
                      <li>매장 운영 및 홍보 지원</li>
                      <li>상인회 공동구매 및 행사 참여</li>
                      <li>점포 운영 관련 공지 수신</li>
                    </ul>
                  </div> */}
                </div>
              </label>
            </div>
            
            {errors.userType && (
              <p className="mt-2 text-[#FF4E4E] text-sm flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                {errors.userType}
              </p>
            )}
          </div>
        );
        
      case 5: // 이메일
        return (
          <div className={`transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
            <div className="mb-2 text-sm text-gray-500">
              {stepHints[5]}
            </div>
            <label htmlFor="email" className="block text-xl font-medium text-[#333] mb-3">
              이메일을 입력해주세요
            </label>
            
            <div className="relative">
              <input
                id="email"
                type="email"
                className={`w-full px-4 py-4 text-lg rounded-xl ${
                  errors.email 
                    ? "border-[#FF4E4E] bg-[#FFF5F5]" 
                    : emailAvailable 
                      ? "border-[#2BC451] bg-[#F4FFF6]" 
                      : "border-gray-200"
                } border focus:outline-none focus:ring-2 ${
                  errors.email 
                    ? "focus:ring-[#FF4E4E]" 
                    : "focus:ring-[#0F6FFF]"
                } focus:border-transparent transition-colors pr-10`}
                value={email}
                onChange={handleEmailChange}
                placeholder="example@email.com"
                autoFocus
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                {isCheckingEmail && (
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-200 border-t-[#0F6FFF]"></div>
                )}
                {!isCheckingEmail && emailAvailable === true && (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#2BC451]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                )}
                {!isCheckingEmail && emailAvailable === false && (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#FF4E4E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </div>
            </div>
            
            {errors.email ? (
              <p className="mt-2 text-[#FF4E4E] text-sm flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                {errors.email}
              </p>
            ) : emailAvailable && (
              <p className="mt-2 text-[#2BC451] text-sm flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                사용 가능한 이메일입니다
              </p>
            )}
            
            <div className="mt-4 p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
              <div className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="font-medium mb-1">이메일 사용 안내:</p>
                  <ul className="list-disc list-inside pl-1">
                    <li>이메일은 로그인 아이디로 사용됩니다</li>
                    <li>중요 공지사항 및 알림 수신에 활용됩니다</li>
                    <li>계정 찾기 및 비밀번호 재설정에 필요합니다</li>
                    <li>자주 확인하는 이메일 계정을 사용해주세요</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        );
        
      case 6: // 휴대폰 인증
        return (
          <div className={`transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
            <div className="mb-2 text-sm text-gray-500">
              {stepHints[6]}
            </div>
            <label htmlFor="phoneNumber" className="block text-xl font-medium text-[#333] mb-3">
              휴대폰 번호를 인증해주세요
            </label>
            
            {!phoneVerified ? (
              <>
                <div className="flex items-center space-x-2 mb-3">
                  <div className="relative flex-grow">
                    <input
                      id="phoneNumber"
                      type="tel"
                      className={`w-full px-4 py-4 text-lg rounded-xl border ${
                        errors.phoneNumber 
                          ? "border-[#FF4E4E] bg-[#FFF5F5]" 
                          : "border-gray-200"
                      } focus:outline-none focus:ring-2 focus:ring-[#0F6FFF] focus:border-transparent transition-colors`}
                      value={phoneNumber}
                      onChange={handlePhoneNumberChange}
                      placeholder="010-0000-0000"
                      disabled={phoneVerificationStep === 1}
                      autoFocus={phoneVerificationStep === 0}
                    />
                  </div>
                  
                  <button 
                    type="button"
                    className={`whitespace-nowrap px-5 py-4 rounded-xl font-medium text-base transition-all ${
                      otpSending || phoneVerificationStep === 1 || !phoneNumber || phoneNumber.replace(/-/g, '').length !== 11
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                        : "bg-[#0F6FFF] hover:bg-[#0052CC] text-white shadow-sm"
                    }`}
                    onClick={requestOTP}
                    disabled={otpSending || phoneVerificationStep === 1 || !phoneNumber || phoneNumber.replace(/-/g, '').length !== 11}
                  >
                    {otpSending ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-1.5"></div>
                        <span>발송중</span>
                      </div>
                    ) : phoneVerificationStep === 1 ? (
                      <div className="flex items-center">
                        <span className="mr-1">재발송</span>
                        <span className="inline-flex items-center justify-center bg-gray-200 text-gray-700 rounded-full w-6 h-6 text-xs font-bold">
                          {Math.floor(otpResendCountdown / 60)}:{(otpResendCountdown % 60).toString().padStart(2, '0')}
                        </span>
                      </div>
                    ) : (
                      "인증요청"
                    )}
                  </button>
                </div>
                
                {errors.phoneNumber && (
                  <p className="mt-0 mb-3 text-[#FF4E4E] text-sm flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    {errors.phoneNumber}
                  </p>
                )}
                
                {errors.otpSent && !errors.phoneNumber && (
                  <div className="mb-3 p-3 bg-[#F4FFF6] rounded-lg text-sm text-[#2BC451] flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{errors.otpSent}</span>
                  </div>
                )}
                
                {/* OTP 입력 필드 */}
                {phoneVerificationStep === 1 && !phoneVerified && (
                  <>
                    <label htmlFor="otpCode" className="block text-base font-medium text-[#333] mb-2">
                      인증번호 6자리를 입력해주세요
                    </label>
                    
                    <div className="flex items-center space-x-2 mb-3">
                      <div className="relative flex-grow">
                        <input
                          ref={otpInputRef}
                          id="otpCode"
                          type="text"
                          className={`w-full px-4 py-4 text-lg rounded-xl border letter-spacing-wide ${errors.phoneVerification ? "border-[#FF4E4E] bg-[#FFF5F5]" : "border-gray-200"} focus:outline-none focus:ring-2 focus:ring-[#0F6FFF] focus:border-transparent text-center tracking-widest text-xl font-medium`}
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, '').substring(0, 6))}
                          placeholder="000000"
                          maxLength={6}
                          inputMode="numeric"
                          autoFocus
                        />
                        {otpCode.length > 0 && (
                          <button 
                            type="button" 
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            onClick={() => setOtpCode('')}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        )}
                      </div>
                      <button
                        type="button"
                        className={`whitespace-nowrap px-5 py-4 rounded-xl font-medium text-base transition-all ${
                          otpVerifying || !otpCode || otpCode.length !== 6
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-[#0F6FFF] hover:bg-[#0052CC] text-white shadow-sm"
                        }`}
                        onClick={verifyOTP}
                        disabled={otpVerifying || !otpCode || otpCode.length !== 6}
                      >
                        {otpVerifying ? (
                          <div className="flex items-center">
                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-1.5"></div>
                            <span>확인중</span>
                          </div>
                        ) : (
                          "확인"
                        )}
                      </button>
                    </div>
                    
                    {errors.phoneVerification && (
                      <div className="mt-0 mb-3 p-3 bg-[#FFF5F5] rounded-lg text-sm text-[#FF4E4E] flex items-start">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <span>{errors.phoneVerification}</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center text-sm">
                      <p className="text-gray-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="inline-block h-4 w-4 mr-1 -mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        유효시간: <span className="text-[#0F6FFF] font-medium">{Math.floor(otpResendCountdown / 60)}:{(otpResendCountdown % 60).toString().padStart(2, '0')}</span>
                      </p>
                      <button
                        type="button"
                        className="text-[#0F6FFF] hover:underline font-medium disabled:text-gray-400 disabled:no-underline"
                        onClick={requestOTP}
                        disabled={otpResendCountdown > 0 || otpSending}
                      >
                        {otpResendCountdown > 0 ? `재발송 대기중` : '인증번호 재발송'}
                      </button>
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="flex items-center bg-[#F4FFF6] p-4 rounded-xl mb-3">
                <div className="bg-[#2BC451] rounded-full p-2 mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-[#2BC451]">인증 완료</p>
                  <p className="text-gray-600">{phoneNumber}</p>
                </div>
              </div>
            )}
            
            <div className="mt-4 p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
              <div className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="font-medium mb-1">휴대폰 인증의 중요성:</p>
                  <ul className="list-disc list-inside pl-1">
                    <li>본인 인증 및 계정 보안 강화</li>
                    <li>중요 공지 및 알림 수신</li>
                    <li>비상 연락처로 활용</li>
                    <li>매장 관련 긴급 상황 알림</li>
                  </ul>
                  <p className="mt-2">입력하신 휴대폰 번호는 실제 사용 중인 번호여야 합니다.</p>
                </div>
              </div>
            </div>
          </div>
        );
        
      case 7: // 비밀번호
        return (
          <div className={`transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
            <div className="mb-2 text-sm text-gray-500">
              {stepHints[7]}
            </div>
            <div>
              <label htmlFor="password" className="block text-xl font-medium text-[#333] mb-3">
                비밀번호를 설정해주세요
              </label>
              <input
                id="password"
                type="password"
                className={`w-full px-4 py-4 text-lg rounded-xl border ${errors.password ? "border-[#FF4E4E] bg-[#FFF5F5]" : "border-gray-200"} focus:outline-none focus:ring-2 focus:ring-[#0F6FFF] focus:border-transparent transition-colors`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호 입력 (6자 이상)"
                autoFocus
              />
              {errors.password && (
                <p className="mt-2 text-[#FF4E4E] text-sm flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  {errors.password}
                </p>
              )}
            </div>
            
            <div className="mt-4">
              <label htmlFor="confirmPassword" className="block text-xl font-medium text-[#333] mb-3">
                비밀번호를 다시 입력해주세요
              </label>
              <input
                id="confirmPassword"
                type="password"
                className={`w-full px-4 py-4 text-lg rounded-xl border ${errors.confirmPassword ? "border-[#FF4E4E] bg-[#FFF5F5]" : "border-gray-200"} focus:outline-none focus:ring-2 focus:ring-[#0F6FFF] focus:border-transparent transition-colors`}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="비밀번호 확인"
              />
              {errors.confirmPassword && (
                <p className="mt-2 text-[#FF4E4E] text-sm flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  {errors.confirmPassword}
                </p>
              )}
            </div>
            
            <div className="mt-4 p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
              <div className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="font-medium mb-1">안전한 비밀번호 설정 가이드:</p>
                  <ul className="list-disc list-inside pl-1">
                    <li>최소 6자 이상 입력해주세요</li>
                    <li>영문, 숫자, 특수문자 조합을 사용하면 더 안전합니다</li>
                    <li>다른 사이트와 동일한 비밀번호 사용은 피해주세요</li>
                    <li>개인정보(생일, 전화번호 등)가 포함된 비밀번호는 피해주세요</li>
                  </ul>
                  {/* <p className="mt-2">계정 보안을 위해 주기적으로 비밀번호를 변경해주세요.</p> */}
                </div>
              </div>
            </div>
          </div>
        );
        
      case 8: // 사업자 등록증
        return (
          <div className={`transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
            {/* <div className="mb-2 text-sm text-gray-500">
              {stepHints[8]}
            </div> */}
            <label className="block text-xl font-medium text-[#333] mb-3">
              사업자 등록증 첨부 <span className="text-gray-500 text-base font-normal">(선택사항)</span>
            </label>
            
            <input
              ref={fileInputRef}
              id="businessDoc"
              type="file"
              className="hidden"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileChange}
            />
            
            <div 
              onClick={triggerFileInput}
              className={`flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl transition-colors cursor-pointer hover:bg-gray-50 ${errors.businessDoc ? "border-[#FF4E4E] bg-[#FFF5F5]" : businessDoc ? "border-[#0F6FFF] bg-[#F1F8FF]" : "border-gray-200"}`}
            >
          {businessDoc ? (
                <div className="flex items-center justify-center w-full">
                  <div className="mr-4 flex-shrink-0">
                    {businessDoc.type.includes('pdf') ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-[#0F6FFF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-[#0F6FFF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-grow overflow-hidden">
                    <p className="text-[#0F6FFF] font-medium truncate text-lg">{businessDoc.name}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {(businessDoc.size / 1024 / 1024).toFixed(2)} MB
                      <span className="text-[#0F6FFF] font-medium ml-3 hover:underline">변경하기</span>
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-14 w-14 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="text-[#333] font-medium text-lg">파일을 여기에 놓거나 클릭하세요</p>
                  <p className="text-sm text-gray-500 mt-1">JPG, PNG, PDF 파일 (5MB 이하)</p>
                </>
              )}
              </div>
            
            {errors.businessDoc && (
              <p className="mt-2 text-[#FF4E4E] text-sm flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                {errors.businessDoc}
              </p>
            )}
            
            <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-600 mt-4">
              <div className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="font-medium mb-1">사업자 등록증은 다음과 같은 경우에 필요합니다:</p>
                  <ul className="list-disc list-inside pl-1">
                    <li>상인회 활동 및 회원 인증</li>
                    <li>공동 구매 및 계약 참여</li>
                    <li>매장 인증 및 홍보 활동</li>
                  </ul>
                  <p className="mt-1">지금 첨부하지 않아도 나중에 추가할 수 있습니다.</p>
                </div>
              </div>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  // 회원가입 성공 화면
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-full max-w-md mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-[#EBF5FF] text-[#0F6FFF] rounded-full mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-[#333] mb-4">회원가입 신청 완료</h2>
            <p className="text-[#666] mb-6 leading-relaxed">
              휴대폰 번호 인증이 완료되었습니다.<br />
              회원가입 신청이 접수되었습니다.<br /><br />
              관리자 승인 후 이용하실 수 있습니다.<br />
              승인이 완료되면 이메일로 알려드리겠습니다.
            </p>
            <Link 
              href="/auth/login" 
              className="block w-full py-4 bg-[#0F6FFF] hover:bg-[#0052CC] text-white font-medium rounded-xl transition-colors"
            >
              로그인 페이지로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-8">
      <div className="w-full max-w-lg mx-auto px-4">
        {/* 헤더 및 진행 상태 바 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#333] mb-2">회원가입</h1>
          <p className="text-[#666] mb-6">다인타운 계정을 만들어보세요</p>
          
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-[#0F6FFF] h-2.5 rounded-full transition-all duration-300" 
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>시작</span>
            <span>진행 중 ({currentStep}/8)</span>
            <span>완료</span>
          </div>
        </div>
        
        {/* 에러 메시지 */}
        {generalError && (
          <div className="flex items-start bg-[#FFF5F5] text-[#E03131] p-4 rounded-xl mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{generalError}</span>
          </div>
        )}

        {/* 메인 폼 */}
        <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
          <form onSubmit={(e) => {
            e.preventDefault();
            if (currentStep === 8) {
              handleRegister();
            } else {
              handleNextStep();
            }
          }}>
            {/* 단계별 콘텐츠 */}
            {renderStepContent()}
            
            {/* 네비게이션 버튼 */}
            <div className={`mt-8 flex ${currentStep === 1 ? 'justify-end' : 'justify-between'} transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
              {currentStep > 1 && (
                <button
                  type="button"
                  className="px-5 py-3.5 rounded-xl border border-gray-200 font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  onClick={handlePrevStep}
                  disabled={isTransitioning}
                >
                  이전
                </button>
              )}
              
              <button
                type="submit"
                className={`px-5 py-3.5 rounded-xl font-medium text-white transition-all ${
                  loading || (currentStep === 5 && (isCheckingEmail || emailAvailable === false)) || (currentStep === 6 && !phoneVerified)
                    ? "bg-gray-300 cursor-not-allowed" 
                    : "bg-[#0F6FFF] hover:bg-[#0052CC] shadow-sm"
                }`}
                disabled={loading || (currentStep === 5 && (isCheckingEmail || emailAvailable === false)) || (currentStep === 6 && !phoneVerified) || isTransitioning}
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      처리 중...
                    </span>
                  ) : currentStep === 8 ? '회원가입 완료' : '다음'}
                </button>
              </div>
            </form>
          </div>
          
          {/* 로그인 링크 */}
          <div className="text-center mt-6">
            <p className="text-[#666]">
              이미 계정이 있으신가요?{' '}
              <Link href="/auth/login" className="text-[#0F6FFF] font-medium hover:underline">
                로그인
              </Link>
            </p>
          </div>
        </div>
      </div>
    // </div>
  );
}