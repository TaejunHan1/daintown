// app/admin/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import supabase from '@/lib/supabase';

interface DashboardStats {
  totalUsers: number;
  pendingUsers: number;
  totalStores: number;
  feedbackCount: number;
}

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    pendingUsers: 0,
    totalStores: 0,
    feedbackCount: 0,
  });
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        router.push('/auth/login');
        return;
      }
      
      setUser(session.user);
      
      // API 라우트를 통해 관리자 권한 확인
      try {
        const response = await fetch(`/api/admin/check-role?userId=${session.user.id}`);
        if (!response.ok) {
          throw new Error('관리자 권한 확인 중 오류가 발생했습니다.');
        }
        
        const data = await response.json();
        
        if (data && data.role === 'admin') {
          setIsAdmin(true);
          fetchDashboardStats();
        } else {
          // 관리자가 아닌 경우 홈으로 리디렉션
          router.push('/');
        }
      } catch (error) {
        console.error('Error checking admin role:', error);
        router.push('/');
      }
    };

    checkUser();
  }, [router]);

  // 대시보드 통계 가져오기
  const fetchDashboardStats = async () => {
    setLoading(true);
    try {
      // API 라우트를 통해 대시보드 통계 가져오기
      const response = await fetch('/api/admin/dashboard-stats');
      if (!response.ok) {
        throw new Error('통계 데이터를 가져오는 중 오류가 발생했습니다.');
      }
      
      const statsData = await response.json();
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-3 text-gray-600">확인 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-custom mx-auto px-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">관리자 대시보드</h1>

        {loading ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
            <p className="mt-3 text-gray-600">통계를 불러오는 중...</p>
          </div>
        ) : (
          <>
            {/* 통계 카드 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-blue-100 text-blue-500 mr-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">전체 사용자</p>
                    <p className="text-2xl font-bold">{stats.totalUsers}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-yellow-100 text-yellow-500 mr-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">승인 대기 사용자</p>
                    <p className="text-2xl font-bold">{stats.pendingUsers}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-green-100 text-green-500 mr-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">전체 매장</p>
                    <p className="text-2xl font-bold">{stats.totalStores}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-purple-100 text-purple-500 mr-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">고객 피드백</p>
                    <p className="text-2xl font-bold">{stats.feedbackCount}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 관리 메뉴 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Link
                href="/admin/users"
                className="bg-white rounded-lg shadow-md p-6 transition-all hover:shadow-lg"
              >
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-blue-100 text-blue-500 mr-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">사용자 관리</h3>
                    <p className="text-gray-600">사용자 승인 및 관리</p>
                  </div>
                </div>
              </Link>

              <Link
                href="/admin/stores"
                className="bg-white rounded-lg shadow-md p-6 transition-all hover:shadow-lg"
              >
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-green-100 text-green-500 mr-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">매장 관리</h3>
                    <p className="text-gray-600">모든 매장 정보 관리</p>
                  </div>
                </div>
              </Link>

              <Link
                href="/admin/feedback"
                className="bg-white rounded-lg shadow-md p-6 transition-all hover:shadow-lg"
              >
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-purple-100 text-purple-500 mr-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      피드백 관리
                    </h3>
                    <p className="text-gray-600">고객 피드백 및 문의 관리</p>
                  </div>
                </div>
              </Link>

              <Link
                href="/admin/building"
                className="bg-white rounded-lg shadow-md p-6 transition-all hover:shadow-lg"
              >
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-red-100 text-red-500 mr-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">건물 정보</h3>
                    <p className="text-gray-600">건물 정보 관리</p>
                  </div>
                </div>
              </Link>

              <Link
                href="/admin/parking"
                className="bg-white rounded-lg shadow-md p-6 transition-all hover:shadow-lg"
              >
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-yellow-100 text-yellow-500 mr-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">주차 정보</h3>
                    <p className="text-gray-600">주차 정보 관리</p>
                  </div>
                </div>
              </Link>

              <Link
                href="/admin/merchant-association"
                className="bg-white rounded-lg shadow-md p-6 transition-all hover:shadow-lg"
              >
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-indigo-100 text-indigo-500 mr-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">상가번영회</h3>
                    <p className="text-gray-600">상가번영회 정보 관리</p>
                  </div>
                </div>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}