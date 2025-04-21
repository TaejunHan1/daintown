// app/merchant-association/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import supabase from '../../lib/supabase';
import PostList from '../../components/merchant-association/PostList';

interface Post {
  id: string;
  title: string;
  content: string;
  views: number;
  author_id: string;
  signature_required: boolean;
  signature_target: string | null;
  created_at: string;
  updated_at: string;
  author_name?: string;
}

export default function MerchantAssociation() {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      // 사용자 세션 확인
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.user) {
        // 인증되지 않은 사용자는 로그인 페이지로 리디렉션
        router.push('/auth/login?redirect=/merchant-association');
        return;
      }

      setIsAuthenticated(true);

      // 관리자 권한 확인
      try {
        const response = await fetch(`/api/admin/check-role?userId=${session.user.id}`);
        if (response.ok) {
          const data = await response.json();
          if (data && data.role === 'admin') {
            setIsAdmin(true);
          }
        }
      } catch (error) {
        console.error('Error checking admin role:', error);
      }

      // 게시글 목록 가져오기
      fetchPosts(session);
    };

    checkUser();
  }, [router]);

  const fetchPosts = async (session: any) => {
    try {
      setLoading(true);
      
      // 인증 토큰 포함하여 요청
      const response = await fetch('/api/merchant-association', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('API error response:', errorData);
        throw new Error(errorData.error || '게시글 목록을 가져오는 중 오류가 발생했습니다.');
      }
      
      const data = await response.json();
      
      // 데이터 로깅하여 실제 반환 내용 확인 (디버깅용)
      console.log('Fetched posts:', data);
      
      // 더미 데이터인지 확인 (ID로 판단)
      const hasDummyData = data.some((post: Post) => 
        post.id === '00000000-0000-0000-0000-000000000000'
      );
      
      if (hasDummyData && data.length === 1) {
        console.log('Only dummy data returned');
      }
      
      setPosts(data);
    } catch (error) {
      console.error('Error fetching posts:', error);
      setError('게시글 목록을 가져오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const refreshPosts = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await fetchPosts(session);
      }
    } catch (error) {
      console.error('Error refreshing posts:', error);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="toss-card text-center p-6">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-3 text-gray-600">인증 확인 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">상가번영회</h1>
            
            <div className="flex items-center">
              {isAdmin && (
                <Link 
                  href="/merchant-association/create" 
                  className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  글쓰기
                </Link>
              )}
            </div>
          </div>
          
          <p className="text-lg text-gray-600 mb-4">
            상가번영회 공지사항과 계약 관련 문서를 확인하고 서명할 수 있습니다.
          </p>
          
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
            <p className="text-blue-800">
              <span className="font-medium">안내:</span> 계약서에 서명이 필요한 경우, 회원가입 시 등록한 서명이 사용됩니다.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">게시글을 불러오는 중...</p>
          </div>
        ) : error ? (
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="text-center text-red-600 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h2 className="text-2xl font-bold mt-2">오류가 발생했습니다</h2>
            </div>
            <p className="text-center text-gray-600 mb-6">{error}</p>
            <div className="text-center">
              <button 
                onClick={refreshPosts}
                className="btn-secondary"
              >
                다시 시도
              </button>
            </div>
          </div>
        ) : (
          <PostList posts={posts} onRefresh={refreshPosts} />
        )}
      </div>
    </div>
  );
}