// app/merchant-association/create/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import supabase from '../../../lib/supabase';
import dynamic from 'next/dynamic';

// 에디터는 클라이언트 사이드에서만 로드되도록 dynamic import
const Editor = dynamic(() => import('../../../components/Editor'), { 
  ssr: false,
  loading: () => (
    <div className="toss-card flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      <p className="ml-3 text-gray-600">에디터 로딩 중...</p>
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
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      try {
        console.log('사용자 세션 확인 중...');
        // 사용자 세션 확인
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error('세션 가져오기 오류:', sessionError);
          setError('세션 정보를 가져오는 중 오류가 발생했습니다.');
          setLoading(false);
          return;
        }

        if (!session?.user) {
          console.log('로그인되지 않음, 로그인 페이지로 리디렉션');
          // 인증되지 않은 사용자는 로그인 페이지로 리디렉션
          router.push('/auth/login?redirect=/merchant-association');
          return;
        }

        console.log('로그인 확인됨, 사용자 ID:', session.user.id);

        // 관리자 권한 확인
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
            // 관리자가 아닌 경우 상가번영회 메인 페이지로 리디렉션
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

    setSubmitting(true);

    try {
      console.log('게시글 작성 요청 시작...');
      
      const requestBody = {
        title,
        content,
        signatureRequired,
        signatureTarget: signatureRequired ? signatureTarget : null,
      };
      
      console.log('요청 데이터:', requestBody);
      
      // 단순화된 요청
      const response = await fetch('/api/merchant-association/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      console.log('API 응답 상태:', response.status);
      
      let errorData = {};
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
      
      // 성공 시 상세 페이지로 이동
      if ((responseData as any).id) {
        router.push(`/merchant-association/${(responseData as any).id}`);
      } else {
        console.error('응답에 ID가 없음');
        router.push('/merchant-association'); // ID가 없으면 목록으로
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
        <div className="toss-card text-center p-6">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-3 text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container-custom mx-auto px-4">
          <div className="toss-card p-8 text-center">
            <div className="text-center text-red-600 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h2 className="text-2xl font-bold mt-2">접근 권한이 없습니다</h2>
            </div>
            <p className="text-center text-gray-600 mb-6">게시글 작성은 관리자만 가능합니다.</p>
            <div className="text-center">
              <Link href="/merchant-association" className="btn-secondary">
                목록으로 돌아가기
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">상가번영회 게시글 작성</h1>
        </div>

        {error && (
          <div className="toss-alert-error mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="toss-card mb-6">
            <div className="p-6">
              <div className="mb-4">
                <label htmlFor="title" className="form-label">제목</label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="form-input"
                  placeholder="게시글 제목을 입력하세요"
                  required
                />
              </div>

              <div className="mb-6">
                <label className="form-label">내용</label>
                <Editor 
                  value={content}
                  onChange={handleEditorChange}
                />
              </div>

              <div className="mb-6">
                <div className="flex items-center mb-4">
                  <input
                    type="checkbox"
                    id="signatureRequired"
                    checked={signatureRequired}
                    onChange={() => setSignatureRequired(!signatureRequired)}
                    className="h-4 w-4 text-blue-500 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="signatureRequired" className="ml-2 block text-gray-700">
                    서명이 필요한 게시글
                  </label>
                </div>

                {signatureRequired && (
                  <div className="ml-6 p-4 bg-gray-50 rounded-lg">
                    <label className="block text-gray-700 font-medium mb-2">서명 대상</label>
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
                        <label htmlFor="both" className="ml-2 block text-gray-700">
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
                        <label htmlFor="landlord" className="ml-2 block text-gray-700">
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
                        <label htmlFor="tenant" className="ml-2 block text-gray-700">
                          임차인만
                        </label>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between">
              <Link href="/merchant-association" className="btn-secondary">
                취소
              </Link>
              <button
                type="submit"
                className="btn-primary"
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