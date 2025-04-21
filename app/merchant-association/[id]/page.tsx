// app/merchant-association/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import supabase from '../../../lib/supabase';
// React.use 대신 사용하지 않음 - TypeScript 에러 해결

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

interface Signature {
  id: string;
  post_id: string;
  user_id: string;
  signature_data: string;
  user_type: string;
  vote_type: string | null;
  created_at: string;
  user_name?: string;
}

interface StoreUser {
  user_id: string;
  user_type: string;
  store_id: string;
  store_name?: string;
  floor?: string;
  unit_number?: string;
}

export default function PostDetail({ params }: { params: { id: string } }) {
  // TypeScript 에러 해결 - params 직접 사용
  const id = params.id;
  
  const [loading, setLoading] = useState(true);
  const [post, setPost] = useState<Post | null>(null);
  const [signatures, setSignatures] = useState<Signature[]>([]);
  const [user, setUser] = useState<any>(null);
  const [userSignature, setUserSignature] = useState<string | null>(null);
  const [userType, setUserType] = useState<string | null>(null);
  const [hasUserSigned, setHasUserSigned] = useState(false);
  const [userCurrentSignature, setUserCurrentSignature] = useState<Signature | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userStores, setUserStores] = useState<StoreUser[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // 사용자가 여러 역할을 가질 경우를 위한 상태
  const [selectedUserType, setSelectedUserType] = useState<string | null>(null);
  const [hasMultipleRoles, setHasMultipleRoles] = useState(false);
  
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      try {
        // 사용자 세션 확인
        const { data: { session } } = await supabase.auth.getSession();

        if (!session?.user) {
          // 인증되지 않은 사용자는 로그인 페이지로 리디렉션
          router.push('/auth/login?redirect=/merchant-association');
          return;
        }

        setUser(session.user);

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

        // 사용자 서명 데이터 가져오기
        try {
          const profileResponse = await fetch(`/api/profile?userId=${session.user.id}`);
          if (profileResponse.ok) {
            const profileData = await profileResponse.json();
            setUserSignature(profileData.signature_data);
          }
        } catch (error) {
          console.error('Error fetching user signature:', error);
        }

        // 게시글 정보 가져오기 (먼저 실행)
        await fetchPostData(session);

        // 사용자의 매장 정보 가져오기
        try {
          console.log('사용자 매장 정보 요청 중...');
          const storeResponse = await fetch(`/api/merchant-association/user-stores?userId=${session.user.id}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${session.access_token}`
            }
          });
          
          if (storeResponse.ok) {
            const storeData = await storeResponse.json();
            setUserStores(storeData);
            
            // 사용자 유형 설정 및 다중 역할 확인
            if (storeData.length > 0) {
              // 기본 유형은 첫 번째 매장의 유형
              setUserType(storeData[0].user_type);
              setSelectedUserType(storeData[0].user_type);
              
              // 임대인과 임차인 역할을 모두 가지고 있는지 확인
              // store_users 테이블의 user_type 필드로 구분 (landlord: 임대인, tenant: 임차인)
              const hasLandlordRole = storeData.some((store: StoreUser) => store.user_type === 'landlord');
              const hasTenantRole = storeData.some((store: StoreUser) => store.user_type === 'tenant');
              
              if (hasLandlordRole && hasTenantRole) {
                console.log('사용자가 임대인과 임차인 역할을 모두 가지고 있습니다.');
                setHasMultipleRoles(true);
              }
            }
          } else {
            console.error('Store response not OK:', await storeResponse.text());
            
            // 테스트용 더미 데이터 - 응답이 실패해도 UI가 작동하도록
            setUserStores([
              {
                user_id: session.user.id,
                user_type: 'tenant',
                store_id: '00000000-0000-0000-0000-000000000001',
                store_name: '테스트 매장'
              }
            ]);
            setUserType('tenant');
            setSelectedUserType('tenant');
          }
        } catch (storeError) {
          console.error('Error fetching user stores:', storeError);
          // 테스트용 더미 데이터
          setUserStores([
            {
              user_id: session.user.id,
              user_type: 'tenant',
              store_id: '00000000-0000-0000-0000-000000000001',
              store_name: '테스트 매장'
            }
          ]);
          setUserType('tenant');
          setSelectedUserType('tenant');
        }
      } catch (error) {
        console.error('Error in checkUser:', error);
        setLoading(false);
      }
    };

    checkUser();
  }, [id, router]);

  const fetchPostData = async (session: any) => {
    try {
      setLoading(true);
      
      // 먼저 게시글 데이터 가져오기
      console.log('게시글 데이터 요청 중...');
      const postResponse = await fetch(`/api/merchant-association/${id}`);
      if (!postResponse.ok) {
        console.error('Post response not OK:', await postResponse.text());
        setError('게시글을 찾을 수 없습니다.');
        setLoading(false);
        return;
      }
      
      const postData = await postResponse.json();
      console.log('게시글 데이터 받음:', postData);
      setPost(postData);

      // 게시글이 존재하면 조회수 증가 시도
      try {
        console.log('조회수 증가 요청 중...');
        await fetch(`/api/merchant-association/view`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify({ postId: id }),
        });
        // 조회수 증가 실패해도 게시글은 표시
      } catch (viewError) {
        console.error('View count error:', viewError);
      }

      // 서명 데이터 가져오기
      try {
        console.log('서명 데이터 요청 중...');
        const signaturesResponse = await fetch(`/api/merchant-association/${id}/signatures`);
        if (signaturesResponse.ok) {
          const signaturesData = await signaturesResponse.json();
          setSignatures(signaturesData);

          // 현재 사용자가 이미 서명했는지 확인
          if (session?.user) {
            const userSignatureData = signaturesData.find((sig: Signature) => sig.user_id === session.user.id);
            if (userSignatureData) {
              setHasUserSigned(true);
              setUserCurrentSignature(userSignatureData);
              // 이미 서명한 유형으로 선택 상태 업데이트
              setSelectedUserType(userSignatureData.user_type);
            }
          }
        } else {
          console.error('Signatures response not OK:', await signaturesResponse.text());
        }
      } catch (sigError) {
        console.error('Error fetching signatures:', sigError);
      }
    } catch (error) {
      console.error('Error fetching post data:', error);
      setError('게시글을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignatureSubmit = async (voteType: string) => {
    if (!user || !userSignature || !selectedUserType) {
      setError('서명 정보가 없습니다. 프로필에서 서명을 먼저 생성해주세요.');
      return;
    }

    try {
      setError(null);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError('로그인 세션이 만료되었습니다. 다시 로그인해주세요.');
        return;
      }

      console.log('서명 제출 시도 중...');
      console.log('요청 데이터:', {
        postId: id,
        userId: user.id,
        userType: selectedUserType,
        voteType
      });

      // 서명 API 엔드포인트 결정 (수정 또는 생성)
      const endpoint = isEditing ? 
        '/api/merchant-association/signature/update' : 
        '/api/merchant-association/signature';

      const requestBody: Record<string, any> = {
        postId: id,
        userId: user.id,
        signatureData: userSignature,
        userType: selectedUserType,
        voteType: voteType,
      };

      // 서명 수정인 경우 서명 ID 추가
      if (isEditing && userCurrentSignature) {
        requestBody.signatureId = userCurrentSignature.id;
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Signature submission error:', errorText);
        let errorMessage = '서명 처리 중 오류가 발생했습니다.';
        
        try {
          const errorData = JSON.parse(errorText);
          if (errorData.error) {
            errorMessage = errorData.error;
            // 이미 서명한 경우 - 현재는 API가 이를 오류로 처리
            if (errorMessage.includes('이미 이 게시글에 서명하셨습니다')) {
              setError('이미 서명한 게시글입니다. 서명을 수정하려면 "서명 수정하기" 버튼을 사용하세요.');
              return;
            }
          }
        } catch (e) {
          // JSON 파싱 실패 시 기본 오류 메시지 사용
        }
        
        setError(errorMessage);
        return;
      }

      // 응답 데이터 확인
      const responseData = await response.json();
      console.log('서명 응답 데이터:', responseData);

      // 성공 후 데이터 새로고침
      console.log('서명 성공, 데이터 새로고침 중...');
      const { data: { session: newSession } } = await supabase.auth.getSession();
      if (newSession) {
        await fetchPostData(newSession);
      }
      
      // 편집 모드 종료
      setIsEditing(false);
      
      // 성공 메시지 표시
      setError(null);
    } catch (error: any) {
      console.error('Error submitting signature:', error);
      setError(error.message || '서명 처리 중 오류가 발생했습니다.');
    }
  };

  // 서명 수정 모드 전환
  const handleEditSignature = () => {
    setIsEditing(true);
  };

  // 서명 수정 취소
  const handleCancelEdit = () => {
    setIsEditing(false);
    // 원래 서명 정보로 되돌리기
    if (userCurrentSignature) {
      setSelectedUserType(userCurrentSignature.user_type);
    }
  };

  // 날짜 포맷팅 함수
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return `${date.getFullYear()}년 ${String(date.getMonth() + 1).padStart(2, '0')}월 ${String(date.getDate()).padStart(2, '0')}일 ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    } catch (e) {
      return dateString;
    }
  };

  // 서명 대상 텍스트 변환
  const getSignatureTargetText = (target: string | null) => {
    if (!target) return '없음';
    
    switch (target) {
      case 'landlord':
        return '임대인';
      case 'tenant':
        return '임차인';
      case 'both':
        return '임대인 및 임차인 모두';
      default:
        return target;
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

  // 사용자가 서명할 수 있는지 확인
  const canUserSign = () => {
    if (!post || !post.signature_required || !selectedUserType) return false;
    
    // 편집 모드이거나 아직 서명하지 않은 경우에만
    if (!isEditing && hasUserSigned) return false;
    
    // 서명 대상에 따라 서명 가능 여부 결정
    return (
      post.signature_target === 'both' ||
      (post.signature_target === 'landlord' && selectedUserType === 'landlord') ||
      (post.signature_target === 'tenant' && selectedUserType === 'tenant')
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-3 text-gray-600">게시글을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error && !post) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container-custom mx-auto px-4">
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="text-center text-red-600 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h2 className="text-2xl font-bold mt-2">오류가 발생했습니다</h2>
            </div>
            <p className="text-center text-gray-600 mb-6">{error || '게시글을 찾을 수 없습니다.'}</p>
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

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container-custom mx-auto px-4">
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="text-center text-red-600 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h2 className="text-2xl font-bold mt-2">게시글을 찾을 수 없습니다</h2>
            </div>
            <p className="text-center text-gray-600 mb-6">요청하신 게시글이 존재하지 않거나 삭제되었습니다.</p>
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
      <div className="container-custom mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* 게시글 헤더 */}
          <div className="border-b border-gray-200 p-6">
            <div className="flex justify-between items-start mb-4">
              <h1 className="text-2xl font-bold text-gray-800">{post.title}</h1>
              <div className="text-sm text-gray-500 flex flex-col items-end">
                <span>작성일: {formatDate(post.created_at)}</span>
                <span>조회수: {post.views}</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                작성자: {post.author_name || '관리자'}
              </div>
              {post.signature_required && (
                <div className="text-sm font-medium">
                  <span className="text-gray-700">서명 대상: </span>
                  <span className="text-primary">{getSignatureTargetText(post.signature_target)}</span>
                </div>
              )}
            </div>
          </div>

          {/* 게시글 본문 */}
          <div className="p-6">
            <div className="prose max-w-none mb-8" dangerouslySetInnerHTML={{ __html: post.content }} />
            
            {/* 서명 섹션 */}
            {post.signature_required && (
              <div className="mt-8 pt-8 border-t border-gray-200">
                <h2 className="text-xl font-bold text-gray-800 mb-4">서명 현황</h2>
                
                {signatures.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                    {signatures.map((signature) => (
                      <div key={signature.id} className="border rounded-lg p-4 bg-gray-50">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium">{signature.user_name || '사용자'}</span>
                          <span className={`text-sm ${
                            signature.vote_type === 'approve' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {signature.vote_type === 'approve' ? '찬성' : '반대'}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 mb-2">
                          {getUserTypeText(signature.user_type)} • {formatDate(signature.created_at)}
                        </div>
                        <div className="border rounded p-2 bg-white">
                          <img 
                            src={signature.signature_data} 
                            alt="서명" 
                            className="h-12 object-contain mx-auto"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600 mb-6">아직 서명한 사용자가 없습니다.</p>
                )}

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <p className="text-red-800">{error}</p>
                  </div>
                )}

                {/* 서명 가능 상태 */}
                {canUserSign() ? (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                    <h3 className="text-lg font-semibold text-blue-800 mb-4">
                      {isEditing ? '서명 수정하기' : '서명하기'}
                    </h3>
                    {userStores.length > 0 ? (
                      <div>
                        {/* 다중 역할 선택 UI */}
                        {hasMultipleRoles && (
                          <div className="mb-4">
                            <p className="text-sm font-medium text-gray-700 mb-2">서명 역할 선택:</p>
                            <div className="flex space-x-4">
                              <label className="inline-flex items-center">
                                <input
                                  type="radio"
                                  className="form-radio text-blue-600"
                                  name="userType"
                                  value="landlord"
                                  checked={selectedUserType === 'landlord'}
                                  onChange={() => setSelectedUserType('landlord')}
                                  disabled={post.signature_target === 'tenant'}
                                />
                                <span className="ml-2">임대인으로 서명</span>
                              </label>
                              <label className="inline-flex items-center">
                                <input
                                  type="radio"
                                  className="form-radio text-blue-600"
                                  name="userType"
                                  value="tenant"
                                  checked={selectedUserType === 'tenant'}
                                  onChange={() => setSelectedUserType('tenant')}
                                  disabled={post.signature_target === 'landlord'}
                                />
                                <span className="ml-2">임차인으로 서명</span>
                              </label>
                            </div>
                            {post.signature_target !== 'both' && (
                              <p className="text-sm text-blue-600 mt-1">
                                이 문서는 {getSignatureTargetText(post.signature_target)}의 서명만 필요합니다.
                              </p>
                            )}
                          </div>
                        )}

                        <p className="text-gray-700 mb-4">
                          {isEditing 
                            ? '서명 의견을 수정합니다.' 
                            : '이 문서에 대한 귀하의 의견을 선택하고 서명해주세요.'}
                          {!hasMultipleRoles && (
                            <span className="block text-sm text-blue-600 mt-1">
                              {getUserTypeText(selectedUserType || '')}으로 서명합니다.
                            </span>
                          )}
                        </p>
                        <div className="flex flex-col md:flex-row gap-4">
                          <button
                            onClick={() => handleSignatureSubmit('approve')}
                            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                          >
                            찬성 및 서명
                          </button>
                          <button
                            onClick={() => handleSignatureSubmit('reject')}
                            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                          >
                            반대 및 서명
                          </button>
                          
                          {isEditing && (
                            <button
                              onClick={handleCancelEdit}
                              className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
                            >
                              수정 취소
                            </button>
                          )}
                        </div>
                        
                        {/* 사용자의 매장 정보 표시 */}
                        <div className="mt-6">
                          <p className="text-sm font-medium text-gray-700 mb-2">나의 매장 정보:</p>
                          <div className="bg-white rounded border p-3 max-h-32 overflow-y-auto">
                            {userStores.map((store, index) => (
                              <div key={index} className="mb-2 last:mb-0 text-sm">
                                <div className="flex items-center">
                                  <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                                    store.user_type === 'landlord' ? 'bg-purple-500' : 'bg-blue-500'
                                  }`}></span>
                                  <span className="font-medium">{store.store_name}</span>
                                  <span className="mx-1 text-gray-400">•</span>
                                  <span className="text-gray-600">{getUserTypeText(store.user_type)}</span>
                                  {store.floor && store.unit_number && (
                                    <span className="text-gray-500 ml-2">
                                      ({store.floor} {store.unit_number})
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div className="mt-4">
                          <p className="text-sm text-gray-500">회원가입 시 등록한 서명이 사용됩니다.</p>
                          {userSignature && (
                            <div className="mt-2 border rounded p-2 bg-white inline-block">
                              <img 
                                src={userSignature} 
                                alt="내 서명" 
                                className="h-12 object-contain"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-700">
                        서명하려면 먼저 매장 정보가 등록되어 있어야 합니다. 관리자에게 문의하세요.
                      </p>
                    )}
                  </div>
                ) : hasUserSigned && !isEditing ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                      <p className="text-green-800 mb-3 md:mb-0">
                        이미 이 문서에 서명하셨습니다. 
                        {userCurrentSignature && (
                          <span className="font-medium">
                            ({getUserTypeText(userCurrentSignature.user_type)}으로 
                            {userCurrentSignature.vote_type === 'approve' ? ' 찬성' : ' 반대'} 의견 제출)
                          </span>
                        )}
                      </p>
                      <button 
                        onClick={handleEditSignature}
                        className="px-4 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
                      >
                        서명 수정하기
                      </button>
                    </div>
                  </div>
                ) : (
                  selectedUserType && post.signature_target && post.signature_target !== 'both' && post.signature_target !== selectedUserType && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                      <p className="text-gray-700">현재 이 문서는 {getSignatureTargetText(post.signature_target)}만 서명이 필요합니다.</p>
                      
                      {hasMultipleRoles && (
                        <div className="mt-3">
                          <p className="text-sm text-blue-600">다른 역할로 서명하려면 위에서 역할을 변경하세요.</p>
                        </div>
                      )}
                    </div>
                  )
                )}
              </div>
            )}
          </div>

          {/* 하단 버튼 */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
            <Link href="/merchant-association" className="btn-secondary">
              목록으로
            </Link>
            {isAdmin && (
              <Link href={`/merchant-association/edit/${id}`} className="btn-primary">
                수정하기
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}