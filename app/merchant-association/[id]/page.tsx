// app/merchant-association/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import supabase from '../../../lib/supabase';

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
  expiry_date?: string; // 마감일 필드 추가
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
  store_info?: any;
  is_masked?: boolean;
}

interface StoreUser {
  user_id: string;
  user_type: string;
  store_id: string;
  store_name?: string;
  floor?: string;
  unit_number?: string;
}

interface VisibilityVote {
  totalVotes: number;
  publicVotes: number;
  privateVotes: number;
  totalSignatures: number; // 전체 서명자 수
  isPublic: boolean; // 현재 공개 여부 상태
}

export default function PostDetail() {
  // useParams 훅을 사용하여 올바르게 ID 가져오기
  const params = useParams();
  const id = typeof params.id === 'string' ? params.id : Array.isArray(params.id) ? params.id[0] : '';
  
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
  const [votingError, setVotingError] = useState<string | null>(null);
  
  // 사용자가 여러 역할을 가질 경우를 위한 상태
  const [selectedUserType, setSelectedUserType] = useState<string | null>(null);
  const [hasMultipleRoles, setHasMultipleRoles] = useState(false);
  
  // 서명 공개 여부 투표 관련 상태
  const [visibilityVotes, setVisibilityVotes] = useState<VisibilityVote | null>(null);
  const [hasUserVoted, setHasUserVoted] = useState(false);
  const [userVoteForPublic, setUserVoteForPublic] = useState<boolean | null>(null);
  const [showVoteSection, setShowVoteSection] = useState(false);
  const [votingInProgress, setVotingInProgress] = useState(false);
  
  // 선택된 매장 (서명이나 투표에 사용할)
  const [selectedStore, setSelectedStore] = useState<string>('');
  
  // 전체 사용자 수 상태
  const [totalUserCount, setTotalUserCount] = useState<number>(0);
  
  // 마감 관련 상태 추가
  const [isExpired, setIsExpired] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  
  // 찬성/반대 집계 결과
  const [voteResults, setVoteResults] = useState({
    approveCount: 0,
    rejectCount: 0,
    approvePercent: 0,
    rejectPercent: 0
  });
  
  // 서명 필터링 및 정렬 관련 상태 추가
  const [signatureFilter, setSignatureFilter] = useState('all'); // 'all', 'approve', 'reject'
  const [signatureSortBy, setSignatureSortBy] = useState('date'); // 'date', 'name', 'type'
  const [signatureSortOrder, setSignatureSortOrder] = useState('desc'); // 'asc', 'desc'
  const [searchTerm, setSearchTerm] = useState('');
  
  // 드롭다운 상태
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  
  const router = useRouter();

  useEffect(() => {
    if (!id) return; // id가 없으면 처리하지 않음
    
    // checkUser 함수 - 사용자 정보 및 권한 확인
const checkUser = async () => {
  try {
    if (!id) return; // id가 없으면 처리하지 않음
    
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

    // 전체 사용자 수 가져오기
    try {
      const countResponse = await fetch('/api/profile?countOnly=true');
      if (countResponse.ok) {
        const countData = await countResponse.json();
        console.log('전체 사용자 수:', countData.count);
        setTotalUserCount(countData.count);
      } else {
        console.error('전체 사용자 수 조회 오류:', await countResponse.text());
        setTotalUserCount(0);
      }
    } catch (countError) {
      console.error('전체 사용자 수 조회 중 예외 발생:', countError);
      setTotalUserCount(0);
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
        console.log('매장 정보 응답:', storeData);
        
        if (!storeData || storeData.length === 0) {
          console.error('매장 정보가 없습니다.');
          setError('매장 정보를 찾을 수 없습니다.');
          setLoading(false);
          return;
        }
        
        setUserStores(storeData);
        
        // 사용자 유형 직접 확인 - store_users 테이블에서 실제 유형 조회
        try {
          console.log('사용자 매장 정보를 API를 통해 가져오는 중...');
  const storeResponse = await fetch(`/api/merchant-association/user-stores?userId=${session.user.id}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${session.access_token}`
    }
  });
  
  if (!storeResponse.ok) {
    throw new Error(`API 응답 오류: ${await storeResponse.text()}`);
  }
  
  const userStoreData = await storeResponse.json();
            
          // if (storeUserError) {
          //   console.error('사용자 유형 조회 오류:', storeUserError);
          //   throw storeUserError;
          // }
          
          if (!userStoreData || userStoreData.length === 0) {
            console.error('사용자 매장 연결 정보가 없습니다.');
            throw new Error('매장 연결 정보 없음');
          }
          
          console.log('조회된 실제 사용자 유형:', userStoreData);
          
          // 임차인/임대인 유형 분류
          const tenantStores = userStoreData.filter((store : any) => store.user_type === 'tenant');
          const landlordStores = userStoreData.filter((store : any) => store.user_type === 'landlord');
          
          // 사용자가 가진 실제 역할 확인
          const hasTenantRole = tenantStores.length > 0;
          const hasLandlordRole = landlordStores.length > 0;
          
          // 초기 유형 및 매장 설정 (게시글 성격에 따라 맞는 유형 우선 선택)
          let initialUserType, initialStore;
          
          // 게시글이 tenant 대상이고 사용자가 tenant 역할이 있으면 tenant 선택
          if (post?.signature_target === 'tenant' && hasTenantRole) {
            initialUserType = 'tenant';
            initialStore = tenantStores[0].store_id;
          } 
          // 게시글이 landlord 대상이고 사용자가 landlord 역할이 있으면 landlord 선택 
          else if (post?.signature_target === 'landlord' && hasLandlordRole) {
            initialUserType = 'landlord';
            initialStore = landlordStores[0].store_id;
          }
          // 게시글이 both이거나 특정 대상이 아니면, 사용자가 가진 역할 중 하나 선택
          else {
            if (hasTenantRole) {
              initialUserType = 'tenant';
              initialStore = tenantStores[0].store_id;
            } else if (hasLandlordRole) {
              initialUserType = 'landlord';
              initialStore = landlordStores[0].store_id;
            } else {
              throw new Error('유효한 매장 역할이 없습니다');
            }
          }
          
          console.log(`선택된 초기 유형: ${initialUserType}, 매장: ${initialStore}`);
          
          setUserType(initialUserType);
          setSelectedUserType(initialUserType);
          setSelectedStore(initialStore);
          
          // 다중 역할 확인
          setHasMultipleRoles(hasLandlordRole && hasTenantRole);
          
        } catch (userTypeError) {
          console.error('사용자 유형 처리 오류:', userTypeError);
          // 기본값 설정 (이전 응답 데이터 기반)
          if (storeData.length > 0) {
            const firstStore = storeData[0];
            console.log('기본값 사용:', firstStore);
            setUserType(firstStore.user_type);
            setSelectedUserType(firstStore.user_type);
            setSelectedStore(firstStore.store_id);
            
            // 다중 역할 확인 - 기본 방식으로
            const hasLandlord = storeData.some((store: StoreUser) => store.user_type === 'landlord');
            const hasTenant = storeData.some((store: StoreUser) => store.user_type === 'tenant');
            setHasMultipleRoles(hasLandlord && hasTenant);
          } else {
            // 기본 테스트 데이터 설정
            console.log('매장 정보 없음, 기본 테스트 데이터 사용');
            setUserStores([
              {
                user_id: session.user.id,
                user_type: 'tenant',
                store_id: '00000000-0000-0000-0000-000000000001',
                store_name: '임차인 매장'
              }
            ]);
            setUserType('tenant');
            setSelectedUserType('tenant');
            setSelectedStore('00000000-0000-0000-0000-000000000001');
          }
        }
      } else {
        console.error('Store response not OK:', await storeResponse.text());
        
        // API 실패 시 fallback - 직접 DB에 쿼리 시도
        try {
          const { data: storeUsers, error: suError } = await supabase
            .from('store_users')
            .select('store_id, user_type')
            .eq('user_id', session.user.id);
            
          if (!suError && storeUsers && storeUsers.length > 0) {
            // 임차인 역할 우선 찾기
            const tenantUser = storeUsers.find(su => su.user_type === 'tenant');
            const defaultType = tenantUser ? 'tenant' : 'landlord';
            const defaultStore = tenantUser || storeUsers[0];
            
            console.log('직접 쿼리로 사용자 유형 확인:', defaultType);
            
            // 기본 매장 정보 설정
            setUserStores(storeUsers.map(su => ({
              user_id: session.user.id,
              user_type: su.user_type,
              store_id: su.store_id,
              store_name: `${su.user_type === 'landlord' ? '임대인' : '임차인'} 매장`
            })));
            
            setUserType(defaultType);
            setSelectedUserType(defaultType);
            setSelectedStore(defaultStore.store_id);
            
            // 다중 역할 확인
            const hasLandlord = storeUsers.some(su => su.user_type === 'landlord');
            const hasTenant = storeUsers.some(su => su.user_type === 'tenant');
            setHasMultipleRoles(hasLandlord && hasTenant);
            
            return;
          }
        } catch (dbError) {
          console.error('Direct DB query error:', dbError);
        }
        
        // 모든 조회 실패 시 기본 테스트 데이터
        console.log('모든 시도 실패, 기본 테스트 데이터 사용 (임차인으로 설정)');
        setUserStores([
          {
            user_id: session.user.id,
            user_type: 'tenant',
            store_id: '00000000-0000-0000-0000-000000000001',
            store_name: '임차인 매장'
          }
        ]);
        setUserType('tenant');
        setSelectedUserType('tenant');
        setSelectedStore('00000000-0000-0000-0000-000000000001');
      }
    } catch (storeError) {
      console.error('Error fetching user stores:', storeError);
      
      // 예외 발생 시 기본 테스트 데이터
      console.log('예외 발생, 기본 테스트 데이터 사용 (임차인으로 설정)');
      setUserStores([
        {
          user_id: session.user.id,
          user_type: 'tenant',
          store_id: '00000000-0000-0000-0000-000000000001',
          store_name: '임차인 매장'
        }
      ]);
      setUserType('tenant');
      setSelectedUserType('tenant');
      setSelectedStore('00000000-0000-0000-0000-000000000001');
    }
  } catch (error) {
    console.error('Error in checkUser:', error);
    setLoading(false);
  }
};

    checkUser();
  }, [id, router]);

  // 드롭다운 외부 클릭 감지
  useEffect(() => {

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      
      // 필터 드롭다운 영역 외부 클릭 감지
      if (filterDropdownOpen && !target.closest('#filter-dropdown') && !target.closest('#filter-button')) {
        setFilterDropdownOpen(false);
      }
      
      // 정렬 드롭다운 영역 외부 클릭 감지
      if (sortDropdownOpen && !target.closest('#sort-dropdown') && !target.closest('#sort-button')) {
        setSortDropdownOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [filterDropdownOpen, sortDropdownOpen]);

  // selectedStore가 변경되면 사용자의 투표 상태 다시 확인
  useEffect(() => {
    if (user && user.id && selectedStore && id) {
      checkUserVisibilityVote(user.id, id);
    }
  }, [selectedStore, user, id]);
  
  // 마감 여부 및 남은 시간 계산하는 효과
  useEffect(() => {
    if (!post || !post.expiry_date) return;
    
    const calculateTimeRemaining = () => {
      const now = new Date();
      const expiryDate = new Date(post.expiry_date!);
      
      // 마감 여부 확인
      const isPostExpired = now > expiryDate;
      setIsExpired(isPostExpired);
      
      if (isPostExpired) {
        setTimeRemaining('마감됨');
        return;
      }
      
      // 남은 시간 계산
      const diffTime = Math.abs(expiryDate.getTime() - now.getTime());
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const diffMinutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));
      
      if (diffDays > 0) {
        setTimeRemaining(`${diffDays}일 ${diffHours}시간 남음`);
      } else if (diffHours > 0) {
        setTimeRemaining(`${diffHours}시간 ${diffMinutes}분 남음`);
      } else {
        setTimeRemaining(`${diffMinutes}분 남음`);
      }
    };
    
    // 초기 계산
    calculateTimeRemaining();
    
    // 1분마다 남은 시간 업데이트
    const timer = setInterval(() => {
      calculateTimeRemaining();
    }, 60000); // 1분 = 60000ms
    
    return () => clearInterval(timer);
  }, [post]);
  
  // 찬성/반대 결과 계산
  useEffect(() => {
    if (!signatures.length) return;
    
    const approveSignatures = signatures.filter(sig => sig.vote_type === 'approve');
    const rejectSignatures = signatures.filter(sig => sig.vote_type === 'reject');
    
    const approveCount = approveSignatures.length;
    const rejectCount = rejectSignatures.length;
    const total = signatures.length;
    
    setVoteResults({
      approveCount,
      rejectCount,
      approvePercent: Math.round((approveCount / total) * 100),
      rejectPercent: Math.round((rejectCount / total) * 100)
    });
  }, [signatures]);

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
      
      // 마감일 체크
      const now = new Date();
      const expiryDate = new Date(postData.expiry_date || '');
      setIsExpired(now > expiryDate);

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
          const responseData = await signaturesResponse.json();
          console.log('원본 서명 응답 데이터:', responseData);
          
          // 서명 데이터와 투표 요약 정보 확인
          const signaturesData = responseData.signatures || responseData;
          const votingSummary = responseData.votingSummary || null;
          
          console.log('처리된 서명 데이터:', signaturesData);
          console.log('투표 요약 정보:', votingSummary);
          
          // 매장 정보 확인 로깅
          signaturesData.forEach((sig: Signature, index: number) => {
            console.log(`서명 ${index + 1} 매장 정보:`, sig.store_info);
          });
          
          // 매장 정보 추가 처리 - 매장 정보가 없으면 기본값 설정
          const processedSignatures = signaturesData.map((sig: Signature) => {
            // store_info가 없거나 비어있으면 기본 값 설정
            if (!sig.store_info || Object.keys(sig.store_info).length === 0) {
              console.log(`서명 ID ${sig.id}에 매장 정보 없음, 기본값 설정`);
              // 기본 매장 정보 설정
              return {
                ...sig,
                store_info: {
                  store_name: `${sig.user_type === 'landlord' ? '임대인' : '임차인'} 매장`,
                  floor: '',
                  unit_number: ''
                }
              };
            } 
            // 문자열로 전달된 경우 파싱 시도
            else if (typeof sig.store_info === 'string') {
              try {
                console.log(`서명 ID ${sig.id}의 매장 정보가 문자열임, 파싱 시도:`, sig.store_info);
                sig.store_info = JSON.parse(sig.store_info);
              } catch (e) {
                console.error(`서명 ID ${sig.id}의 매장 정보 파싱 실패:`, e);
                sig.store_info = {
                  store_name: `${sig.user_type === 'landlord' ? '임대인' : '임차인'} 매장`,
                  floor: '',
                  unit_number: ''
                };
              }
            }
            
            // 최종 매장 정보 확인
            console.log(`서명 ID ${sig.id}의 최종 매장 정보:`, sig.store_info);
            return sig;
          });
          
          setSignatures(processedSignatures);
          console.log('처리된 서명 데이터:', processedSignatures);

          // 현재 사용자가 이미 서명했는지 확인
          if (session?.user) {
            const userSignatureData = processedSignatures.find((sig: Signature) => sig.user_id === session.user.id);
            if (userSignatureData) {
              setHasUserSigned(true);
              setUserCurrentSignature(userSignatureData);
              // 이미 서명한 유형으로 선택 상태 업데이트
              setSelectedUserType(userSignatureData.user_type);
              
              // 서명한 경우 투표 섹션 표시
              setShowVoteSection(true);
            }
          }
          
          // 투표 요약 정보 설정
          if (votingSummary) {
            setVisibilityVotes(votingSummary);
          } else {
            // 투표 요약 정보가 없으면 기본값 설정
            const totalSignatures = processedSignatures.length;
            const publicVotes = processedSignatures.filter((sig : any) => sig.visibility_vote === true).length;
            const privateVotes = processedSignatures.filter((sig : any) => sig.visibility_vote === false).length;
            const totalVotes = publicVotes + privateVotes;
            const isPublic = publicVotes > privateVotes;
            
            setVisibilityVotes({
              totalSignatures,
              publicVotes,
              privateVotes,
              totalVotes,
              isPublic
            });
          }
        } else {
          console.error('Signatures response not OK:', await signaturesResponse.text());
        }
      } catch (sigError) {
        console.error('Error fetching signatures:', sigError);
      }
      
      // 사용자가 현재 게시글에 대해 서명 공개 여부 투표를 했는지 확인
      if (session?.user && selectedStore) {
        checkUserVisibilityVote(session.user.id, id);
      }
    } catch (error) {
      console.error('Error fetching post data:', error);
      setError('게시글을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };
  
  // 사용자의 서명 공개 여부 투표 상태 확인
  const checkUserVisibilityVote = async (userId: string, postId: string) => {
    try {
      if (!selectedStore) return;
      
      const response = await fetch(`/api/merchant-association/signature-visibility/check?userId=${userId}&postId=${postId}&storeId=${selectedStore}`);
      
      if (response.ok) {
        const data = await response.json();
        setHasUserVoted(data.hasVoted);
        setUserVoteForPublic(data.voteForPublic);
      } else {
        console.error('Error checking user vote:', await response.text());
      }
    } catch (error) {
      console.error('Error checking user vote:', error);
    }
  };

  const handleSignatureSubmit = async (voteType: string) => {
    if (!user || !userSignature || !selectedUserType || !selectedStore) {
      setError('서명 정보가 없거나 매장이 선택되지 않았습니다.');
      return;
    }
    
    // 마감된 경우 서명 불가
    if (isExpired) {
      setError('마감된 게시글에는 서명할 수 없습니다.');
      return;
    }
  
    // 서명 대상 확인
    if (post?.signature_target !== 'both' && 
        post?.signature_target !== selectedUserType) {
          setError(`이 게시글은 ${getSignatureTargetText(post?.signature_target ?? null)}만 서명할 수 있습니다.`);
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
      console.log('사용자 유형:', selectedUserType);
      console.log('게시글 대상:', post?.signature_target);
      
      // 현재 선택된 매장 정보 찾기
      const selectedStoreInfo = userStores.find(store => store.store_id === selectedStore);
      
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
        storeId: selectedStore,
        // 매장 정보 추가
        storeInfo: selectedStoreInfo ? {
          store_name: selectedStoreInfo.store_name || `${selectedUserType === 'landlord' ? '임대인' : '임차인'} 매장`,
          floor: selectedStoreInfo.floor || '',
          unit_number: selectedStoreInfo.unit_number || ''
        } : {
          store_name: `${selectedUserType === 'landlord' ? '임대인' : '임차인'} 매장`,
          floor: '',
          unit_number: ''
        }
      };
  
      console.log('서명 요청 데이터:', requestBody);
  
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
      
      // 서명 후 투표 섹션 표시
      setShowVoteSection(true);
      
      // 성공 메시지 표시
      setError(null);
    } catch (error: any) {
      console.error('Error submitting signature:', error);
      setError(error.message || '서명 처리 중 오류가 발생했습니다.');
    }
  };
  
  // 서명 공개 여부 투표 처리
  const handleVisibilityVote = async (voteForPublic: boolean) => {
    if (!user || !selectedStore) {
      setVotingError('사용자 정보가 없거나 매장이 선택되지 않았습니다.');
      return;
    }
    
    // 마감된 경우 투표 불가
    if (isExpired) {
      setVotingError('마감된 게시글에는 투표할 수 없습니다.');
      return;
    }

    try {
      setVotingError(null);
      setVotingInProgress(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setVotingError('로그인 세션이 만료되었습니다. 다시 로그인해주세요.');
        setVotingInProgress(false);
        return;
      }

      // 이미 투표한 경우에는 투표를 수정할 수 없음
      if (hasUserVoted) {
        setVotingError('이미 투표하셨습니다. 투표는 수정할 수 없습니다.');
        setVotingInProgress(false);
        return;
      }

      console.log('서명 공개 여부 투표 시도 중...');
      const response = await fetch('/api/merchant-association/signature-visibility', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          postId: id,
          userId: user.id,
          storeId: selectedStore,
          voteForPublic
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        console.error('Visibility vote error:', responseData);
        
        // 이미 투표한 경우 처리
        if (responseData.alreadyVoted) {
          setHasUserVoted(true);
          checkUserVisibilityVote(user.id, id);
          setVotingError('이미 투표하셨습니다. 투표는 수정할 수 없습니다.');
          setVotingInProgress(false);
          return;
        }
        
        setVotingError(responseData.error || '투표 처리 중 오류가 발생했습니다.');
        setVotingInProgress(false);
        return;
      }

      // 투표 성공 후 상태 업데이트
      setHasUserVoted(true);
      setUserVoteForPublic(voteForPublic);
      
      // 투표 현황 새로고침
      const votesResponse = await fetch(`/api/merchant-association/${id}/visibility-votes`);
      if (votesResponse.ok) {
        const votesData = await votesResponse.json();
        setVisibilityVotes(votesData);
      }
      
      // 게시글 정보 새로고침 (서명 공개 여부 업데이트를 위해)
      const { data: { session: newSession } } = await supabase.auth.getSession();
      if (newSession) {
        await fetchPostData(newSession);
      }

      setVotingInProgress(false);
    } catch (error: any) {
      console.error('Error submitting visibility vote:', error);
      setVotingError(error.message || '투표 처리 중 오류가 발생했습니다.');
      setVotingInProgress(false);
    }
  };

  // 서명 수정 모드 전환
  const handleEditSignature = () => {
    // 마감된 경우 서명 수정 불가
    if (isExpired) {
      setError('마감된 게시글의 서명은 수정할 수 없습니다.');
      return;
    }
    
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
  
  // 매장 선택 변경
  const handleStoreChange = (storeId: string, storeType: string) => {
    setSelectedStore(storeId);
    setSelectedUserType(storeType);
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
  
  // 마감된 경우 서명 불가
  if (isExpired) return false;
  
  // 편집 모드이거나 아직 서명하지 않은 경우에만
  if (!isEditing && hasUserSigned) return false;
  
  // 서명 대상에 따라 서명 가능 여부 결정
  // 조건문 로직 확인하며 로그 남기기
  console.log(`서명 조건 확인 - 게시글 대상: ${post.signature_target}, 사용자 유형: ${selectedUserType}`);
  
  const isAllowed = (
    post.signature_target === 'both' ||
    (post.signature_target === 'landlord' && selectedUserType === 'landlord') ||
    (post.signature_target === 'tenant' && selectedUserType === 'tenant')
  );
  
  console.log(`서명 가능 여부: ${isAllowed}`);
  return isAllowed;
};
  
  // 서명이 공개되는지 확인 - 수정된 부분
  const isSignaturePublic = (signature: Signature) => {
    // 관리자는 모든 서명 볼 수 있음
    if (isAdmin) return true;
    
    // 본인 서명은 항상 볼 수 있음
    if (user && signature.user_id === user.id) return true;
    
    // 백엔드에서 이미 마스킹 처리했는지 확인
    if (signature.is_masked === true) return false;
    if (signature.is_masked === false) return true;
    
    // 마감된 경우나 진행 중인 경우 모두 동일한 로직 적용
    // 공개 투표가 비공개 투표보다 많아야만 공개, 같거나 적으면 비공개
    if (visibilityVotes) {
      return visibilityVotes.publicVotes > visibilityVotes.privateVotes;
    }
    
    // 기본적으로는 비공개
    return false;
  };

  // 서명 진행률 계산 (0-100) - 전체 사용자 수 기준
  const calculateSignatureProgressPercent = () => {
    if (!signatures.length || !totalUserCount) return 0;
    return Math.min(100, Math.round((signatures.length / totalUserCount) * 100));
  };

  // 투표 진행률 계산 (0-100)
  const calculateVotingProgressPercent = () => {
    if (!visibilityVotes || !visibilityVotes.totalSignatures) return 0;
    return Math.min(100, Math.round((visibilityVotes.totalVotes / visibilityVotes.totalSignatures) * 100));
  };

  // 서명 진행 상태 텍스트 - 전체 사용자 수 기준
  const getSignatureProgressText = () => {
    return `총 ${totalUserCount}명 중 ${signatures.length}명이 서명에 참여했습니다 (${calculateSignatureProgressPercent()}%)`;
  };

  // 메인 투표 진행 상태 텍스트
  const getVotingProgressText = () => {
    if (!visibilityVotes) return '투표 정보를 불러오는 중...';
    
    return `전체 서명자 ${visibilityVotes.totalSignatures}명 중 ${visibilityVotes.totalVotes}명 투표 (${calculateVotingProgressPercent()}% 참여)`;
  };

  // 투표 마감일 계산 (서명 마감일과 동일)
  const getVotingDeadline = () => {
    if (!post || !post.expiry_date) return '';
    return formatDate(post.expiry_date);
  };
  
  // 필터링된 서명 목록 가져오기
  const getFilteredSignatures = () => {
    if (!signatures.length) return [];
    
    let filteredList = [...signatures];
    
    // 투표 유형으로 필터링
    if (signatureFilter !== 'all') {
      filteredList = filteredList.filter(sig => sig.vote_type === signatureFilter);
    }
    
    // 검색어로 필터링
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filteredList = filteredList.filter(sig => {
        // 사용자 이름 검색
        const nameMatch = sig.user_name?.toLowerCase().includes(searchLower);
        
        // 매장 이름 검색
        let storeNameMatch = false;
        if (sig.store_info) {
          if (typeof sig.store_info === 'string') {
            try {
              const parsedInfo = JSON.parse(sig.store_info);
              storeNameMatch = parsedInfo.store_name?.toLowerCase().includes(searchLower);
            } catch (e) {
              // 파싱 실패 시 무시
            }
          } else {
            storeNameMatch = sig.store_info.store_name?.toLowerCase().includes(searchLower);
          }
        }
        
        return nameMatch || storeNameMatch;
      });
    }
    
    // 정렬
    if (signatureSortBy === 'date') {
      filteredList.sort((a, b) => {
        const dateA = new Date(a.created_at).getTime();
        const dateB = new Date(b.created_at).getTime();
        return signatureSortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      });
    } else if (signatureSortBy === 'name') {
      filteredList.sort((a, b) => {
        const nameA = a.user_name || '';
        const nameB = b.user_name || '';
        return signatureSortOrder === 'asc' 
          ? nameA.localeCompare(nameB) 
          : nameB.localeCompare(nameA);
      });
    } else if (signatureSortBy === 'type') {
      filteredList.sort((a, b) => {
        const typeComparison = a.user_type.localeCompare(b.user_type);
        return signatureSortOrder === 'asc' ? typeComparison : -typeComparison;
      });
    }
    
    return filteredList;
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
          <div className={`border-b border-gray-200 p-6 ${isExpired ? 'bg-gray-50' : ''}`}>
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-gray-800">{post.title}</h1>
                {isExpired && (
                  <span className="ml-3 px-3 py-1 bg-red-100 text-red-800 text-sm font-medium rounded-full">마감됨</span>
                )}
              </div>
              <div className="text-sm text-gray-500 flex flex-col items-end">
                <span>작성일: {formatDate(post.created_at)}</span>
                <span>조회수: {post.views}</span>
              </div>
            </div>
            <div className="flex flex-wrap justify-between items-center">
              <div className="text-sm text-gray-600 mb-2 md:mb-0">
                작성자: {post.author_name || '관리자'}
              </div>
              {post.signature_required && (
                <div className="text-sm font-medium">
                  <span className="text-gray-700">서명 대상: </span>
                  <span className="text-primary">{getSignatureTargetText(post.signature_target)}</span>
                </div>
              )}
            </div>
            
            {/* 마감일 표시 */}
            {post.expiry_date && (
              <div className="mt-2 flex items-center">
                <span className="text-sm text-gray-600 mr-2">마감일: {formatDate(post.expiry_date)}</span>
                {isExpired ? (
                  <span className="text-xs px-2 py-1 bg-red-100 text-red-800 rounded-full">마감됨</span>
                ) : (
                  <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">{timeRemaining}</span>
                )}
              </div>
            )}
          </div>

          {/* 게시글 본문 */}
          <div className="p-6">
            <div className="prose max-w-none mb-8" dangerouslySetInnerHTML={{ __html: post.content }} />
            
            {/* 서명 섹션 */}
            {post.signature_required && (
              <div className="mt-8 pt-8 border-t border-gray-200">
                {/* 마감된 게시글 서명 섹션 헤더 - 토스 스타일 */}
                {isExpired ? (
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      <h2 className="text-xl font-bold text-gray-800">서명 결과</h2>
                      <span className="ml-3 px-3 py-1 bg-red-100 text-red-800 text-sm font-medium rounded-full">
                        마감됨 ({formatDate(post.expiry_date || '')})
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-800">서명 현황</h2>
                    <span className="text-sm px-3 py-1 bg-blue-100 text-blue-800 rounded-full">
                      {timeRemaining}
                    </span>
                  </div>
                )}
                
                {/* 찬성/반대 결과 요약 표시 - 토스 스타일 */}
                {signatures.length > 0 && (
                  <div className="mb-6 bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-base font-medium text-gray-800">
                        {isExpired ? '최종 서명 결과' : '서명 현황 요약'}
                      </h3>
                      <div className="text-sm text-gray-500">
                        총 서명자: <span className="font-semibold">{signatures.length}명</span>
                        <span className="text-xs ml-1">
                          (전체 {totalUserCount}명 중 {calculateSignatureProgressPercent()}%)
                        </span>
                      </div>
                    </div>
                    
                    {/* 찬성/반대 비율 (토스 스타일) */}
                    <div className="relative h-10 bg-gray-100 rounded-lg overflow-hidden mb-3">
                      {voteResults.approveCount > 0 && (
                        <div 
                          className="absolute left-0 top-0 h-full bg-blue-500 flex items-center justify-start pl-3"
                          style={{ width: `${voteResults.approvePercent}%` }}
                        >
                          {voteResults.approvePercent > 10 && (
                            <span className="text-white text-sm font-medium">찬성 {voteResults.approveCount}명</span>
                          )}
                        </div>
                      )}
                      {voteResults.rejectCount > 0 && (
                        <div 
                          className="absolute right-0 top-0 h-full bg-red-500 flex items-center justify-end pr-3"
                          style={{ width: `${voteResults.rejectPercent}%`, left: `${100 - voteResults.rejectPercent}%` }}
                        >
                          {voteResults.rejectPercent > 10 && (
                            <span className="text-white text-sm font-medium">반대 {voteResults.rejectCount}명</span>
                          )}
                        </div>
                      )}
                      
                      {/* 백분율 표시 - 비율이 낮아 내부에 표시할 수 없는 경우 */}
                      {voteResults.approvePercent <= 10 && voteResults.approveCount > 0 && (
                        <div className="absolute left-0 top-full mt-1 text-xs text-blue-600 font-medium">
                          찬성 {voteResults.approveCount}명 ({voteResults.approvePercent}%)
                        </div>
                      )}
                      
                      {voteResults.rejectPercent <= 10 && voteResults.rejectCount > 0 && (
                        <div className="absolute right-0 top-full mt-1 text-xs text-red-600 font-medium">
                          반대 {voteResults.rejectCount}명 ({voteResults.rejectPercent}%)
                        </div>
                      )}
                    </div>
                    
                    <div className="text-sm text-gray-600 mt-6">
                      <span className="font-medium">서명 대상:</span> {getSignatureTargetText(post.signature_target)}
                    </div>
                  </div>
                )}
                
                {/* 서명 참여 진행 상태 표시 */}
                <div className={`mb-6 ${isExpired ? 'bg-gray-50' : 'bg-blue-50'} p-4 rounded-lg border ${isExpired ? 'border-gray-200' : 'border-blue-200'}`}>
                  <h3 className={`text-sm font-medium ${isExpired ? 'text-gray-700' : 'text-blue-700'} mb-2`}>
                    {isExpired ? '서명 최종 참여율' : '서명 진행 상황'}
                  </h3>
                  <div className="flex items-center space-x-4 mb-2">
                    <div className={`text-sm ${isExpired ? 'text-gray-700' : 'text-blue-700'} font-medium`}>
                      {getSignatureProgressText()}
                    </div>
                  </div>
                  
                  {/* 서명 목표 달성률 표시 */}
                  <div className="w-full bg-white rounded-full h-2.5 mb-1">
                    <div 
                      className={`${isExpired ? 'bg-gray-500' : 'bg-blue-500'} h-2.5 rounded-full`} 
                      style={{ width: `${calculateSignatureProgressPercent()}%` }}
                    ></div>
                  </div>
                  
                  <div className="text-xs text-gray-500">
                    서명이 필요한 대상: {getSignatureTargetText(post.signature_target)}
                  </div>
                </div>
                
                {/* 서명 목록 - 리디자인된 부분 (토스 스타일) */}
                {signatures.length > 0 ? (
                  <div className="mb-6">
                    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                      {/* 필터링 및 검색 컨트롤 */}
                      <div className="bg-gray-50 p-4 border-b border-gray-200">
                        <div className="flex flex-col md:flex-row gap-4">
                          <div className="flex-1">
                            <div className="relative">
                              <input
                                type="text"
                                placeholder="매장명 또는 서명자 검색"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                              />
                              <svg 
                                xmlns="http://www.w3.org/2000/svg" 
                                className="h-5 w-5 absolute right-3 top-2.5 text-gray-400" 
                                fill="none" 
                                viewBox="0 0 24 24" 
                                stroke="currentColor"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                              </svg>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {/* 토스 스타일 드롭다운 - 필터 */}
                            <div className="relative">
                              <button
                                id="filter-button"
                                className="flex items-center justify-between min-w-[130px] px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                onClick={() => setFilterDropdownOpen(!filterDropdownOpen)}
                              >
                                <span>
                                  {signatureFilter === 'all' && '모든 서명'}
                                  {signatureFilter === 'approve' && '찬성만'}
                                  {signatureFilter === 'reject' && '반대만'}
                                </span>
                                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={filterDropdownOpen ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
                                </svg>
                              </button>
                              
                              {filterDropdownOpen && (
                                <div id="filter-dropdown" className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                                  <ul className="py-1 text-sm">
                                    <li>
                                      <button
                                        className={`w-full text-left px-4 py-2 hover:bg-gray-100 ${signatureFilter === 'all' ? 'bg-blue-50 text-blue-700' : ''}`}
                                        onClick={() => {
                                          setSignatureFilter('all');
                                          setFilterDropdownOpen(false);
                                        }}
                                      >
                                        모든 서명
                                      </button>
                                    </li>
                                    <li>
                                      <button
                                        className={`w-full text-left px-4 py-2 hover:bg-gray-100 ${signatureFilter === 'approve' ? 'bg-blue-50 text-blue-700' : ''}`}
                                        onClick={() => {
                                          setSignatureFilter('approve');
                                          setFilterDropdownOpen(false);
                                        }}
                                      >
                                        찬성만
                                      </button>
                                    </li>
                                    <li>
                                      <button
                                        className={`w-full text-left px-4 py-2 hover:bg-gray-100 ${signatureFilter === 'reject' ? 'bg-blue-50 text-blue-700' : ''}`}
                                        onClick={() => {
                                          setSignatureFilter('reject');
                                          setFilterDropdownOpen(false);
                                        }}
                                      >
                                        반대만
                                      </button>
                                    </li>
                                  </ul>
                                </div>
                              )}
                            </div>
                            
                            {/* 토스 스타일 드롭다운 - 정렬 */}
                            <div className="relative">
                              <button
                                id="sort-button"
                                className="flex items-center justify-between min-w-[110px] px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
                              >
                                <span>
                                  {signatureSortBy === 'date' && '날짜순'}
                                  {signatureSortBy === 'name' && '이름순'}
                                  {signatureSortBy === 'type' && '유형순'}
                                </span>
                                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={sortDropdownOpen ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
                                </svg>
                              </button>
                              
                              {sortDropdownOpen && (
                                <div id="sort-dropdown" className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                                  <ul className="py-1 text-sm">
                                    <li>
                                      <button
                                        className={`w-full text-left px-4 py-2 hover:bg-gray-100 ${signatureSortBy === 'date' ? 'bg-blue-50 text-blue-700' : ''}`}
                                        onClick={() => {
                                          setSignatureSortBy('date');
                                          setSortDropdownOpen(false);
                                        }}
                                      >
                                        날짜순
                                      </button>
                                    </li>
                                    <li>
                                      <button
                                        className={`w-full text-left px-4 py-2 hover:bg-gray-100 ${signatureSortBy === 'name' ? 'bg-blue-50 text-blue-700' : ''}`}
                                        onClick={() => {
                                          setSignatureSortBy('name');
                                          setSortDropdownOpen(false);
                                        }}
                                      >
                                        이름순
                                      </button>
                                    </li>
                                    <li>
                                      <button
                                        className={`w-full text-left px-4 py-2 hover:bg-gray-100 ${signatureSortBy === 'type' ? 'bg-blue-50 text-blue-700' : ''}`}
                                        onClick={() => {
                                          setSignatureSortBy('type');
                                          setSortDropdownOpen(false);
                                        }}
                                      >
                                        유형순
                                      </button>
                                    </li>
                                  </ul>
                                </div>
                              )}
                            </div>
                            
                            <button
                              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 bg-white"
                              onClick={() => setSignatureSortOrder(signatureSortOrder === 'asc' ? 'desc' : 'asc')}
                              title={signatureSortOrder === 'asc' ? '오름차순' : '내림차순'}
                            >
                              {signatureSortOrder === 'asc' ? (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                                </svg>
                              ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
                                </svg>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      {/* 서명 테이블 */}
<div className="overflow-x-auto">
  <table className="min-w-full divide-y divide-gray-200">
    <thead className="bg-gray-50">
      <tr>
        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          서명자
        </th>
        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          매장명
        </th>
        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          유형
        </th>
        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          의견
        </th>
        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          서명일
        </th>
        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          서명
        </th>
      </tr>
    </thead>
    <tbody className="bg-white divide-y divide-gray-200">
      {getFilteredSignatures().map((signature) => {
        const isPublic = isSignaturePublic(signature);
        
        // store_info 처리 개선
        let storeInfo = signature.store_info;
        if (typeof storeInfo === 'string') {
          try {
            storeInfo = JSON.parse(storeInfo);
          } catch (e) {
            console.error(`서명 ID ${signature.id}의 매장 정보 파싱 실패:`, e);
            storeInfo = {
              store_name: `${signature.user_type === 'landlord' ? '임대인' : '임차인'} 매장`,
              floor: '',
              unit_number: ''
            };
          }
        } else if (!storeInfo || Object.keys(storeInfo).length === 0) {
          storeInfo = {
            store_name: `${signature.user_type === 'landlord' ? '임대인' : '임차인'} 매장`,
            floor: '',
            unit_number: ''
          };
        }
        
        const isCurrentUser = user && signature.user_id === user.id;
        
        return (
          <tr 
            key={signature.id}
            className={`hover:bg-gray-50 ${isCurrentUser ? 'bg-blue-50' : ''}`}
          >
            <td className="px-4 py-3 whitespace-nowrap">
              <div className="flex items-center">
                {isCurrentUser && (
                  <span className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                )}
                <div className="text-sm font-medium text-gray-900">
                  {signature.user_name || '사용자'}
                </div>
              </div>
            </td>
            <td className="px-4 py-3 whitespace-nowrap">
              <div className="text-sm text-gray-900">
                {storeInfo.store_name || `${getUserTypeText(signature.user_type)} 매장`}
              </div>
              {isPublic && storeInfo.floor && storeInfo.unit_number && (
                <div className="text-xs text-gray-500">
                  {storeInfo.floor} {storeInfo.unit_number}
                </div>
              )}
            </td>
            <td className="px-4 py-3 whitespace-nowrap">
              <span className="text-sm text-gray-900">
                {getUserTypeText(signature.user_type)}
              </span>
            </td>
            <td className="px-4 py-3 whitespace-nowrap">
              {isPublic ? (
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  signature.vote_type === 'approve' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {signature.vote_type === 'approve' ? '찬성' : '반대'}
                </span>
              ) : (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  비공개
                </span>
              )}
            </td>
            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
              {formatDate(signature.created_at)}
            </td>
            <td className="px-4 py-3 whitespace-nowrap">
              {isPublic ? (
                <div className="w-20 h-10 flex items-center justify-center border rounded bg-white">
                  <img 
                    src={signature.signature_data} 
                    alt="서명" 
                    className="h-8 object-contain max-w-full"
                  />
                </div>
              ) : (
                <div className="w-20 h-10 flex items-center justify-center border rounded bg-white text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
              )}
            </td>
          </tr>
        );
      })}
    </tbody>
  </table>
</div>
                      
                      {/* 검색 결과가 없는 경우 */}
                      {getFilteredSignatures().length === 0 && (
                        <div className="text-center py-10 text-gray-500">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <p>검색 결과가 없습니다.</p>
                        </div>
                      )}
                      
                      {/* 서명 통계 요약 - 하단 */}
                      <div className="bg-gray-50 px-4 py-3 text-xs text-gray-500 border-t border-gray-200">
                        총 서명자: {signatures.length}명 (찬성: {voteResults.approveCount}명, 반대: {voteResults.rejectCount}명)
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className={`text-center py-8 ${isExpired ? 'bg-gray-50' : 'bg-blue-50'} rounded-lg border ${isExpired ? 'border-gray-200' : 'border-blue-200'} mb-6`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-12 w-12 mx-auto ${isExpired ? 'text-gray-400' : 'text-blue-400'} mb-3`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    <p className={`text-lg font-medium ${isExpired ? 'text-gray-700' : 'text-blue-700'}`}>
                      {isExpired ? '마감되었지만 서명이 없습니다' : '아직 서명한 사용자가 없습니다'}
                    </p>
                    <p className={`mt-1 text-sm ${isExpired ? 'text-gray-500' : 'text-blue-500'}`}>
                      {isExpired ? '이 문서는 서명 없이 마감되었습니다.' : '첫 번째로 서명해 보세요!'}
                    </p>
                  </div>
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
                        {/* 매장 선택 UI */}
                        {userStores.length > 1 && (
                          <div className="mb-4">
                            <p className="text-sm font-medium text-gray-700 mb-2">서명할 매장 선택:</p>
                            <div className="bg-white rounded border p-3 max-h-32 overflow-y-auto">
                              {userStores.map((store, index) => (
                                <div 
                                  key={index} 
                                  className={`mb-2 last:mb-0 p-2 rounded cursor-pointer ${
                                    selectedStore === store.store_id 
                                      ? 'bg-blue-50 border border-blue-200' 
                                      : 'hover:bg-gray-50'
                                  }`}
                                  onClick={() => handleStoreChange(store.store_id, store.user_type)}
                                >
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
                        )}
                        
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
                                이 문서는 {getSignatureTargetText(post.signature_target)}만 서명이 필요합니다.
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
                        {userStores.length === 1 && (
                          <div className="mt-6">
                            <p className="text-sm font-medium text-gray-700 mb-2">나의 매장 정보:</p>
                            <div className="bg-white rounded border p-3">
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
                        )}
                        
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
                  <div className={`${isExpired ? 'bg-gray-50 border-gray-200' : 'bg-green-50 border-green-200'} border rounded-lg p-4 mb-6`}>
                    <div className="flex flex-col md:flex-row justify-between items-center">
                      <p className={`${isExpired ? 'text-gray-800' : 'text-green-800'} mb-3 md:mb-0`}>
                        {isExpired ? '이 문서에 서명하셨습니다. (마감됨)' : '이미 이 문서에 서명하셨습니다.'}
                        {userCurrentSignature && (
                          <span className="font-medium">
                            ({getUserTypeText(userCurrentSignature.user_type)}으로 
                            {userCurrentSignature.vote_type === 'approve' ? ' 찬성' : ' 반대'} 의견 제출)
                          </span>
                        )}
                      </p>
                      {!isExpired ? (
                        <button 
                          onClick={handleEditSignature}
                          className="px-4 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
                        >
                          서명 수정하기
                        </button>
                      ) : null}
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
                
                {/* 서명 공개 여부 투표 섹션 - 서명 섹션 아래로 이동 */}
                {showVoteSection && hasUserSigned && !isExpired && (
                  <div className="mt-8 pt-8 border-t border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-bold text-gray-800">서명 공개 여부 투표</h2>
                      <span className="text-sm px-3 py-1 bg-blue-100 text-blue-800 rounded-full">
                        {timeRemaining}
                      </span>
                    </div>
                    
                    {/* 투표 현황 */}
                    {visibilityVotes && (
                      <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <h3 className="text-sm font-medium text-gray-700 mb-2">서명 공개 여부 투표 현황</h3>
                        <div className="flex items-center space-x-6 mb-3">
                          <div className="flex items-center">
                            <span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                            <span className="text-sm">공개: {visibilityVotes.publicVotes}명</span>
                          </div>
                          <div className="flex items-center">
                            <span className="inline-block w-3 h-3 bg-red-500 rounded-full mr-2"></span>
                            <span className="text-sm">비공개: {visibilityVotes.privateVotes}명</span>
                          </div>
                          <div className="text-sm text-gray-500">
                            (총 {visibilityVotes.totalVotes}명 투표 / 서명자 {signatures.length}명)
                          </div>
                        </div>
                        
                        {/* 현재 상태에 따른 설명 */}
                        <div className="text-xs text-gray-500 mb-2">
                          현재 상태: {visibilityVotes.publicVotes > visibilityVotes.privateVotes 
                            ? <span className="text-green-600 font-medium">공개 상태</span>
                            : visibilityVotes.publicVotes === visibilityVotes.privateVotes 
                              ? <span className="text-yellow-600 font-medium">동점으로 비공개 상태</span>
                              : <span className="text-red-600 font-medium">비공개 상태</span>
                          }
                        </div>
                        
                        {/* 투표 마감일 */}
                        <div className="text-xs text-gray-500 mb-2">
                          투표 마감일: {getVotingDeadline()} (마감일까지 투표 수정 불가)
                        </div>
                        
                        {/* 투표 진행 바 */}
                        <div className="mt-2 w-full bg-gray-200 rounded-full h-2.5 mb-1">
                          <div 
                            className="bg-blue-500 h-2.5 rounded-full" 
                            style={{ width: `${calculateVotingProgressPercent()}%` }}
                          ></div>
                        </div>
                        
                        <div className="text-xs text-gray-500">
                          {getVotingProgressText()}
                        </div>
                        
                        {/* 과반수 설명 */}
                        <div className="mt-2 text-xs bg-blue-50 p-2 rounded border border-blue-100">
                          <p className="text-blue-800">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline-block mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            서명자 중 공개 투표가 비공개 투표보다 많을 경우에만 서명 정보가 공개됩니다.
                            공개/비공개 투표가 동일한 경우, 기본 원칙에 따라 비공개로 처리됩니다.
                          </p>
                        </div>
                      </div>
                    )}
                    
                    <p className="text-gray-700 mb-2">
                      이 문서에 서명한 정보(매장 이름, 찬반 여부, 서명 이미지)를 다른 사용자에게 공개할지 투표해주세요.
                    </p>
                    <p className="text-gray-600 text-sm mb-4">
                      모든 서명자 중 공개 투표가 비공개 투표보다 많을 경우에만 서명 정보가 공개됩니다. 
                      투표가 동일한 경우 비공개로 처리됩니다.
                      투표는 마감일({getVotingDeadline()})까지 진행되며, 한 번 투표하면 수정할 수 없습니다.
                    </p>
                    
                    {votingError && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                        <p className="text-red-800 text-sm">{votingError}</p>
                      </div>
                    )}
                    
                    {hasUserVoted ? (
                      <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <div className="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <p className="text-gray-700 font-medium">
                            귀하는 서명 정보 {userVoteForPublic ? '공개' : '비공개'}에 투표하셨습니다.
                          </p>
                        </div>
                        <p className="mt-2 text-sm text-gray-500">투표는 마감일까지 수정할 수 없습니다.</p>
                        
                        {/* 투표 상태 표시 */}
                        <div className="mt-4 flex space-x-4">
                          <button
                            disabled
                            className={`px-6 py-2 rounded-lg ${
                              userVoteForPublic
                                ? 'bg-green-600 text-white'
                                : 'bg-gray-200 text-gray-500'
                            } transition-colors font-medium opacity-70 cursor-not-allowed`}
                          >
                            공개에 동의
                          </button>
                          <button
                            disabled
                            className={`px-6 py-2 rounded-lg ${
                              userVoteForPublic === false
                                ? 'bg-red-600 text-white'
                                : 'bg-gray-200 text-gray-500'
                            } transition-colors font-medium opacity-70 cursor-not-allowed`}
                          >
                            비공개 선호
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col md:flex-row gap-4">
                        <button
                          onClick={() => handleVisibilityVote(true)}
                          disabled={votingInProgress}
                          className={`px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium ${
                            votingInProgress ? 'opacity-70 cursor-not-allowed' : ''
                          }`}
                        >
                          {votingInProgress ? '처리 중...' : '공개에 동의'}
                        </button>
                        <button
                          onClick={() => handleVisibilityVote(false)}
                          disabled={votingInProgress}
                          className={`px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium ${
                            votingInProgress ? 'opacity-70 cursor-not-allowed' : ''
                          }`}
                        >
                          {votingInProgress ? '처리 중...' : '비공개 선호'}
                        </button>
                      </div>
                    )}
                    
                    {/* 투표에 대한 부가 설명 */}
                    <div className="mt-4">
                      <div className="bg-white border border-gray-200 rounded-lg p-3">
                      <h4 className="font-medium text-gray-800 mb-2 text-sm">서명 공개 여부 투표 안내</h4>
                        <ul className="text-xs text-gray-600 space-y-1 list-disc pl-5">
                          <li>투표는 마감일까지 진행됩니다.</li>
                          <li>한 번 투표한 내용은 수정할 수 없습니다.</li>
                          <li>공개 투표가 비공개 투표보다 많을 경우에만 서명 정보가 공개됩니다.</li>
                          <li><strong>공개/비공개 투표 수가 같을 경우 비공개로 처리됩니다.</strong></li>
                          <li>공개되는 정보: 서명자 이름, 매장 정보, 찬반 여부, 서명 이미지</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* 마감된 경우 서명 공개 여부 투표 결과 표시 - 토스 스타일로 개선 */}
                {isExpired && visibilityVotes && (
                  <div className="mt-8 pt-8 border-t border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <h2 className="text-xl font-bold text-gray-800">투표 최종 결과</h2>
                        <span className="ml-3 px-3 py-1 bg-red-100 text-red-800 text-sm font-medium rounded-full">
                          {formatDate(post.expiry_date || '')} 마감
                        </span>
                      </div>
                    </div>
                    
                    <div className="mb-6 bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                          <h3 className="text-base font-medium text-gray-800 mb-4 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            공개 투표
                          </h3>
                          <div className="flex items-center justify-between mb-2">
                            <div className="text-4xl font-bold text-green-600">
                              {visibilityVotes.publicVotes}
                              <span className="text-sm font-normal text-gray-500 ml-1">명</span>
                            </div>
                            <div className="text-xl font-semibold text-gray-700">
                              {Math.round((visibilityVotes.publicVotes / (visibilityVotes.totalVotes || 1)) * 100)}%
                            </div>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full" 
                              style={{ width: `${Math.round((visibilityVotes.publicVotes / (visibilityVotes.totalVotes || 1)) * 100)}%` }}
                            ></div>
                          </div>
                        </div>
                        
                        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                          <h3 className="text-base font-medium text-gray-800 mb-4 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            비공개 투표
                          </h3>
                          <div className="flex items-center justify-between mb-2">
                            <div className="text-4xl font-bold text-red-600">
                              {visibilityVotes.privateVotes}
                              <span className="text-sm font-normal text-gray-500 ml-1">명</span>
                            </div>
                            <div className="text-xl font-semibold text-gray-700">
                              {Math.round((visibilityVotes.privateVotes / (visibilityVotes.totalVotes || 1)) * 100)}%
                            </div>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-red-500 h-2 rounded-full" 
                              style={{ width: `${Math.round((visibilityVotes.privateVotes / (visibilityVotes.totalVotes || 1)) * 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                      
                      {/* 최종 결과 */}
                      <div className="mt-4 text-center">
                        <p className="text-sm text-gray-500 mb-2">총 투표자 수: {visibilityVotes.totalVotes}명 (전체 서명자 {signatures.length}명 중 {calculateVotingProgressPercent()}%)</p>
                        
                        {visibilityVotes.publicVotes > visibilityVotes.privateVotes ? (
                          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                            <p className="text-lg font-medium text-green-800">최종 결과: <span className="font-bold">공개</span></p>
                            <p className="text-sm text-green-700 mt-1">
                              공개 투표({visibilityVotes.publicVotes}명)가 비공개 투표({visibilityVotes.privateVotes}명)보다 많아 서명 정보가 공개됩니다.
                            </p>
                          </div>
                        ) : visibilityVotes.publicVotes === visibilityVotes.privateVotes ? (
                          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                            <p className="text-lg font-medium text-yellow-800">최종 결과: <span className="font-bold">비공개</span></p>
                            <p className="text-sm text-yellow-700 mt-1">
                              공개 투표({visibilityVotes.publicVotes}명)와 비공개 투표({visibilityVotes.privateVotes}명)가 동일하여 기본 원칙에 따라 비공개로 처리됩니다.
                            </p>
                          </div>
                        ) : (
                          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                            <p className="text-lg font-medium text-red-800">최종 결과: <span className="font-bold">비공개</span></p>
                            <p className="text-sm text-red-700 mt-1">
                              비공개 투표({visibilityVotes.privateVotes}명)가 공개 투표({visibilityVotes.publicVotes}명)보다 많아 서명 정보가 비공개됩니다.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {hasUserSigned && (
                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <div className="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <div>
                            <p className="text-gray-700 font-medium">
                              귀하는 이 문서에 서명하셨습니다.
                            </p>
                            {hasUserVoted && (
                              <p className="text-sm text-gray-500">
                                귀하의 투표: <span className={userVoteForPublic ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                                  {userVoteForPublic ? '공개' : '비공개'}
                                </span>
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 하단 버튼 - 마감된 게시글은 관리자도 수정 불가능하도록 변경 */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
            <Link href="/merchant-association" className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
              목록으로
            </Link>
            
            {isAdmin && !isExpired ? (
              <Link href={`/merchant-association/edit/${id}`} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                수정하기
              </Link>
            ) : isAdmin && isExpired ? (
              <div className="flex items-center text-red-500 bg-red-50 px-4 py-2 rounded-lg border border-red-100">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-medium">마감된 게시글은 수정할 수 없습니다</span>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}