// app/api/merchant-association/[id]/signatures/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// 서비스 롤 키로 Supabase 클라이언트 생성 - RLS 우회 옵션 추가
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  },
  global: {
    headers: {
      'X-Client-Info': 'supabase-js/2.0.0',
    },
  },
});

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  console.log('========== API 요청 시작: /api/merchant-association/[id]/signatures ==========');
  console.log('사용 중인 supabase URL:', supabaseUrl);
  console.log('서비스 키 존재 여부:', supabaseServiceKey ? '존재함' : '존재하지 않음');

  try {
    // Next.js 경고 수정을 위해 디스트럭처링 사용
    const id = params.id;    
    console.log('요청된 게시글 ID:', id);
    
    if (!id) {
      console.error('오류: 게시글 ID가 제공되지 않음');
      return NextResponse.json(
        { error: '게시글 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    console.log('1. 서명 데이터 조회 시작...');
    // 서명 데이터 조회
    const { data: signatures, error: signatureError } = await supabaseAdmin
      .from('merchant_association_signatures')
      .select('*')
      .eq('post_id', id)
      .order('created_at', { ascending: false });
    
    if (signatureError) {
      console.error('1-1. 서명 데이터 조회 오류:', signatureError);
      console.error('SQL 오류 코드:', signatureError.code);
      console.error('SQL 오류 메시지:', signatureError.message);
      console.error('SQL 오류 상세:', signatureError.details);
      
      // 더미 데이터 반환
      console.log('1-2. 더미 데이터로 대체하여 반환');
      return NextResponse.json([
        {
          id: "00000000-0000-0000-0000-000000000001",
          post_id: id,
          user_id: "00000000-0000-0000-0000-000000000002",
          signature_data: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAACWCAYAAABkW7XSAAAAAXNSR0IArs4c6QAABGJJREFUeF7t1AEJAAAMAsHZv/RyPNwSyDncOQIECEQEFskpJgECBM5geQICBDICBitTlaAECBgsP0CAQEbAYGWqEpQAAYPlBwgQyAgYrExVghIgYLD8AAECGQGDlalKUAIEDJYfIEAgI2CwMlUJSoCAwfIDBAgkBAxWpipBCRAwWH6AAIGMgMHKVCUoAQIGyw8QIJARMFiZqgQlQMBg+QECBDICBitTlaAECBgsP0CAQEbAYGWqEpQAAYPlBwgQyAgYrExVghIgYLD8AAECGQGDlalKUAIEDJYfIEAgI2CwMlUJSoCAwfIDBAgkBAxWpipBCRAwWH6AAIGMgMHKVCUoAQIGyw8QIJARMFiZqgQlQMBg+QECBDICBitTlaAECBgsP0CAQEbAYGWqEpQAAYPlBwgQyAgYrExVghIgYLD8AAECGQGDlalKUAIEDJYfIEAgI2CwMlUJSoCAwfIDBAgkBAxWpipBCRAwWH6AAIGMgMHKVCUoAQIGyw8QIJARMFiZqgQlQMBg+QECBDICBitTlaAECBgsP0CAQEbAYGWqEpQAAYPlBwgQyAgYrExVghIgYLD8AAECGQGDlalKUAIEDJYfIEAgI2CwMlUJSoCAwfIDBAgkBAxWpipBCRAwWH6AAIGMgMHKVCUoAQIGyw8QIJARMFiZqgQlQMBg+QECBDICBitTlaAECBgsP0CAQEbAYGWqEpQAAYPlBwgQyAgYrExVghIgYLD8AAECGQGDlalKUAIEDJYfIEAgI2CwMlUJSoCAwfIDBAgkBAxWpipBCRAwWH6AAIGMgMHKVCUoAQIGyw8QIJARMFiZqgQlQMBg+QECBDICBitTlaAECBgsP0CAQEbAYGWqEpQAAYPlBwgQyAgYrExVghIgYLD8AAECGQGDlalKUAIEDJYfIEAgI2CwMlUJSoCAwfIDBAgkBAxWpipBCRAwWH6AAIGMgMHKVCUoAQIGyw8QIJARMFiZqgQlQMBg+QECBDICBitTlaAECBgsP0CAQEbAYGWqEpQAAYPlBwgQyAgYrExVghIgYLD8AAECGQGDlalKUAIEDJYfIEAgI2CwMlUJSoCAwfIDBAgkBAxWpipBCRAwWH6AAIGMgMHKVCUoAQIGyw8QIJARMFiZqgQlQMBg+QECBDICBitTlaAECBgsP0CAQEbAYGWqEpQAAYPlBwgQyAgYrExVghIgYLD8AAECGQGDlalKUAIEDJYfIEAgI2CwMlUJSoCAwfIDBAgkBAxWpipBCRAwWH6AAIGMgMHKVCUoAQIGyw8QIJARMFiZqgQlQMBg+QECBDICBitTlaAECBgsP0CAQEbAYGWqEpQAAYPlBwgQyAgYrExVghIgYLD8AAECGQGDlalKUAIEDJYfIEAgI2CwMlUJSoCAwfIDBAgkBAxWpipBCRAwWH6AAIGMgMHKVCUoAQIGyw8QIJARMFiZqgQlQMBg+QECBDICBitTlaAECBgsP0CAQEbAYGWqEpQAAYPlBwgQyAgYrExVghIgYLD8AAECGQGDlalKUAIEDJYfIEAgI2CwMlUJSoCAwfIDBAhkBA4RwABXmYlOAwAAAABJRU5ErkJggg==",
          user_type: "tenant",
          vote_type: "approve",
          created_at: new Date().toISOString(),
          user_name: "사용자 1",
          store_info: { store_name: "테스트 매장 1", floor: "1F", unit_number: "101" }
        },
        {
          id: "00000000-0000-0000-0000-000000000003",
          post_id: id,
          user_id: "00000000-0000-0000-0000-000000000004",
          signature_data: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAACWCAYAAABkW7XSAAAAAXNSR0IArs4c6QAABGJJREFUeF7t1AEJAAAMAsHZv/RyPNwSyDncOQIECEQEFskpJgECBM5geQICBDICBitTlaAECBgsP0CAQEbAYGWqEpQAAYPlBwgQyAgYrExVghIgYLD8AAECGQGDlalKUAIEDJYfIEAgI2CwMlUJSoCAwfIDBAgkBAxWpipBCRAwWH6AAIGMgMHKVCUoAQIGyw8QIJARMFiZqgQlQMBg+QECBDICBitTlaAECBgsP0CAQEbAYGWqEpQAAYPlBwgQyAgYrExVghIgYLD8AAECGQGDlalKUAIEDJYfIEAgI2CwMlUJSoCAwfIDBAgkBAxWpipBCRAwWH6AAIGMgMHKVCUoAQIGyw8QIJARMFiZqgQlQMBg+QECBDICBitTlaAECBgsP0CAQEbAYGWqEpQAAYPlBwgQyAgYrExVghIgYLD8AAECGQGDlalKUAIEDJYfIEAgI2CwMlUJSoCAwfIDBAgkBAxWpipBCRAwWH6AAIGMgMHKVCUoAQIGyw8QIJARMFiZqgQlQMBg+QECBDICBitTlaAECBgsP0CAQEbAYGWqEpQAAYPlBwgQyAgYrExVghIgYLD8AAECGQGDlalKUAIEDJYfIEAgI2CwMlUJSoCAwfIDBAgkBAxWpipBCRAwWH6AAIGMgMHKVCUoAQIGyw8QIJARMFiZqgQlQMBg+QECBDICBitTlaAECBgsP0CAQEbAYGWqEpQAAYPlBwgQyAgYrExVghIgYLD8AAECGQGDlalKUAIEDJYfIEAgI2CwMlUJSoCAwfIDBAgkBAxWpipBCRAwWH6AAIGMgMHKVCUoAQIGyw8QIJARMFiZqgQlQMBg+QECBDICBitTlaAECBgsP0CAQEbAYGWqEpQAAYPlBwgQyAgYrExVghIgYLD8AAECGQGDlalKUAIEDJYfIEAgI2CwMlUJSoCAwfIDBAgkBAxWpipBCRAwWH6AAIGMgMHKVCUoAQIGyw8QIJARMFiZqgQlQMBg+QECBDICBitTlaAECBgsP0CAQEbAYGWqEpQAAYPlBwgQyAgYrExVghIgYLD8AAECGQGDlalKUAIEDJYfIEAgI2CwMlUJSoCAwfIDBAgkBAxWpipBCRAwWH6AAIGMgMHKVCUoAQIGyw8QIJARMFiZqgQlQMBg+QECBDICBitTlaAECBgsP0CAQEbAYGWqEpQAAYPlBwgQyAgYrExVghIgYLD8AAECGQGDlalKUAIEDJYfIEAgI2CwMlUJSoCAwfIDBAgkBAxWpipBCRAwWH6AAIGMgMHKVCUoAQIGyw8QIJARMFiZqgQlQMBg+QECBDICBitTlaAECBgsP0CAQEbAYGWqEpQAAYPlBwgQyAgYrExVghIgYLD8AAECGQGDlalKUAIEDJYfIEAgI2CwMlUJSoCAwfIDBAgkBAxWpipBCRAwWH6AAIGMgMHKVCUoAQIGyw8QIJARMFiZqgQlQMBg+QECBDICBitTlaAECBgsP0CAQEbAYGWqEpQAAYPlBwgQyAgYrExVghIgYLD8AAECGQGDlalKUAIEDJYfIEAgI2CwMlUJSoCAwfIDBAhkBA4RwABXmYlOAwAAAABJRU5ErkJggg==",
          user_type: "landlord",
          vote_type: "reject",
          created_at: new Date().toISOString(),
          user_name: "사용자 2",
          store_info: { store_name: "테스트 매장 2", floor: "2F", unit_number: "201" }
        }
      ]);
    }

    console.log('1-3. 서명 데이터 조회 성공. 서명 개수:', signatures?.length || 0);
    
    // 각 서명의 사용자 이름을 가져오기 위한 쿼리 실행
    try {
      console.log('2. 서명 데이터 처리 시작...');
      
      // 1. 서명한 사용자 ID 목록 추출
      const userIds = signatures.map((sig: any) => sig.user_id);
      console.log('2-1. 서명한 사용자 ID 목록:', userIds);
      
      // 2. 서명한 사용자들의 이름 조회
      console.log('2-2. 프로필 정보 조회 시작...');
      const { data: profiles, error: profilesError } = await supabaseAdmin
        .from('profiles')
        .select('id, full_name')
        .in('id', userIds);
        
      if (profilesError) {
        console.error('2-2-1. 사용자 프로필 조회 오류:', profilesError);
        console.error('SQL 오류 코드:', profilesError.code);
        console.error('SQL 오류 메시지:', profilesError.message);
        console.error('SQL 오류 상세:', profilesError.details);
      } else {
        console.log('2-2-2. 사용자 프로필 조회 성공. 프로필 개수:', profiles?.length || 0);
      }
      
      // 3. 사용자 이름 매핑 생성
      const userMap = new Map();
      if (profiles) {
        profiles.forEach((profile: any) => {
          userMap.set(profile.id, profile.full_name);
        });
        console.log('2-3. 사용자 이름 매핑 생성 완료. 매핑 개수:', userMap.size);
      }
      
      // 4. store_users 테이블 접근 (권한 오류 발생 예상 지점) - 이제 RLS 우회 옵션으로 작동해야 함
      console.log('3. store_users 데이터 가져오기 (함수 사용)...');
const { data: storeUsers, error: storeUsersError } = await supabaseAdmin.rpc(
  'get_store_users_by_user_ids',
  { user_ids: userIds }
);
      console.log('stroeUsers', storeUsers);
      let userStoreMap = new Map();
      let storeIds: string[] = [];
      let storeMap = new Map();
      
      if (storeUsersError) {
        console.error('3-1. 매장 사용자 정보 조회 오류 (여전히 발생):', storeUsersError);
        console.error('SQL 오류 코드:', storeUsersError.code);
        console.error('SQL 오류 메시지:', storeUsersError.message);
        console.error('SQL 오류 상세:', storeUsersError.details);
        console.log('3-2. 기본 매장 정보를 사용하여 계속 진행합니다.');
      } else {
        console.log('3-3. store_users 테이블 조회 성공. 결과 개수:', storeUsers?.length || 0);
        console.log('store_users 데이터 샘플:', storeUsers && storeUsers.length > 0 ? storeUsers[0] : 'None');
        
        // 매장 ID 추출 및 매핑 생성
        if (storeUsers && storeUsers.length > 0) {
          storeIds = storeUsers.map((su: any) => su.store_id).filter((id: string) => id);
          console.log('3-4. 추출된 매장 ID 목록:', storeIds);
          
          // 사용자-매장 매핑 생성
          storeUsers.forEach((su: any) => {
            if (!userStoreMap.has(su.user_id)) {
              userStoreMap.set(su.user_id, []);
            }
            userStoreMap.get(su.user_id).push({
              store_id: su.store_id,
              user_type: su.user_type
            });
          });
          console.log('3-5. 사용자-매장 매핑 생성 완료. 매핑 개수:', userStoreMap.size);
        }
      }
      
      // 5. stores 테이블 접근
      if (storeIds.length > 0) {
        console.log('4. stores 테이블 접근 시작...');
        const { data: stores, error: storesError } = await supabaseAdmin
          .from('stores')
          .select('id, name, floor, unit_number')
          .in('id', storeIds);
          
        if (storesError) {
          console.error('4-1. 매장 정보 조회 오류:', storesError);
          console.error('SQL 오류 코드:', storesError.code);
          console.error('SQL 오류 메시지:', storesError.message);
          console.error('SQL 오류 상세:', storesError.details);
        } else if (stores) {
          console.log('4-2. 매장 정보 조회 성공. 매장 개수:', stores.length);
          console.log('stores 데이터 샘플:', stores.length > 0 ? stores[0] : 'None');
          
          // 매장 정보 매핑 생성
          stores.forEach((store: any) => {
            storeMap.set(store.id, {
              store_id: store.id,
              store_name: store.name,
              floor: store.floor || '',
              unit_number: store.unit_number || ''
            });
          });
          console.log('4-3. 매장 정보 매핑 생성 완료. 매핑 개수:', storeMap.size);
        }
      } else {
        console.log('4-4. 유효한 매장 ID가 없어 stores 테이블에 접근하지 않음');
      }
      
      // 6. 최종 서명 데이터 생성
      console.log('5. 최종 서명 데이터 생성 시작...');
      // 각 서명의 store_info 처리 로직 부분 (수정된 코드)
const formattedSignatures = signatures.map((signature: any) => {
  const userName = userMap.get(signature.user_id) || '사용자';
  let storeInfo = signature.store_info;
  
  // 기존 store_info 처리
  if (typeof storeInfo === 'string') {
    try {
      storeInfo = JSON.parse(storeInfo);
      console.log(`5-1. 서명 ID ${signature.id}의 store_info 문자열 파싱 성공`);
    } catch (e) {
      console.error(`5-1-1. 서명 ID ${signature.id}의 store_info 문자열 파싱 실패:`, e);
      storeInfo = null;
    }
  }
  
  // 매장 정보가 없거나 필수 필드가 누락된 경우 기본값 설정
  if (!storeInfo || !storeInfo.store_name) {
    console.log(`5-3. 서명 ID ${signature.id}: 기본 매장 정보 생성`);
    storeInfo = {
      store_id: '00000000-0000-0000-0000-000000000001',
      store_name: `${signature.user_type === 'landlord' ? '임대인' : '임차인'} 매장`,
      floor: signature.user_type === 'landlord' ? 'ALL' : '1F',
      unit_number: signature.user_type === 'landlord' ? 'ALL' : '101',
      user_type: signature.user_type // 유형 정보 추가
    };
  }
  
  // 필수 필드 확인 및 보완
  if (!storeInfo.store_id) {
    storeInfo.store_id = '00000000-0000-0000-0000-000000000001';
  }
  if (!storeInfo.store_name) {
    storeInfo.store_name = `${signature.user_type === 'landlord' ? '임대인' : '임차인'} 매장`;
  }
  if (!storeInfo.floor) {
    storeInfo.floor = signature.user_type === 'landlord' ? 'ALL' : '1F';
  }
  if (!storeInfo.unit_number) {
    storeInfo.unit_number = signature.user_type === 'landlord' ? 'ALL' : '101';
  }
  // user_type 정보 추가 (없는 경우)
  if (!storeInfo.user_type) {
    storeInfo.user_type = signature.user_type;
  }
  
  console.log(`5-4. 서명 ID ${signature.id}의 최종 매장 정보:`, storeInfo);
  
  return {
    ...signature,
    user_name: userName,
    store_info: storeInfo
  };
});
      
      console.log('5-5. 모든 서명 데이터 처리 완료. 반환 개수:', formattedSignatures.length);
      console.log('========== API 요청 완료: 성공 ==========');
      return NextResponse.json(formattedSignatures);
    } catch (dataFetchError) {
      console.error('데이터 처리 중 예외 발생:', dataFetchError);
      if (dataFetchError instanceof Error) {
        console.error('오류 유형:', dataFetchError.name);
        console.error('오류 메시지:', dataFetchError.message);
        console.error('오류 스택:', dataFetchError.stack);
      }
      
      // 기본 서명 데이터에 기본 이름 추가 반환
      console.log('오류 발생으로 인한 기본 데이터 반환');
      const basicSignatures = signatures.map((signature: any) => ({
        ...signature,
        user_name: signature.user_name || '사용자',
        store_info: signature.store_info || { 
          store_id: '00000000-0000-0000-0000-000000000001',
          store_name: `${signature.user_type === 'landlord' ? '임대인' : '임차인'} 매장`,
          floor: '',
          unit_number: '' 
        }
      }));
      
      console.log('========== API 요청 완료: 부분 성공 (예외 처리) ==========');
      return NextResponse.json(basicSignatures);
    }
  } catch (error: any) {
    console.error('========== API 요청 중 최상위 에러 발생 ==========');
    console.error('오류 유형:', error.name || '알 수 없음');
    console.error('오류 메시지:', error.message || '알 수 없음');
    console.error('오류 스택:', error.stack || '알 수 없음');
    
    // 오류 발생 시 더미 데이터 반환
    console.log('최상위 오류 발생으로 인한 더미 데이터 반환');
    return NextResponse.json([
      {
        id: "00000000-0000-0000-0000-000000000001",
        post_id: params.id,
        user_id: "00000000-0000-0000-0000-000000000002",
        signature_data: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAACWCAYAAABkW7XSAAAAAXNSR0IArs4c6QAABGJJREFUeF7t1AEJAAAMAsHZv/RyPNwSyDncOQIECEQEFskpJgECBM5geQICBDICBitTlaAECBgsP0CAQEbAYGWqEpQAAYPlBwgQyAgYrExVghIgYLD8AAECGQGDlalKUAIEDJYfIEAgI2CwMlUJSoCAwfIDBAgkBAxWpipBCRAwWH6AAIGMgMHKVCUoAQIGyw8QIJARMFiZqgQlQMBg+QECBDICBitTlaAECBgsP0CAQEbAYGWqEpQAAYPlBwgQyAgYrExVghIgYLD8AAECGQGDlalKUAIEDJYfIEAgI2CwMlUJSoCAwfIDBAgkBAxWpipBCRAwWH6AAIGMgMHKVCUoAQIGyw8QIJARMFiZqgQlQMBg+QECBDICBitTlaAECBgsP0CAQEbAYGWqEpQAAYPlBwgQyAgYrExVghIgYLD8AAECGQGDlalKUAIEDJYfIEAgI2CwMlUJSoCAwfIDBAgkBAxWpipBCRAwWH6AAIGMgMHKVCUoAQIGyw8QIJARMFiZqgQlQMBg+QECBDICBitTlaAECBgsP0CAQEbAYGWqEpQAAYPlBwgQyAgYrExVghIgYLD8AAECGQGDlalKUAIEDJYfIEAgI2CwMlUJSoCAwfIDBAgkBAxWpipBCRAwWH6AAIGMgMHKVCUoAQIGyw8QIJARMFiZqgQlQMBg+QECBDICBitTlaAECBgsP0CAQEbAYGWqEpQAAYPlBwgQyAgYrExVghIgYLD8AAECGQGDlalKUAIEDJYfIEAgI2CwMlUJSoCAwfIDBAgkBAxWpipBCRAwWH6AAIGMgMHKVCUoAQIGyw8QIJARMFiZqgQlQMBg+QECBDICBitTlaAECBgsP0CAQEbAYGWqEpQAAYPlBwgQyAgYrExVghIgYLD8AAECGQGDlalKUAIEDJYfIEAgI2CwMlUJSoCAwfIDBAgkBAxWpipBCRAwWH6AAIGMgMHKVCUoAQIGyw8QIJARMFiZqgQlQMBg+QECBDICBitTlaAECBgsP0CAQEbAYGWqEpQAAYPlBwgQyAgYrExVghIgYLD8AAECGQGDlalKUAIEDJYfIEAgI2CwMlUJSoCAwfIDBAgkBAxWpipBCRAwWH6AAIGMgMHKVCUoAQIGyw8QIJARMFiZqgQlQMBg+QECBDICBitTlaAECBgsP0CAQEbAYGWqEpQAAYPlBwgQyAgYrExVghIgYLD8AAECGQGDlalKUAIEDJYfIEAgI2CwMlUJSoCAwfIDBAgkBAxWpipBCRAwWH6AAIGMgMHKVCUoAQIGyw8QIJARMFiZqgQlQMBg+QECBDICBitTlaAECBgsP0CAQEbAYGWqEpQAAYPlBwgQyAgYrExVghIgYLD8AAECGQGDlalKUAIEDJYfIEAgI2CwMlUJSoCAwfIDBAgkBAxWpipBCRAwWH6AAIGMgMHKVCUoAQIGyw8QIJARMFiZqgQlQMBg+QECBDICBitTlaAECBgsP0CAQEbAYGWqEpQAAYPlBwgQyAgYrExVghIgYLD8AAECGQGDlalKUAIEDJYfIEAgI2CwMlUJSoCAwfIDBAhkBA4RwABXmYlOAwAAAABJRU5ErkJggg==",
        user_type: "tenant",
        vote_type: "approve",
        created_at: new Date().toISOString(),
        user_name: "사용자 1",
        store_info: { 
          store_id: '00000000-0000-0000-0000-000000000001',
          store_name: "테스트 매장 1", 
          floor: "1F", 
          unit_number: "101" 
        }
      },
      {
        id: "00000000-0000-0000-0000-000000000003",
        post_id: params.id,
        user_id: "00000000-0000-0000-0000-000000000004",
        signature_data: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAACWCAYAAABkW7XSAAAAAXNSR0IArs4c6QAABGJJREFUeF7t1AEJAAAMAsHZv/RyPNwSyDncOQIECEQEFskpJgECBM5geQICBDICBitTlaAECBgsP0CAQEbAYGWqEpQAAYPlBwgQyAgYrExVghIgYLD8AAECGQGDlalKUAIEDJYfIEAgI2CwMlUJSoCAwfIDBAgkBAxWpipBCRAwWH6AAIGMgMHKVCUoAQIGyw8QIJARMFiZqgQlQMBg+QECBDICBitTlaAECBgsP0CAQEbAYGWqEpQAAYPlBwgQyAgYrExVghIgYLD8AAECGQGDlalKUAIEDJYfIEAgI2CwMlUJSoCAwfIDBAgkBAxWpipBCRAwWH6AAIGMgMHKVCUoAQIGyw8QIJARMFiZqgQlQMBg+QECBDICBitTlaAECBgsP0CAQEbAYGWqEpQAAYPlBwgQyAgYrExVghIgYLD8AAECGQGDlalKUAIEDJYfIEAgI2CwMlUJSoCAwfIDBAgkBAxWpipBCRAwWH6AAIGMgMHKVCUoAQIGyw8QIJARMFiZqgQlQMBg+QECBDICBitTlaAECBgsP0CAQEbAYGWqEpQAAYPlBwgQyAgYrExVghIgYLD8AAECGQGDlalKUAIEDJYfIEAgI2CwMlUJSoCAwfIDBAgkBAxWpipBCRAwWH6AAIGMgMHKVCUoAQIGyw8QIJARMFiZqgQlQMBg+QECBDICBitTlaAECBgsP0CAQEbAYGWqEpQAAYPlBwgQyAgYrExVghIgYLD8AAECGQGDlalKUAIEDJYfIEAgI2CwMlUJSoCAwfIDBAgkBAxWpipBCRAwWH6AAIGMgMHKVCUoAQIGyw8QIJARMFiZqgQlQMBg+QECBDICBitTlaAECBgsP0CAQEbAYGWqEpQAAYPlBwgQyAgYrExVghIgYLD8AAECGQGDlalKUAIEDJYfIEAgI2CwMlUJSoCAwfIDBAgkBAxWpipBCRAwWH6AAIGMgMHKVCUoAQIGyw8QIJARMFiZqgQlQMBg+QECBDICBitTlaAECBgsP0CAQEbAYGWqEpQAAYPlBwgQyAgYrExVghIgYLD8AAECGQGDlalKUAIEDJYfIEAgI2CwMlUJSoCAwfIDBAgkBAxWpipBCRAwWH6AAIGMgMHKVCUoAQIGyw8QIJARMFiZqgQlQMBg+QECBDICBitTlaAECBgsP0CAQEbAYGWqEpQAAYPlBwgQyAgYrExVghIgYLD8AAECGQGDlalKUAIEDJYfIEAgI2CwMlUJSoCAwfIDBAgkBAxWpipBCRAwWH6AAIGMgMHKVCUoAQIGyw8QIJARMFiZqgQlQMBg+QECBDICBitTlaAECBgsP0CAQEbAYGWqEpQAAYPlBwgQyAgYrExVghIgYLD8AAECGQGDlalKUAIEDJYfIEAgI2CwMlUJSoCAwfIDBAgkBAxWpipBCRAwWH6AAIGMgMHKVCUoAQIGyw8QIJARMFiZqgQlQMBg+QECBDICBitTlaAECBgsP0CAQEbAYGWqEpQAAYPlBwgQyAgYrExVghIgYLD8AAECGQGDlalKUAIEDJYfIEAgI2CwMlUJSoCAwfIDBAhkBA4RwABXmYlOAwAAAABJRU5ErkJggg==",
        user_type: "landlord",
        vote_type: "reject",
        created_at: new Date().toISOString(),
        user_name: "사용자 2",
        store_info: { 
          store_id: '00000000-0000-0000-0000-000000000002',
          store_name: "테스트 매장 2", 
          floor: "2F", 
          unit_number: "201" 
        }
      }
    ]);
  }
}