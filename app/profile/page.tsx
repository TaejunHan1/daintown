// app/profile/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '@/lib/supabase';
import Link from 'next/link';

interface Profile {
  id: string;
  full_name: string;
  phone_number: string;
  business_registration_doc: string | null;
  signature_data: string | null;
  role: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface StoreUser {
  store_id: string;
  user_type: string;
  store_name: string;
}

export default function Profile() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [storeRoles, setStoreRoles] = useState<StoreUser[]>([]);
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        router.push('/auth/login');
        return;
      }
      
      setUser(session.user);
      fetchProfile(session.user.id);
      fetchUserRoles(session.user.id);
    };

    checkUser();
  }, [router]);

  const fetchProfile = async (userId: string) => {
    setLoading(true);
    try {
      // API 라우트를 통해 프로필 정보 가져오기
      const response = await fetch(`/api/profile?userId=${userId}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '프로필 정보를 가져오는 중 오류가 발생했습니다.');
      }
      
      const profileData = await response.json();
      
      if (profileData) {
        setProfile(profileData);
        setFullName(profileData.full_name || '');
        setPhoneNumber(profileData.phone_number || '');
      }
    } catch (err: any) {
      console.error('Error fetching profile:', err);
      setError(err.message || '프로필 정보를 가져오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };
  
  // 사용자 역할 정보 가져오기
  const fetchUserRoles = async (userId: string) => {
    try {
      const response = await fetch(`/api/merchant-association/user-stores?userId=${userId}`);
      
      if (response.ok) {
        const data = await response.json();
        setStoreRoles(data);
      } else {
        console.error('사용자 역할 정보를 가져오는데 실패했습니다.');
        setStoreRoles([]);
      }
    } catch (err) {
      console.error('Error fetching user roles:', err);
      setStoreRoles([]);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(false);
    setError(null);
    setLoading(true);

    try {
      // API 라우트를 통해 프로필 정보 업데이트 (이름만 업데이트)
      const response = await fetch('/api/profile/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          fullName,
          phoneNumber: profile?.phone_number, // 기존 전화번호 유지 (수정되지 않도록)
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '프로필 업데이트 중 오류가 발생했습니다.');
      }

      setSuccess(true);
      
      // 프로필 정보 다시 가져오기
      fetchProfile(user.id);
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setError(err.message || '프로필 업데이트 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 사용자 유형 텍스트 변환
  const getUserTypeText = (type: string) => {
    switch (type) {
      case 'landlord':
        return '임대인';
      case 'tenant':
        return '임차인';
      default:
        return type;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-3 text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  // 현재 날짜 포맷팅 함수
  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container-custom mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          {/* 토스 스타일 헤더 */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800">내 프로필</h1>
            <p className="text-gray-500">회원 정보 및 서명 관리</p>
          </div>

          {/* 알림 메시지 */}
          {success && (
            <div className="mb-4 bg-blue-50 text-blue-700 px-4 py-3 rounded-lg flex items-center border border-blue-100">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              프로필이 성공적으로 업데이트되었습니다.
            </div>
          )}

          {error && (
            <div className="mb-4 bg-red-50 text-red-700 px-4 py-3 rounded-lg flex items-center border border-red-100">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          {/* 메인 프로필 카드 - 토스 스타일 */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-6 border border-gray-100">
            <div className="p-6">
              <div className="flex items-center mb-6">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center text-blue-600 text-2xl font-bold mr-4">
                  {fullName ? fullName.charAt(0).toUpperCase() : 'U'}
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{fullName || '이름 없음'}</h2>
                  <p className="text-gray-600">{user?.email}</p>
                </div>
              </div>

              {/* 계정 정보 섹션 - 토스 스타일 */}
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <h3 className="text-sm font-medium text-gray-500 mb-3">계정 정보</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">계정 유형</p>
                    <p className="font-medium text-gray-900">
                      {profile?.role === 'admin' ? '관리자' : '일반 사용자'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">계정 상태</p>
                    <div>
                      {profile?.status === 'approved' ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-600 mr-1"></span>
                          승인됨
                        </span>
                      ) : profile?.status === 'pending' ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 mr-1"></span>
                          승인 대기 중
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-600 mr-1"></span>
                          거부됨
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">가입일</p>
                    <p className="font-medium text-gray-900">
                      {formatDate(profile?.created_at || '')}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">마지막 업데이트</p>
                    <p className="font-medium text-gray-900">
                      {formatDate(profile?.updated_at || '')}
                    </p>
                  </div>
                </div>
              </div>

              {/* 매장 역할 정보 - NEW */}
              {storeRoles && storeRoles.length > 0 && (
                <div className="bg-gray-50 rounded-xl p-4 mb-6">
                  <h3 className="text-sm font-medium text-gray-500 mb-3">내 매장 역할</h3>
                  <div className="space-y-3">
                    {storeRoles.map((role, index) => (
                      <div key={index} className="flex items-center bg-white p-3 rounded-lg shadow-sm border border-gray-100">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center mr-3">
                          <span className={`inline-block w-2.5 h-2.5 rounded-full ${
                            role.user_type === 'landlord' ? 'bg-purple-500' : 'bg-blue-500'
                          }`}></span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{role.store_name || '매장명 없음'}</p>
                          <p className="text-sm text-gray-600">{getUserTypeText(role.user_type)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 서명 및 사업자 등록증 섹션 - 토스 스타일 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {profile?.signature_data && (
                  <div className="border border-gray-200 rounded-xl p-4 bg-white">
                    <h3 className="text-sm font-medium text-gray-500 mb-3">내 서명</h3>
                    <div className="border rounded-lg p-3 bg-[#FCFCFC] flex items-center justify-center">
                      <img 
                        src={profile.signature_data} 
                        alt="사용자 서명" 
                        className="max-h-16"
                      />
                    </div>
                  </div>
                )}

                {profile?.business_registration_doc && (
                  <div className="border border-gray-200 rounded-xl p-4 bg-white">
                    <h3 className="text-sm font-medium text-gray-500 mb-3">사업자 등록증</h3>
                    <a
                      href={profile.business_registration_doc}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      사업자 등록증 보기
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 프로필 수정 폼 - 토스 스타일 */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">프로필 수정</h3>
              <form onSubmit={handleUpdateProfile}>
                <div className="mb-4">
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                    이름
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-6">
                  <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                    연락처
                  </label>
                  <input
                    id="phoneNumber"
                    type="tel"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                    value={phoneNumber}
                    disabled
                    readOnly
                  />
                  <div className="mt-2 flex items-start p-3 bg-blue-50 rounded-lg text-blue-700 text-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <p>
                      연락처 정보는 보안상의 이유로 웹사이트에서 직접 수정할 수 없습니다. 
                      변경이 필요하시면 <Link href="#" className="font-medium text-blue-700 underline">오픈 채팅방</Link>에 문의해 주세요.
                    </p>
                  </div>
                </div>

                <button
                  type="submit"
                  className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 w-full md:w-auto"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      업데이트 중...
                    </span>
                  ) : '프로필 업데이트'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}