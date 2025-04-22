// app/api/merchant-association/signature/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// 서비스 롤 키로 Supabase 클라이언트 생성
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    console.log('서명 API 호출 시작');
    
    // 요청 데이터 파싱
    const requestData = await request.json();
    console.log('요청 받은 데이터:', requestData);
    
    const { postId, userId, signatureData, userType, voteType, storeId } = requestData;

    // 필수 데이터 확인
    if (!postId || !userId || !signatureData || !userType || !storeId) {
      console.error('필수 필드 누락:', { postId, userId, userType, storeId });
      return NextResponse.json(
        { error: '필수 정보가 누락되었습니다.' },
        { status: 400 }
      );
    }

    // 게시글 존재 확인
    const { data: post, error: postError } = await supabaseAdmin
      .from('merchant_association_posts')
      .select('signature_required, signature_target')
      .eq('id', postId)
      .single();

    if (postError) {
      console.error('게시글 조회 오류:', postError);
      return NextResponse.json(
        { error: '게시글을 찾을 수 없습니다.', details: postError.message },
        { status: 404 }
      );
    }

    // 서명이 필요한 게시글인지 확인
    if (!post.signature_required) {
      return NextResponse.json(
        { error: '이 게시글은 서명이 필요하지 않습니다.' },
        { status: 400 }
      );
    }

    // 서명 대상 확인
    if (post.signature_target !== 'both' && post.signature_target !== userType) {
      return NextResponse.json(
        { error: `이 게시글은 ${post.signature_target === 'landlord' ? '임대인' : '임차인'}만 서명할 수 있습니다.` },
        { status: 400 }
      );
    }

    // 이미 서명했는지 확인
    const { data: existingSignature, error: signatureCheckError } = await supabaseAdmin
      .from('merchant_association_signatures')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .maybeSingle();

    if (signatureCheckError) {
      console.error('기존 서명 확인 오류:', signatureCheckError);
    } else if (existingSignature) {
      return NextResponse.json(
        { error: '이미 이 게시글에 서명하셨습니다.' },
        { status: 400 }
      );
    }
    
    // 매장 정보 가져오기
    const { data: storeData, error: storeError } = await supabaseAdmin
      .from('stores')
      .select('name, floor, unit_number')
      .eq('id', storeId)
      .single();
      
    if (storeError) {
      console.error('매장 정보 조회 오류:', storeError);
    }
    
    // 매장 정보 JSON 객체 생성
    const storeInfo = storeData ? {
      store_id: storeId,
      store_name: storeData.name,
      floor: storeData.floor,
      unit_number: storeData.unit_number
    } : { store_id: storeId };

    // 서명 저장
    try {
      console.log('서명 저장 시도');
      const { data: signature, error: signatureError } = await supabaseAdmin
        .from('merchant_association_signatures')
        .insert({
          post_id: postId,
          user_id: userId,
          signature_data: signatureData,
          user_type: userType,
          vote_type: voteType || null,
          store_info: storeInfo
        })
        .select('id')
        .single();

      if (signatureError) {
        console.error('서명 저장 오류:', signatureError);
        return NextResponse.json(
          { error: '서명 저장 중 오류가 발생했습니다.', details: signatureError.message },
          { status: 500 }
        );
      }

      console.log('서명 저장 성공:', signature?.id);
      return NextResponse.json({ 
        success: true, 
        message: '서명이 성공적으로 저장되었습니다.',
        id: signature?.id
      });
    } catch (savingError) {
      console.error('서명 저장 중 예외 발생:', savingError);
      return NextResponse.json(
        { error: '서명 저장 중 오류가 발생했습니다.' },
        { status: 500 }
      );
    }
  } catch (err: any) {
    console.error('API 최상위 오류:', err);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.', details: err.message },
      { status: 500 }
    );
  }
}

