// app/merchant-association/create/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import supabase from '../../../lib/supabase';
import dynamic from 'next/dynamic';

// WYSIWYG 에디터를 클라이언트 사이드에서만 로드
const WysiwygEditor = dynamic(() => import('../../../components/WysiwygEditor'), { 
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-64 bg-white rounded-xl border border-gray-100 shadow-sm p-6">
      <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent"></div>
      <p className="ml-3 text-gray-600 text-sm font-medium">에디터 로딩 중...</p>
    </div>
  )
});

export default function CreatePost() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [signatureRequired, setSignatureRequired] = useState(false);
  const [signatureTarget, setSignatureTarget] = useState<string>('both');
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [expiryDate, setExpiryDate] = useState<string>('');
  const [hasExpiryDate, setHasExpiryDate] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      try {
        console.log('사용자 세션 확인 중...');
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error('세션 가져오기 오류:', sessionError);
          setError('세션 정보를 가져오는 중 오류가 발생했습니다.');
          setLoading(false);
          return;
        }

        if (!session?.user) {
          console.log('로그인되지 않음, 로그인 페이지로 리디렉션');
          router.push('/auth/login?redirect=/merchant-association');
          return;
        }

        console.log('로그인 확인됨, 사용자 ID:', session.user.id);

        try {
          console.log('관리자 권한 확인 중...');
          const response = await fetch(`/api/admin/check-role?userId=${session.user.id}`);
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || '관리자 권한 확인 중 오류가 발생했습니다.');
          }
          
          const data = await response.json();
          
          if (data && data.role === 'admin') {
            console.log('관리자 권한 확인됨');
            setIsAdmin(true);
          } else {
            console.log('관리자 권한 없음, 리디렉션');
            router.push('/merchant-association');
          }
        } catch (error) {
          console.error('관리자 권한 확인 오류:', error);
          setError('관리자 권한을 확인하는 중 오류가 발생했습니다.');
          router.push('/merchant-association');
        } finally {
          setLoading(false);
        }
      } catch (error) {
        console.error('사용자 확인 중 예외 발생:', error);
        setError('사용자 정보를 확인하는 중 오류가 발생했습니다.');
        setLoading(false);
      }
    };

    checkUser();
  }, [router]);

  const handleEditorChange = (updatedContent: string) => {
    setContent(updatedContent);
  };

  // 오늘 날짜 기준으로 최소 날짜 설정 (내일부터 선택 가능)
  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('제목을 입력해주세요.');
      return;
    }

    if (!content.trim()) {
      setError('내용을 입력해주세요.');
      return;
    }

    if (signatureRequired && !signatureTarget) {
      setError('서명 대상을 선택해주세요.');
      return;
    }

    if (hasExpiryDate && !expiryDate) {
      setError('만료 기한을 설정해주세요.');
      return;
    }

    setSubmitting(true);

    try {
      console.log('게시글 작성 요청 시작...');
      
      const requestBody = {
        title,
        content,
        signatureRequired,
        signatureTarget: signatureRequired ? signatureTarget : null,
        expiry_date: hasExpiryDate ? new Date(expiryDate).toISOString() : null
      };
      
      console.log('요청 데이터:', requestBody);
      
      const response = await fetch('/api/merchant-association/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      console.log('API 응답 상태:', response.status);
      
      let responseData = {};
      
      try {
        const responseText = await response.text();
        console.log('응답 원본 텍스트:', responseText);
        
        if (responseText) {
          try {
            responseData = JSON.parse(responseText);
            console.log('파싱된 응답 데이터:', responseData);
          } catch (jsonError) {
            console.error('JSON 파싱 오류:', jsonError);
            console.log('파싱할 수 없는 응답:', responseText);
          }
        } else {
          console.log('빈 응답 수신');
        }
      } catch (textError) {
        console.error('응답 텍스트 읽기 오류:', textError);
      }
      
      if (!response.ok) {
        console.error('API 오류 응답:', responseData);
        throw new Error(
          (responseData as any).error || 
          '게시글 작성 중 오류가 발생했습니다. 상태 코드: ' + response.status
        );
      }

      console.log('게시글 작성 성공:', responseData);
      
      if ((responseData as any).id) {
        router.push(`/merchant-association/${(responseData as any).id}`);
      } else {
        console.error('응답에 ID가 없음');
        router.push('/merchant-association');
      }
    } catch (error: any) {
      console.error('게시글 작성 오류:', error);
      setError(error.message || '게시글 작성 중 오류가 발생했습니다.');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-sm p-6 text-center w-64">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent mx-auto"></div>
          <p className="mt-3 text-gray-600 text-sm font-medium">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-md mx-auto px-4">
          <div className="bg-white rounded-xl shadow-sm p-6 text-center">
            <div className="text-center text-red-500 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h2 className="text-lg font-medium mt-2">접근 권한이 없습니다</h2>
            </div>
            <p className="text-gray-600 text-sm mb-6">게시글 작성은 관리자만 가능합니다.</p>
            <Link href="/merchant-association" 
                  className="inline-flex justify-center items-center px-4 py-3 rounded-xl text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200">
              목록으로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-6">
          <h1 className="text-xl font-medium text-gray-800">상가번영회 게시글 작성</h1>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-100 rounded-xl p-4 flex items-start">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm text-red-800">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
            <div className="p-6">
              <div className="mb-5">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">제목</label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-3 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  placeholder="게시글 제목을 입력하세요"
                  required
                />
              </div>

              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-1">내용</label>
                <WysiwygEditor 
                  value={content}
                  onChange={handleEditorChange}
                />
              </div>

              {/* 만료 기한 설정 */}
              <div className="mb-5">
                <div className="flex items-center mb-3">
                  <input
                    type="checkbox"
                    id="hasExpiryDate"
                    checked={hasExpiryDate}
                    onChange={() => setHasExpiryDate(!hasExpiryDate)}
                    className="h-4 w-4 text-blue-500 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="hasExpiryDate" className="ml-2 block text-sm text-gray-700">
                    만료 기한 설정하기
                  </label>
                </div>

                {hasExpiryDate && (
                  <div className="ml-6 p-4 bg-gray-50 rounded-xl">
                    <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 mb-2">
                      만료 기한
                      <span className="ml-1 text-xs text-gray-500">(만료 후에는 게시글 수정 및 서명이 불가능합니다)</span>
                    </label>
                    <input
                      type="date"
                      id="expiryDate"
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(e.target.value)}
                      min={getMinDate()}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      required={hasExpiryDate}
                    />
                  </div>
                )}
              </div>

              <div className="mb-5">
                <div className="flex items-center mb-3">
                  <input
                    type="checkbox"
                    id="signatureRequired"
                    checked={signatureRequired}
                    onChange={() => setSignatureRequired(!signatureRequired)}
                    className="h-4 w-4 text-blue-500 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="signatureRequired" className="ml-2 block text-sm text-gray-700">
                    서명이 필요한 게시글
                  </label>
                </div>

                {signatureRequired && (
                  <div className="ml-6 p-4 bg-gray-50 rounded-xl">
                    <label className="block text-sm font-medium text-gray-700 mb-2">서명 대상</label>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <input
                          type="radio"
                          id="both"
                          name="signatureTarget"
                          value="both"
                          checked={signatureTarget === 'both'}
                          onChange={() => setSignatureTarget('both')}
                          className="h-4 w-4 text-blue-500 focus:ring-blue-500 border-gray-300"
                        />
                        <label htmlFor="both" className="ml-2 block text-sm text-gray-700">
                          임대인 및 임차인 모두
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="radio"
                          id="landlord"
                          name="signatureTarget"
                          value="landlord"
                          checked={signatureTarget === 'landlord'}
                          onChange={() => setSignatureTarget('landlord')}
                          className="h-4 w-4 text-blue-500 focus:ring-blue-500 border-gray-300"
                        />
                        <label htmlFor="landlord" className="ml-2 block text-sm text-gray-700">
                          임대인만
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="radio"
                          id="tenant"
                          name="signatureTarget"
                          value="tenant"
                          checked={signatureTarget === 'tenant'}
                          onChange={() => setSignatureTarget('tenant')}
                          className="h-4 w-4 text-blue-500 focus:ring-blue-500 border-gray-300"
                        />
                        <label htmlFor="tenant" className="ml-2 block text-sm text-gray-700">
                          임차인만
                        </label>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-between">
              <Link href="/merchant-association" 
                    className="inline-flex justify-center items-center px-4 py-3 rounded-xl text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200">
                취소
              </Link>
              <button
                type="submit"
                className="inline-flex justify-center items-center px-4 py-3 rounded-xl text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                disabled={submitting}
              >
                {submitting ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    저장 중...
                  </span>
                ) : '게시글 저장'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}