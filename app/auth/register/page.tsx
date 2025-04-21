// app/auth/register/page.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import supabase from '@/lib/supabase';
import Signature from '@/components/ui/Signature';

interface Store {
  id: string;
  name: string;
  floor: string;
  unit_number: string;
  business_type: string;
}

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [businessDoc, setBusinessDoc] = useState<File | null>(null);
  const [signatureData, setSignatureData] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [success, setSuccess] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  
  // 추가: 매장 및 사용자 유형 관련 상태
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStore, setSelectedStore] = useState<string>('');
  const [selectedStoreName, setSelectedStoreName] = useState<string>('');
  const [userType, setUserType] = useState<string>('tenant');
  const [storesLoading, setStoresLoading] = useState(false);
  
  // 커스텀 드롭다운 관련 상태
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // 이메일 중복 확인 관련 상태 추가
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [emailAvailable, setEmailAvailable] = useState<boolean | null>(null);
  const emailCheckTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
      setStoresLoading(true);
      try {
        // API 라우트를 통해 매장 목록 가져오기
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
    };

    fetchStores();
  }, []);

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
    
    // 이메일이 비어있거나 형식이 올바르지 않으면 중복 확인 상태 초기화
    if (!newEmail) {
      setEmailAvailable(null);
      setErrors(prev => ({ ...prev, email: '이메일을 입력해주세요' }));
      return;
    }
    
    if (!/\S+@\S+\.\S+/.test(newEmail)) {
      setEmailAvailable(null);
      setErrors(prev => ({ ...prev, email: '올바른 이메일 형식이 아닙니다' }));
      return;
    }
    
    // 이메일 형식이 올바르면 중복 확인 상태 업데이트 중으로 설정
    setIsCheckingEmail(true);
    setEmailAvailable(null);
    
    // 타이핑 멈춘 후 500ms 후에 중복 확인 실행
    emailCheckTimeoutRef.current = setTimeout(() => {
      checkEmailAvailability(newEmail);
    }, 500);
  };
  
  // 이메일 중복 확인 함수
  const checkEmailAvailability = async (emailToCheck: string) => {
    try {
      // 더 간단한 방법으로 중복 확인 시도 (OTP로 로그인 시도)
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email: emailToCheck,
      });
      
      // 이메일이 이미 등록되었는지 확인
      if (otpError && otpError.message.includes('already registered')) {
        setEmailAvailable(false);
        setErrors(prev => ({ ...prev, email: '이미 등록된 이메일입니다' }));
      } else {
        setEmailAvailable(true);
      }
    } catch (err) {
      console.error('이메일 중복 확인 오류:', err);
      // 오류 발생 시 진행 허용 (가입 시 Supabase가 검증함)
      setEmailAvailable(true);
    } finally {
      setIsCheckingEmail(false);
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
    store.business_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 컴포넌트 언마운트 시 타임아웃 정리
  useEffect(() => {
    return () => {
      if (emailCheckTimeoutRef.current) {
        clearTimeout(emailCheckTimeoutRef.current);
      }
    };
  }, []);

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!email) newErrors.email = '이메일을 입력해주세요';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = '올바른 이메일 형식이 아닙니다';
    else if (emailAvailable === false) newErrors.email = '이미 등록된 이메일입니다';
    
    if (!password) newErrors.password = '비밀번호를 입력해주세요';
    else if (password.length < 6) newErrors.password = '비밀번호는 6자 이상이어야 합니다';
    
    if (!confirmPassword) newErrors.confirmPassword = '비밀번호 확인을 입력해주세요';
    else if (password !== confirmPassword) newErrors.confirmPassword = '비밀번호가 일치하지 않습니다';
    
    if (!fullName) newErrors.fullName = '이름을 입력해주세요';
    
    if (!phoneNumber) newErrors.phoneNumber = '연락처를 입력해주세요';
    
    if (!businessDoc) newErrors.businessDoc = '사업자 등록증을 첨부해주세요';

    if (!signatureData) newErrors.signature = '서명이 생성되지 않았습니다';
    
    // 추가: 매장과 사용자 유형 검증
    if (!selectedStore) newErrors.store = '매장을 선택해주세요';
    if (!userType) newErrors.userType = '사용자 유형을 선택해주세요';
    
    setErrors(newErrors);
    
    return Object.keys(newErrors).length === 0;
  };

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

  const handleSignatureChange = (data: string) => {
    setSignatureData(data);
    if (data) {
      setErrors({ ...errors, signature: '' });
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setGeneralError(null);
  
    try {
      // 1. 사용자 계정 생성 (이메일 확인 필요)
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone_number: phoneNumber,
            signature: signatureData
          },
          // 이메일 인증을 위한 리디렉션 설정
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
  
      if (authError) {
        throw authError;
      }
  
      if (!authData.user) {
        throw new Error('회원가입 중 오류가 발생했습니다.');
      }
  
      // 2. 사업자 등록증 업로드
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
          throw error;
        }
      }
  
      // 3. 프로필 정보를 직접 서버로 전송
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
          // 관리자용 로그 기록 (개발용)
          console.warn('관리자 수동 작업 필요: 다음 정보를 기록하세요');
          console.warn(`사용자 ID: ${authData.user.id}`);
          console.warn(`매장 ID: ${selectedStore}`);
          console.warn(`사용자 유형: ${userType}`);
        } else {
          console.log('매장 연결 응답:', storeUserData);
          
          // 관리자 필요 플래그가 있으면 콘솔에 기록 (개발자용)
          if (storeUserData.adminRequired || storeUserData.adminNote) {
            console.warn('관리자 수동 작업 필요: 사용자 ID, 매장, 역할 정보를 기록해두세요.');
            console.warn(`사용자 ID: ${authData.user.id}`);
            console.warn(`매장 ID: ${selectedStore}`);
            console.warn(`사용자 유형: ${userType}`);
          }
        }
      } catch (error: any) {
        console.error('Store-user connection error:', error);
        // 오류 상세 기록 (개발용)
        console.error('연결 실패 상세 정보:', error.message);
        console.warn('관리자 수동 대응 필요: 다음 정보를 별도 기록하세요');
        console.warn(`사용자 ID: ${authData.user.id}`);
        console.warn(`매장 ID: ${selectedStore}`);
        console.warn(`사용자 유형: ${userType}`);
        
        // 오류가 있어도 회원가입은 진행 (프로세스 중단 방지)
      }
  
      // 회원가입 성공 처리
      setEmailSent(true);
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

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  if (success) {
    // 등록 성공 화면
    return (
      <div className="min-h-screen bg-[#F8F9FA] py-12">
        <div className="container-custom mx-auto px-4">
          <div className="max-w-md mx-auto">
            <div className="toss-card text-center p-8">
              <div className="text-[#0F6FFF] mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-[#333] mb-4">회원가입 신청 완료</h2>
              {emailSent ? (
                <div className="text-[#666] mb-8">
                  <p className="mb-4">
                    <span className="font-semibold text-[#0F6FFF]">{email}</span> 주소로<br />
                    이메일 인증 링크를 발송했습니다.
                  </p>
                  <div className="bg-[#F5F9FF] border border-[#DFEDFF] text-[#0F6FFF] p-4 rounded-xl mb-6 text-sm">
                    <p className="font-medium mb-2">✓ 다음 단계를 완료해주세요</p>
                    <ol className="text-left pl-5 list-decimal">
                      <li className="mb-1">받은 이메일에서 [Confirm your mail] 링크를 클릭해주세요</li>
                      <li className="mb-1">이메일 인증 후 관리자 승인이 필요합니다</li>
                      <li>승인이 완료되면 로그인이 가능합니다</li>
                    </ol>
                  </div>
                </div>
              ) : (
                <p className="text-[#666] mb-8">
                  회원가입 신청이 접수되었습니다.<br />
                  관리자 승인 후 이용하실 수 있습니다.<br />
                  승인이 완료되면 이메일로 알려드리겠습니다.
                </p>
              )}
              <Link href="/auth/login" className="btn-primary inline-block">
                로그인 페이지로 돌아가기
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] py-12">
      <div className="container-custom mx-auto px-4">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-[#333] mb-2">회원가입</h1>
            <p className="text-[#666]">다인타운 계정을 만들어보세요</p>
          </div>

          {generalError && (
            <div className="toss-alert-error mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{generalError}</span>
            </div>
          )}

          <div className="toss-card">
            <form onSubmit={handleRegister}>
              <div className="mb-6">
                <label htmlFor="fullName" className="form-label">
                  이름
                </label>
                <input
                  id="fullName"
                  type="text"
                  className={errors.fullName ? "form-input-error" : "form-input"}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  onBlur={(e) => setFullName(e.target.value)} // 포커스 해제 시에도 처리
                  placeholder="이름을 입력해주세요"
                />
                {errors.fullName && (
                  <p className="mt-1 text-[#FF4E4E] text-sm">{errors.fullName}</p>
                )}
              </div>

              {/* 서명 컴포넌트 */}
              <Signature name={fullName} onChange={handleSignatureChange} />
              {errors.signature && (
                <p className="mt-1 text-[#FF4E4E] text-sm">{errors.signature}</p>
              )}

              {/* 커스텀 매장 선택 드롭다운 */}
              <div className="mb-6 mt-6">
                <label htmlFor="store" className="form-label">
                  매장 선택
                </label>
                <div ref={dropdownRef} className="relative">
                  <div
                    className={`form-input flex justify-between items-center cursor-pointer ${errors.store ? "border-[#FF4E4E]" : ""}`}
                    onClick={() => !storesLoading && setIsDropdownOpen(!isDropdownOpen)}
                  >
                    {storesLoading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-[#0F6FFF] mr-2"></div>
                        <span className="text-gray-500">매장 정보를 불러오는 중...</span>
                      </div>
                    ) : selectedStore ? (
                      <span>{selectedStoreName}</span>
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
                    <div className="absolute z-10 mt-1 w-full bg-white rounded-lg shadow-lg border border-gray-200 py-1 max-h-60 overflow-y-auto">
                      <div className="p-2 sticky top-0 bg-white border-b border-gray-100">
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F6FFF] focus:border-transparent text-sm"
                          placeholder="매장 검색..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                      
                      {filteredStores.length === 0 ? (
                        <div className="px-4 py-2 text-sm text-gray-500">
                          검색 결과가 없습니다
                        </div>
                      ) : (
                        filteredStores.map((store) => (
                          <div
                            key={store.id}
                            className={`px-4 py-2 hover:bg-gray-100 cursor-pointer ${selectedStore === store.id ? 'bg-[#EBF4FF] text-[#0F6FFF]' : ''}`}
                            onClick={() => handleStoreSelect(store)}
                          >
                            <div className="font-medium">{store.name}</div>
                            <div className="text-sm text-gray-500">
                              {store.floor} {store.unit_number} • {store.business_type}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>

                {errors.store && (
                  <p className="mt-1 text-[#FF4E4E] text-sm">{errors.store}</p>
                )}

                {!storesLoading && stores.length === 0 ? (
                  <p className="mt-1.5 text-[#FF4E4E] text-sm">
                    매장 정보를 불러올 수 없습니다. 관리자에게 문의하세요.
                  </p>
                ) : (
                  <p className="mt-1.5 text-[#666] text-sm">
                    * 소속된 매장이 없다면 관리자에게 문의해주세요
                  </p>
                )}
              </div>

              {/* 사용자 유형 선택 */}
              <div className="mb-6">
                <p className="form-label mb-2">사용자 유형</p>
                <div className="grid grid-cols-2 gap-3">
                  <label className={`flex items-center p-3 rounded-lg border ${userType === 'landlord' ? 'border-[#0F6FFF] bg-[#EBF4FF]' : 'border-gray-300 hover:border-gray-400'} cursor-pointer transition-colors`}>
                    <input
                      type="radio"
                      className="form-radio h-4 w-4 text-[#0F6FFF]"
                      name="userType"
                      value="landlord"
                      checked={userType === 'landlord'}
                      onChange={() => setUserType('landlord')}
                      hidden
                    />
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center mr-3 ${userType === 'landlord' ? 'bg-[#0F6FFF]' : 'border border-gray-400'}`}>
                      {userType === 'landlord' && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <span className={`font-medium ${userType === 'landlord' ? 'text-[#0F6FFF]' : 'text-gray-700'}`}>임대인</span>
                      <p className="text-xs text-gray-500">구분소유자(상가주)</p>
                    </div>
                  </label>
                  
                  <label className={`flex items-center p-3 rounded-lg border ${userType === 'tenant' ? 'border-[#0F6FFF] bg-[#EBF4FF]' : 'border-gray-300 hover:border-gray-400'} cursor-pointer transition-colors`}>
                    <input
                      type="radio"
                      className="form-radio h-4 w-4 text-[#0F6FFF]"
                      name="userType"
                      value="tenant"
                      checked={userType === 'tenant'}
                      onChange={() => setUserType('tenant')}
                      hidden
                    />
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center mr-3 ${userType === 'tenant' ? 'bg-[#0F6FFF]' : 'border border-gray-400'}`}>
                      {userType === 'tenant' && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <span className={`font-medium ${userType === 'tenant' ? 'text-[#0F6FFF]' : 'text-gray-700'}`}>임차인</span>
                      <p className="text-xs text-gray-500">매장주</p>
                    </div>
                  </label>
                </div>
                
                {errors.userType && (
                  <p className="mt-1 text-[#FF4E4E] text-sm">{errors.userType}</p>
                )}
              </div>

              <div className="mb-6">
                <label htmlFor="email" className="form-label">
                  이메일
                </label>
                <div className="relative">
                  <input
                    id="email"
                    type="email"
                    className={errors.email ? "form-input-error pr-10" : emailAvailable ? "form-input pr-10 border-[#2BC451]" : "form-input pr-10"}
                    value={email}
                    onChange={handleEmailChange}
                    placeholder="example@email.com"
                  />
                  {isCheckingEmail && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#0F6FFF]"></div>
                    </div>
                  )}
                  {!isCheckingEmail && emailAvailable === true && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#2BC451]">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                  {!isCheckingEmail && emailAvailable === false && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#FF4E4E]">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                  )}
                </div>
                {errors.email && (
                  <p className="mt-1 text-[#FF4E4E] text-sm">{errors.email}</p>
                )}
                {emailAvailable && !errors.email && (
                  <p className="mt-1 text-[#2BC451] text-sm">사용 가능한 이메일입니다</p>
                )}
                <p className="mt-1.5 text-[#666] text-sm">
                  * 이메일 주소로 인증 링크가 발송됩니다
                </p>
              </div>

              <div className="mb-6">
                <label htmlFor="phoneNumber" className="form-label">
                  연락처
                </label>
                <input
                  id="phoneNumber"
                  type="tel"
                  className={errors.phoneNumber ? "form-input-error" : "form-input"}
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="010-0000-0000"
                />
                {errors.phoneNumber && (
                  <p className="mt-1 text-[#FF4E4E] text-sm">{errors.phoneNumber}</p>
                )}
              </div>

              <div className="mb-6">
                <label htmlFor="password" className="form-label">
                  비밀번호
                </label>
                <input
                  id="password"
                  type="password"
                  className={errors.password ? "form-input-error" : "form-input"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="6자 이상 입력해주세요"
                />
                {errors.password && (
                  <p className="mt-1 text-[#FF4E4E] text-sm">{errors.password}</p>
                )}
              </div>

              <div className="mb-6">
                <label htmlFor="confirmPassword" className="form-label">
                  비밀번호 확인
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  className={errors.confirmPassword ? "form-input-error" : "form-input"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="비밀번호를 한번 더 입력해주세요"
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-[#FF4E4E] text-sm">{errors.confirmPassword}</p>
                )}
              </div>

              <div className="mb-8">
                <label className="form-label">
                  사업자 등록증 첨부
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
                  className={`toss-file-upload ${errors.businessDoc ? "border-[#FF4E4E]" : ""}`}
                >
                  {businessDoc ? (
                    <div className="flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#0F6FFF] mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-[#0F6FFF]">{businessDoc.name}</span>
                    </div>
                  ) : (
                    <div>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto text-[#999] mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <p className="text-[#666]">클릭하여 파일 선택</p>
                      <p className="text-sm text-[#999] mt-1">JPG, PNG, PDF 파일 (5MB 이하)</p>
                    </div>
                  )}
                </div>
                {errors.businessDoc && (
                  <p className="mt-1 text-[#FF4E4E] text-sm">{errors.businessDoc}</p>
                )}
              </div>

              <div className="space-y-4">
                <button
                  type="submit"
                  className={loading || isCheckingEmail || emailAvailable === false ? "btn-disabled" : "btn-primary"}
                  disabled={loading || isCheckingEmail || emailAvailable === false}
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      처리 중...
                    </span>
                  ) : '회원가입'}
                </button>
                
                <div className="text-center">
                  <p className="text-[#666]">
                    이미 계정이 있으신가요?{' '}
                    <Link href="/auth/login" className="text-[#0F6FFF] font-medium hover:underline">
                      로그인
                    </Link>
                  </p>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}