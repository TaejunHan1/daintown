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
  signatures_public?: boolean;
  expiry_date?: string;
  hasExpired?: boolean;
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
      
      // 만료일 기준으로 서명 가능 여부 체크 및 정렬
      const postsWithExpiryStatus = data.map((post: any) => {
        // 현재 날짜와 만료일을 비교하여 만료 여부 확인 (시간은 제외하고 날짜만 비교)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const expiryDate = post.expiry_date ? new Date(post.expiry_date) : null;
        if (expiryDate) {
          expiryDate.setHours(0, 0, 0, 0);
        }
        
        const hasExpired = expiryDate ? expiryDate < today : false;
        return { ...post, hasExpired };
      });
      
      // 만료되지 않은 글을 먼저 보여주고, 그 다음 만료된 글 표시
      const sortedPosts = postsWithExpiryStatus.sort((a: any, b: any) => {
        // 만료 여부로 먼저 정렬
        if (a.hasExpired !== b.hasExpired) {
          return a.hasExpired ? 1 : -1;
        }
        // 그 다음 최신순으로 정렬
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
      
      setPosts(sortedPosts);
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
        <div className="bg-white rounded-lg shadow-sm p-8 w-full max-w-md">
          {/* Toss-style loading pulse animation */}
          <div className="flex justify-center">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 bg-blue-100 rounded-full"></div>
              <div className="absolute inset-0 bg-blue-400 rounded-full animate-pulse opacity-75"></div>
              <div className="absolute inset-2.5 bg-white rounded-full"></div>
            </div>
          </div>
          <p className="mt-6 text-center text-gray-700 font-medium">로그인 정보를 확인하고 있어요</p>
          <p className="mt-2 text-center text-gray-500 text-sm">잠시만 기다려주세요</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-gray-900">상가번영회</h1>
            
            <div className="flex items-center">
              {isAdmin && (
                <Link 
                  href="/merchant-association/create" 
                  className="inline-flex items-center px-4 py-2.5 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors shadow-sm"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  글쓰기
                </Link>
              )}
            </div>
          </div>
          
          <p className="text-gray-700 mb-5">
            상가번영회의 공지사항과 공동 협의사항을 확인하고, 모든 문서에 전자서명을 진행할 수 있습니다.
            각 문서마다 서명 기한이 표시되며, 기한 내에 서명해주셔야 합니다.
          </p>
          
          <details className="mb-5 bg-gray-50 rounded-lg border border-gray-100">
            <summary className="px-4 py-3 text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors rounded-lg">
              전자서명 이용 안내
            </summary>
            <div className="px-4 py-3 text-sm text-gray-600 border-t border-gray-100">
              <p className="mb-2">• 서명이 필요한 문서는 <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs">서명 필요</span> 표시가 있습니다.</p>
              <p className="mb-2">• 서명 기간이 만료된 문서는 <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full text-xs">서명 기간 종료</span> 표시가 있습니다.</p>
              <p className="mb-2">• 회원가입 시 등록한 서명이 전자서명에 사용됩니다.</p>
              <p>• 서명 후에는 철회가 불가능하니 내용을 꼼꼼히 확인해주세요.</p>
            </div>
          </details>
        </div>

        {loading ? (
          <div className="bg-white rounded-lg shadow-sm p-10 text-center">
            {/* Toss-style skeleton loader */}
            <div className="flex flex-col items-center">
              <div className="w-full max-w-md space-y-4">
                <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-6 bg-gray-200 rounded animate-pulse w-3/4"></div>
                <div className="h-6 bg-gray-200 rounded animate-pulse w-1/2"></div>
                <div className="h-20 bg-gray-200 rounded-lg animate-pulse mt-4"></div>
              </div>
              <p className="mt-8 text-gray-600 font-medium">게시글을 불러오고 있어요</p>
              <p className="mt-1 text-gray-500 text-sm">잠시만 기다려주세요</p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-50 rounded-full mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-lg font-bold text-gray-900">문제가 발생했어요</h2>
              <p className="text-gray-600 mt-2">{error}</p>
            </div>
            <div className="text-center">
              <button 
                onClick={refreshPosts}
                className="px-4 py-2.5 bg-gray-100 text-gray-800 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
              >
                다시 불러오기
              </button>
            </div>
          </div>
        ) : posts.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-10 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 rounded-full mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-gray-900">등록된 게시글이 없어요</h2>
            <p className="text-gray-600 mt-2">곧 새로운 소식을 전해드릴게요</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-medium text-gray-900">공지사항 및 계약서</h2>
              <p className="text-sm text-gray-500 mt-1">최신 소식을 확인하세요</p>
            </div>
            <PostList posts={posts} onRefresh={refreshPosts} />
          </div>
        )}
        
        {/* 추가 설명 섹션 */}
        <div className="mt-8 bg-blue-50 rounded-lg p-5 text-sm text-blue-800">
          <h3 className="font-medium mb-2">알려드립니다</h3>
          <ul className="space-y-2">
            <li className="flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>서명 기한이 지난 문서는 <span className="px-2 py-0.5 bg-red-50 text-red-600 rounded text-xs">만료됨</span> 표시가 되며 더 이상 서명이 불가능합니다.</span>
            </li>
            <li className="flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>중요 안건은 오프라인 모임에서도 논의되니 참석해주세요.</span>
            </li>
            <li className="flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>문의사항은 1층 뻐끔뻐끔전자담배 매장에 오셔서 직접 문의 주셔도 됩니다.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}