// 테이블 확인 및 생성
async function checkAndCreateTable() {
  try {
    // 테이블 존재 확인
    const { data: exists, error: existsError } = await supabaseAdmin.rpc('table_exists', {
      table_name: 'merchant_association_signatures'
    });
    
    if (existsError) {
      console.error('테이블 존재 확인 오류:', existsError);
      return false;
    }
    
    if (!exists) {
      // 테이블이 없으면 생성
      console.log('테이블 생성 시도');
      const { error: createError } = await supabaseAdmin.rpc('create_signature_table_if_not_exists');
      
      if (createError) {
        console.error('테이블 생성 오류:', createError);
        return false;
      }
      
      console.log('테이블 생성 성공');
      return true;
    }
    
    return true;
  } catch (error) {
    console.error('테이블 확인/생성 과정에서 예외 발생:', error);
    return false;
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const postId = params.id;
    
    if (!postId) {
      return NextResponse.json(
        { error: '게시글 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    // 게시글 존재 확인
    const { data: post, error: postError } = await supabaseAdmin
      .from('merchant_association_posts')
      .select('*')
      .eq('id', postId)
      .single();

    if (postError) {
      console.error('게시글 조회 오류:', postError);
      return NextResponse.json(
        { error: '게시글을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }
    
    // 서명 데이터 조회
    const { data: signatures, error: signaturesError } = await supabaseAdmin
      .from('merchant_association_signatures')
      .select(`
        id, 
        post_id, 
        user_id, 
        signature_data, 
        user_type, 
        vote_type, 
        created_at, 
        store_info,
        visibility_vote,
        profiles(name),
        names(name)
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: false });

    if (signaturesError) {
      console.error('서명 조회 오류:', signaturesError);
      return NextResponse.json(
        { error: '서명 정보를 불러오는 중 오류가 발생했습니다.' },
        { status: 500 }
      );
    }

    // 가시성 투표 계산
    const visibilityVotes = signatures.map(sig => sig.visibility_vote);
    const publicVotes = visibilityVotes.filter(vote => vote === true).length;
    const privateVotes = visibilityVotes.filter(vote => vote === false).length;
    
    // 공개 투표가 비공개 투표보다 많아야만 공개 (같거나 적으면 비공개)
    const isPublic = publicVotes > privateVotes;
    console.log(`서명 공개 상태: ${isPublic ? '공개' : '비공개'} (공개: ${publicVotes}, 비공개: ${privateVotes})`);

    // 서명 정보 처리
    const processedSignatures = signatures.map(signature => {
      // 사용자 이름 설정
      const userName = (signature.profiles && Array.isArray(signature.profiles) && signature.profiles.length > 0) 
      ? signature.profiles[0].name 
      : '사용자';      
      // 기본 서명 정보 (항상 포함됨)
      const baseSignature = {
        id: signature.id,
        post_id: signature.post_id,
        user_id: signature.user_id,
        created_at: signature.created_at,
        visibility_vote: signature.visibility_vote,
      };
      
      // 비공개인 경우, 민감한 정보 마스킹 처리
      if (!isPublic) {
        return {
          ...baseSignature,
          user_name: userName, // 사용자 이름은 항상 표시
          user_type: signature.user_type, // 사용자 유형은 항상 표시
          vote_type: null, // 찬성/반대 여부 마스킹
          signature_data: null, // 서명 데이터 마스킹
          store_info: { 
            // 매장 기본 정보만 표시
            store_name: typeof signature.store_info === 'string' 
              ? JSON.parse(signature.store_info).store_name 
              : signature.store_info?.store_name || '비공개 매장',
            // 기타 상세 정보 제거
            floor: null,
            unit_number: null
          },
          is_masked: true // 마스킹 여부 표시
        };
      }
      
      // 공개인 경우 모든 정보 포함
      return {
        ...baseSignature,
        user_name: userName,
        user_type: signature.user_type,
        vote_type: signature.vote_type,
        signature_data: signature.signature_data,
        store_info: signature.store_info,
        is_masked: false
      };
    });

    // 투표 요약 정보도 같이 반환 (프론트엔드에서 활용)
    const votingSummary = {
      totalSignatures: signatures.length,
      publicVotes,
      privateVotes,
      totalVotes: publicVotes + privateVotes,
      isPublic
    };

    return NextResponse.json({
      signatures: processedSignatures,
      votingSummary
    });
  } catch (err) {
    console.error('API 오류:', err);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 서명 테이블 생성에 실패해도 UI가 정상 작동하도록 더미 성공 응답 생성
function createDummySuccessResponse() {
  console.log('더미 성공 응답 생성');
  return NextResponse.json({ 
    success: true, 
    message: '서버 설정 문제로 실제 서명은 저장되지 않았지만, UI 테스트를 위해 성공으로 처리합니다.',
    id: '00000000-0000-0000-0000-000000000001',
    dummy: true
  });
}