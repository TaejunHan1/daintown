// app/admin/users/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import supabase from '@/lib/supabase';

interface Profile {
  id: string;
  full_name: string;
  email?: string;
  phone_number: string;
  business_registration_doc: string | null;
  role: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export default function AdminUsers() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [users, setUsers] = useState<Profile[]>([]);
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
          fetchUsers();
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

  // 모든 사용자 가져오기
  const fetchUsers = async () => {
    setLoading(true);
    try {
      // API 라우트를 통해 사용자 목록 가져오기
      const response = await fetch('/api/admin/users');
      if (!response.ok) {
        throw new Error('사용자 목록을 가져오는 중 오류가 발생했습니다.');
      }
      
      const userData = await response.json();
      setUsers(userData || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  // 사용자 상태 업데이트 (승인/거부)
  const updateUserStatus = async (userId: string, newStatus: string) => {
    try {
      // API 라우트를 통해 사용자 상태 업데이트
      const response = await fetch('/api/admin/users/update-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          status: newStatus
        }),
      });

      if (!response.ok) {
        throw new Error('사용자 상태 업데이트 중 오류가 발생했습니다.');
      }

      // 상태 업데이트 후 사용자 목록 새로고침
      fetchUsers();
    } catch (error) {
      console.error('Error updating user status:', error);
      alert('사용자 상태 업데이트 중 오류가 발생했습니다.');
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
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">사용자 관리</h1>
          <Link href="/admin" className="btn-secondary">
            관리자 대시보드
          </Link>
        </div>

        {loading ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
            <p className="mt-3 text-gray-600">사용자 목록을 불러오는 중...</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      이름
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      연락처
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      역할
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      상태
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      사업자 등록증
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      가입일
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      작업
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((userItem) => (
                    <tr key={userItem.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {userItem.full_name || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {userItem.phone_number || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            userItem.role === 'admin'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {userItem.role === 'admin' ? '관리자' : '일반 사용자'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            userItem.status === 'approved'
                              ? 'bg-green-100 text-green-800'
                              : userItem.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {userItem.status === 'approved'
                            ? '승인됨'
                            : userItem.status === 'pending'
                            ? '대기 중'
                            : '거부됨'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {userItem.business_registration_doc ? (
                          <a
                            href={userItem.business_registration_doc}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            보기
                          </a>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {userItem.created_at
                            ? new Date(userItem.created_at).toLocaleDateString('ko-KR')
                            : '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {userItem.role !== 'admin' && (
                          <div className="flex space-x-2">
                            {userItem.status !== 'approved' && (
                              <button
                                onClick={() => updateUserStatus(userItem.id, 'approved')}
                                className="text-green-600 hover:text-green-900"
                              >
                                승인
                              </button>
                            )}
                            {userItem.status !== 'rejected' && (
                              <button
                                onClick={() => updateUserStatus(userItem.id, 'rejected')}
                                className="text-red-600 hover:text-red-900"
                              >
                                거부
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}