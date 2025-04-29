'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import supabase from '@/lib/supabase';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const router = useRouter();

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!email) newErrors.email = '이메일을 입력해주세요';
    if (!password) newErrors.password = '비밀번호를 입력해주세요';
    
    setErrors(newErrors);
    
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setGeneralError(null);

    try {
      // 일반 로그인 시도
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      // 로그인 오류 발생
      if (error) {
        console.log('로그인 오류:', error.code, error.message);
        
        // 이메일 확인 오류인 경우
        if (error.message.includes('Email not confirmed') || error.code === 'email_not_confirmed') {
          console.log('이메일 미확인 오류, 자동 확인 시도 중...');
          
          try {
            // Admin API로 이메일 확인 시도
            const confirmResponse = await fetch('/api/auth/admin-confirm-email', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email }),
            });
            
            const confirmData = await confirmResponse.json();
            
            if (!confirmResponse.ok) {
              console.error('이메일 확인 실패:', confirmData);
              throw new Error(confirmData.error || '이메일 확인에 실패했습니다.');
            }
            
            console.log('이메일 확인 성공, 다시 로그인 시도 중...');
            
            // 이메일 확인 후 다시 로그인 시도
            const { data: retryData, error: retryError } = await supabase.auth.signInWithPassword({
              email,
              password,
            });
            
            if (retryError) {
              console.error('재시도 로그인 실패:', retryError);
              if (retryError.message.includes('Invalid login credentials')) {
                setGeneralError('이메일 또는 비밀번호가 올바르지 않습니다');
              } else {
                setGeneralError(retryError.message);
              }
              setLoading(false);
              return;
            }
            
            // 성공한 경우 계속 진행
            if (retryData.session && retryData.user) {
              await handleProfileCheck(retryData.user.id);
              return;
            }
          } catch (confirmErr: any) {
            console.error('이메일 확인 오류:', confirmErr);
            setGeneralError('계정 이메일 확인 중 오류가 발생했습니다: ' + confirmErr.message);
            setLoading(false);
            return;
          }
        } else if (error.message.includes('Invalid login credentials')) {
          // 일반적인 로그인 실패
          setGeneralError('이메일 또는 비밀번호가 올바르지 않습니다');
        } else if (error.message.includes('Email logins are disabled') || error.code === 'email_provider_disabled') {
          // 이메일 로그인 비활성화 오류 - 이 경우 관리자에게 문의 필요
          setGeneralError('시스템 오류: 이메일 로그인이 비활성화되어 있습니다. 관리자에게 문의하세요.');
          console.error('이메일 로그인이 비활성화됨 - 대시보드에서 활성화 필요');
        } else {
          // 기타 오류
          setGeneralError(error.message);
        }
        
        setLoading(false);
        return;
      }

      if (!data.session || !data.user) {
        setGeneralError('로그인 중 오류가 발생했습니다.');
        setLoading(false);
        return;
      }

      // 로그인 성공 시 프로필 상태 확인
      await handleProfileCheck(data.user.id);
    } catch (error: any) {
      console.error('로그인 오류:', error);
      setGeneralError('로그인 중 오류가 발생했습니다. 다시 시도해주세요.');
      setLoading(false);
    }
  };

  // 프로필 상태 확인 및 처리 함수
  const handleProfileCheck = async (userId: string) => {
    try {
      const profileResponse = await fetch(`/api/auth/check-profile?userId=${userId}`, {
        method: 'GET',
      });
      
      if (!profileResponse.ok) {
        throw new Error('프로필 정보를 확인할 수 없습니다.');
      }
      
      const profileData = await profileResponse.json();
      
      if (profileData.status === 'pending') {
        // 승인 대기 중인 계정
        await supabase.auth.signOut();
        setGeneralError('계정 승인 대기 중입니다. 관리자 승인 후 로그인 가능합니다.');
        setLoading(false);
        return;
      }

      if (profileData.status === 'rejected') {
        // 거부된 계정
        await supabase.auth.signOut();
        setGeneralError('계정이 승인되지 않았습니다. 관리자에게 문의해주세요.');
        setLoading(false);
        return;
      }

      // 로그인 성공 시 홈페이지로 이동
      console.log('로그인 성공, 홈페이지로 이동');
      router.push('/');
    } catch (profileError: any) {
      console.error('프로필 확인 오류:', profileError);
      setGeneralError('사용자 정보 확인 중 오류가 발생했습니다. 다시 시도해주세요.');
      await supabase.auth.signOut();
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] py-12">
      <div className="container-custom mx-auto px-4">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-[#333] mb-2">로그인</h1>
            <p className="text-[#666]">다인타운 계정으로 로그인하세요</p>
          </div>

          {generalError && (
            <div className="toss-alert-error mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-grow">
                <p>{generalError}</p>
              </div>
            </div>
          )}

          <div className="toss-card">
            <form onSubmit={handleLogin}>
              <div className="mb-6">
                <label htmlFor="email" className="form-label">
                  이메일
                </label>
                <input
                  id="email"
                  type="email"
                  className={errors.email ? "form-input-error" : "form-input"}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@email.com"
                />
                {errors.email && (
                  <p className="mt-1 text-[#FF4E4E] text-sm">{errors.email}</p>
                )}
              </div>

              <div className="mb-8">
                <div className="flex justify-between mb-2">
                  <label htmlFor="password" className="form-label">
                    비밀번호
                  </label>
                  <Link href="/auth/forgot-password" className="text-[#0F6FFF] text-sm font-medium hover:underline">
                    비밀번호 찾기
                  </Link>
                </div>
                <input
                  id="password"
                  type="password"
                  className={errors.password ? "form-input-error" : "form-input"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="비밀번호를 입력해주세요"
                />
                {errors.password && (
                  <p className="mt-1 text-[#FF4E4E] text-sm">{errors.password}</p>
                )}
              </div>

              <div className="space-y-4">
                <button
                  type="submit"
                  className={loading ? "btn-disabled" : "btn-primary"}
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      로그인 중...
                    </span>
                  ) : '로그인'}
                </button>
                
                <div className="text-center">
                  <p className="text-[#666]">
                    계정이 없으신가요?{' '}
                    <Link href="/auth/register" className="text-[#0F6FFF] font-medium hover:underline">
                      회원가입
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