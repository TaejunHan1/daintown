// app/merchant-association/PostList.tsx
'use client';

import { useState } from 'react';
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
}

interface PostListProps {
  posts: Post[];
  onRefresh: () => void;
}

export default function PostList({ posts, onRefresh }: PostListProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 10;

  // 페이지네이션 계산
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = posts.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages = Math.ceil(posts.length / postsPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
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

  if (posts.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <p className="text-gray-600">등록된 게시글이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                번호
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                제목
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                작성자
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                작성일
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                조회수
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                서명 필요
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentPosts.map((post, index) => (
              <tr key={post.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {posts.length - (indexOfFirstPost + index)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Link href={`/merchant-association/${post.id}`} className="text-primary hover:underline font-medium">
                    {post.title}
                  </Link>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {post.author_name || '관리자'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(post.created_at)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {post.views}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {post.signature_required ? (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                      필요
                    </span>
                  ) : (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                      불필요
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="px-6 py-4 flex justify-center">
          <nav className="flex items-center">
            <button
              onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded-md ${
                currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              이전
            </button>
            
            <div className="flex mx-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                <button
                  key={number}
                  onClick={() => handlePageChange(number)}
                  className={`px-3 py-1 mx-1 rounded-md ${
                    currentPage === number
                      ? 'bg-primary text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {number}
                </button>
              ))}
            </div>
            
            <button
              onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className={`px-3 py-1 rounded-md ${
                currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              다음
            </button>
          </nav>
        </div>
      )}
    </div>
  );
}