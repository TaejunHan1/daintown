// app/auth/login/page.tsx
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
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Supabase 에러 메시지 한글화
        if (error.message.includes('Invalid login credentials')) {
          setGeneralError('이메일 또는 비밀번호가 올바르지 않습니다');
        } else if (error.message.includes('Email not confirmed')) {
          setGeneralError('이메일 인증이 완료되지 않았습니다. 이메일을 확인해주세요.');
          
          // 이메일 재전송 기능 추가
          const { data: resendData, error: resendError } = await supabase.auth.resend({
            type: 'signup',
            email: email,
            options: {
              emailRedirectTo: `${window.location.origin}/auth/callback`,
            }
          });
          
          if (!resendError) {
            setGeneralError('이메일 인증이 완료되지 않았습니다. 인증 이메일을 재전송했습니다.');
          }
        } else {
          setGeneralError(error.message);
        }
        return;
      }

      if (!data.session || !data.user) {
        setGeneralError('로그인 중 오류가 발생했습니다.');
        return;
      }

      // API 라우트를 통해 프로필 상태 확인
      try {
        const profileResponse = await fetch(`/api/auth/check-profile?userId=${data.user.id}`, {
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
          return;
        }

        if (profileData.status === 'rejected') {
          // 거부된 계정
          await supabase.auth.signOut();
          setGeneralError('계정이 승인되지 않았습니다. 관리자에게 문의해주세요.');
          return;
        }

        // 로그인 성공 시 홈페이지로 이동
        router.push('/');
      } catch (profileError: any) {
        console.error('프로필 확인 오류:', profileError);
        setGeneralError('사용자 정보 확인 중 오류가 발생했습니다. 다시 시도해주세요.');
        await supabase.auth.signOut();
      }
    } catch (error: any) {
      console.error('로그인 오류:', error);
      setGeneralError('로그인 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmail = async () => {
    if (!email) {
      setErrors({ ...errors, email: '이메일을 입력해주세요' });
      return;
    }
    
    setLoading(true);
    
    try {
      const { data, error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        }
      });
      
      if (error) {
        throw error;
      }
      
      setGeneralError('인증 이메일을 재전송했습니다. 이메일을 확인해주세요.');
    } catch (error: any) {
      console.error('이메일 재전송 오류:', error);
      setGeneralError('인증 이메일 재전송 중 오류가 발생했습니다.');
    } finally {
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
                {generalError.includes('이메일 인증') && (
                  <button 
                    onClick={handleResendEmail}
                    className="text-sm underline mt-1 text-[#FF4E4E] hover:text-[#FF7A7A]"
                  >
                    인증 메일 다시 받기
                  </button>
                )}
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
                  {loading ? '로그인 중...' : '로그인'}
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