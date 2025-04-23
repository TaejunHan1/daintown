// app/merchant-association/PostList.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

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
  expiry_date?: string;
  hasExpired?: boolean;
}

interface PostListProps {
  posts: Post[];
  onRefresh: () => void;
}

export default function PostList({ posts, onRefresh }: PostListProps) {
  const [postsPerPage, setPostsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [isCountSelectorOpen, setIsCountSelectorOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'landlord' | 'tenant'>('all');

  // 페이지당 게시글 수 옵션
  const countOptions = [1, 5, 10, 20];

  // 페이지당 게시글 수가 변경되면 현재 페이지를 1로 리셋
  useEffect(() => {
    setCurrentPage(1);
  }, [postsPerPage, activeTab]);
  
  // 선택된 탭에 따라 게시글 필터링
  const filteredPosts = posts.filter(post => {
    if (activeTab === 'all') return true;
    if (!post.signature_required) return false;
    
    if (activeTab === 'landlord') {
      return post.signature_target === 'landlord' || post.signature_target === 'both';
    }
    
    if (activeTab === 'tenant') {
      return post.signature_target === 'tenant' || post.signature_target === 'both';
    }
    
    return true;
  });

  // 페이지네이션 계산
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const handlePostsPerPageChange = (count: number) => {
    setPostsPerPage(count);
    setIsCountSelectorOpen(false);
  };

  // 날짜 포맷팅 함수
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
    } catch (e) {
      return dateString;
    }
  };
  
  // 만료일 상태 포맷팅 함수
  const formatExpiryStatus = (dateString?: string, hasExpired?: boolean) => {
    if (!dateString) return (
      <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-500">
        없음
      </span>
    );
    
    // hasExpired 값이 전달된 경우 이를 사용, 아니면 직접 계산
    if (hasExpired !== undefined) {
      if (hasExpired) {
        return (
          <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-red-50 text-red-600">
            만료됨
          </span>
        );
      }
    }
    
    const expiryDate = new Date(dateString);
    expiryDate.setHours(23, 59, 59, 999); // 만료일 끝까지 카운트하기 위해 시간 설정
    const now = new Date();
    
    // 오늘 기준 남은 일자 계산
    const diffTime = expiryDate.getTime() - now.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      // 만료됨
      return (
        <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-red-50 text-red-600">
          만료됨
        </span>
      );
    } else if (diffDays === 0) {
      // 오늘 만료
      return (
        <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-red-50 text-red-600">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          오늘 만료
        </span>
      );
    } else if (diffDays <= 3) {
      // 만료 임박
      return (
        <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-red-50 text-red-600">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {diffDays}일 남음
        </span>
      );
    } else {
      // 여유 있음
      return (
        <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-blue-50 text-blue-600">
          {formatDate(dateString)}까지
        </span>
      );
    }
  };
  
  // 서명 대상 표시 함수
  const formatSignatureTarget = (required: boolean, target: string | null, hasExpired?: boolean) => {
    if (!required) return null;
    
    // 만료된 경우
    if (hasExpired) return null;
    
    // 서명 대상에 따라 표시
    if (target === 'landlord') {
      return (
        <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-green-50 text-green-600 mr-2">
          임대인 서명 필요
        </span>
      );
    } else if (target === 'tenant') {
      return (
        <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-purple-50 text-purple-600 mr-2">
          임차인 서명 필요
        </span>
      );
    } else if (target === 'both') {
      return (
        <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-blue-50 text-blue-600 mr-2">
          임대인,임차인 서명 필요
        </span>
      );
    }
    
    return null;
  };

  if (posts.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <div className="py-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1M19 8l-7 5-7-5M12 15.5L5 10.5M19 10.5L14 14" />
          </svg>
          <p className="text-gray-600 font-medium">등록된 게시글이 없습니다</p>
          <p className="text-gray-500 text-sm mt-1">곧 새로운 소식을 전해드릴게요</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      {/* 탭 메뉴 */}
      <div className="border-b border-gray-100">
        <div className="px-4 flex">
          <button
            className={`py-3 px-4 text-sm font-medium border-b-2 ${
              activeTab === 'all'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('all')}
          >
            전체 게시글
            <span className="ml-1.5 px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
              {posts.length}
            </span>
          </button>
          
          <button
            className={`py-3 px-4 text-sm font-medium border-b-2 ${
              activeTab === 'landlord'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('landlord')}
          >
            임대인 서명
            <span className="ml-1.5 px-2 py-0.5 bg-green-50 text-green-600 rounded-full text-xs">
              {posts.filter(p => p.signature_required && (p.signature_target === 'landlord' || p.signature_target === 'both') && !p.hasExpired).length}
            </span>
          </button>
          
          <button
            className={`py-3 px-4 text-sm font-medium border-b-2 ${
              activeTab === 'tenant'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('tenant')}
          >
            임차인 서명
            <span className="ml-1.5 px-2 py-0.5 bg-purple-50 text-purple-600 rounded-full text-xs">
              {posts.filter(p => p.signature_required && (p.signature_target === 'tenant' || p.signature_target === 'both') && !p.hasExpired).length}
            </span>
          </button>
        </div>
      </div>

      {/* 상단 정보 영역 */}
      <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
        <div>
          <h2 className="text-sm font-medium text-gray-900">게시글 목록</h2>
          <p className="text-xs text-gray-500 mt-0.5">총 {filteredPosts.length}개의 게시글</p>
        </div>
        
        {/* 게시글 수 선택 드롭다운 */}
        <div className="relative">
          <button 
            className="flex items-center text-sm text-gray-600 bg-gray-50 hover:bg-gray-100 px-3 py-1.5 rounded-md"
            onClick={() => setIsCountSelectorOpen(!isCountSelectorOpen)}
          >
            {postsPerPage}개씩 보기
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className={`h-4 w-4 ml-1 transition-transform ${isCountSelectorOpen ? 'rotate-180' : ''}`} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {isCountSelectorOpen && (
            <div className="absolute right-0 mt-1 w-32 bg-white rounded-md shadow-lg overflow-hidden z-10 border border-gray-100">
              <div className="py-1">
                {countOptions.map(count => (
                  <button
                    key={count}
                    className={`w-full text-left px-4 py-2 text-sm ${postsPerPage === count ? 'bg-gray-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'}`}
                    onClick={() => handlePostsPerPageChange(count)}
                  >
                    {count}개씩 보기
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 게시글 카드 리스트 */}
      {filteredPosts.length === 0 ? (
        <div className="p-8 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-gray-600 font-medium">해당하는 게시글이 없습니다</p>
          <p className="text-gray-500 text-sm mt-1">다른 탭을 선택하거나 필터를 변경해보세요</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {currentPosts.map((post, index) => {
            // hasExpired 값이 설정된 경우 그 값을 사용, 아니면 직접 계산
            const isExpired = post.hasExpired !== undefined 
              ? post.hasExpired 
              : (post.expiry_date && new Date(post.expiry_date) < new Date());
            
            return (
              <Link
                href={`/merchant-association/${post.id}`}
                key={post.id}
                className="block hover:bg-gray-50 transition-colors"
              >
                <div className="px-5 py-4">
                  <div className="flex flex-col">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        {/* 번호 + 제목 */}
                        <div className="flex items-start">
                          <span className="flex-shrink-0 mr-3 text-gray-400 text-sm w-8 text-center">
                            {filteredPosts.length - (indexOfFirstPost + index)}
                          </span>
                          <h3 className={`text-sm font-medium ${isExpired ? 'text-gray-500' : 'text-gray-900'} line-clamp-2`}>
                            {post.title}
                          </h3>
                        </div>
                        
                        {/* 메타 정보 */}
                        <div className="mt-1.5 ml-11 flex items-center text-xs text-gray-500">
                          <span>{formatDate(post.created_at)}</span>
                          <span className="mx-1.5">•</span>
                          <span>조회 {post.views}</span>
                        </div>
                      </div>
                      
                      {/* 투표 만기일 + 화살표 */}
                      <div className="flex items-center pl-4 ml-2">
                        <div className="mr-2">
                          {formatExpiryStatus(post.expiry_date, post.hasExpired)}
                        </div>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                    
                    {/* 서명 요구사항 표시 */}
                    {(post.signature_required && !isExpired) && (
                      <div className="ml-11 mt-2 flex flex-wrap">
                        {formatSignatureTarget(post.signature_required, post.signature_target, !!isExpired)}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="px-5 py-4 flex justify-center border-t border-gray-100">
          <div className="flex items-center">
            <button
              onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className={`flex items-center px-3 py-1.5 rounded-md text-sm ${
                currentPage === 1 
                  ? 'text-gray-300 cursor-not-allowed' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              aria-label="이전 페이지"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              이전
            </button>
            
            <div className="flex mx-2">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                // 표시할 페이지 범위 계산
                let startPage = Math.max(1, currentPage - 2);
                const endPage = Math.min(startPage + 4, totalPages);
                
                if (endPage - startPage < 4) {
                  startPage = Math.max(1, endPage - 4);
                }
                
                return startPage + i;
              })
              .filter(page => page <= totalPages)
              .map(page => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`min-w-[2rem] px-3 py-1.5 mx-0.5 rounded-md text-sm ${
                    currentPage === page
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
            
            <button
              onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className={`flex items-center px-3 py-1.5 rounded-md text-sm ${
                currentPage === totalPages 
                  ? 'text-gray-300 cursor-not-allowed' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              aria-label="다음 페이지"
            >
              다음
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}