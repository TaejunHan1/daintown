// app/profile/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '@/lib/supabase';

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

export default function Profile() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
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

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container-custom mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-primary py-4 px-6">
              <h1 className="text-2xl font-bold text-white">내 프로필</h1>
            </div>

            <div className="p-6">
              {success && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                  프로필이 성공적으로 업데이트되었습니다.
                </div>
              )}

              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                  {error}
                </div>
              )}

              <div className="mb-6">
                <div className="flex items-center mb-4">
                  <div className="bg-gray-200 w-16 h-16 rounded-full flex items-center justify-center text-gray-600 text-2xl mr-4">
                    {fullName ? fullName.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">{fullName || '이름 없음'}</h2>
                    <p className="text-gray-600">{user?.email}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="text-sm text-gray-500">계정 유형</p>
                    <p className="font-medium">
                      {profile?.role === 'admin' ? '관리자' : '일반 사용자'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">상태</p>
                    <p className="font-medium">
                      {profile?.status === 'approved' ? (
                        <span className="text-green-600">승인됨</span>
                      ) : profile?.status === 'pending' ? (
                        <span className="text-yellow-600">승인 대기 중</span>
                      ) : (
                        <span className="text-red-600">거부됨</span>
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">가입일</p>
                    <p className="font-medium">
                      {profile?.created_at
                        ? new Date(profile.created_at).toLocaleDateString('ko-KR')
                        : '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">마지막 업데이트</p>
                    <p className="font-medium">
                      {profile?.updated_at
                        ? new Date(profile.updated_at).toLocaleDateString('ko-KR')
                        : '-'}
                    </p>
                  </div>
                </div>

                {profile?.business_registration_doc && (
                  <div className="mb-6">
                    <p className="text-sm text-gray-500 mb-1">사업자 등록증</p>
                    <div>
                      <a
                        href={profile.business_registration_doc}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        사업자 등록증 보기
                      </a>
                    </div>
                  </div>
                )}

                {profile?.signature_data && (
                  <div className="mb-6">
                    <p className="text-sm text-gray-500 mb-1">서명</p>
                    <div className="border rounded p-2 bg-[#FCFCFC] max-w-xs">
                      <img 
                        src={profile.signature_data} 
                        alt="사용자 서명" 
                        className="max-h-16"
                      />
                    </div>
                  </div>
                )}
              </div>

              <hr className="my-6" />

              <h3 className="text-xl font-semibold mb-4">프로필 수정</h3>
              <form onSubmit={handleUpdateProfile}>
                <div className="mb-4">
                  <label htmlFor="fullName" className="form-label">
                    이름
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    className="form-input"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-6">
                  <label htmlFor="phoneNumber" className="form-label">
                    연락처 (수정 불가)
                  </label>
                  <input
                    id="phoneNumber"
                    type="tel"
                    className="form-input bg-gray-100"
                    value={phoneNumber}
                    disabled
                    readOnly
                  />
                  <p className="mt-1 text-sm text-gray-500">연락처 정보는 수정할 수 없습니다.</p>
                </div>

                <button
                  type="submit"
                  className="btn-primary"
                  disabled={loading}
                >
                  {loading ? '업데이트 중...' : '프로필 업데이트'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}