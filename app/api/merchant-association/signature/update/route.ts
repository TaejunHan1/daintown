// app/api/merchant-association/signature/update/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// 서비스 롤 키로 Supabase 클라이언트 생성
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    console.log('서명 수정 API 호출 시작');
    
    // 요청 데이터 파싱
    const requestData = await request.json();
    console.log('요청 받은 데이터:', requestData);
    
    const { postId, userId, signatureData, userType, voteType, storeId, signatureId } = requestData;

    // 필수 데이터 확인
    if (!postId || !userId || !signatureData || !userType || !storeId || !signatureId) {
      console.error('필수 필드 누락:', { postId, userId, userType, storeId, signatureId });
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

    // 기존 서명이 존재하는지 확인
    const { data: existingSignature, error: signatureCheckError } = await supabaseAdmin
      .from('merchant_association_signatures')
      .select('id')
      .eq('id', signatureId)
      .eq('user_id', userId)
      .maybeSingle();

    if (signatureCheckError) {
      console.error('기존 서명 확인 오류:', signatureCheckError);
      return NextResponse.json(
        { error: '서명 확인 중 오류가 발생했습니다.', details: signatureCheckError.message },
        { status: 500 }
      );
    } else if (!existingSignature) {
      return NextResponse.json(
        { error: '수정할 서명을 찾을 수 없습니다.' },
        { status: 404 }
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
    } : { 
      store_id: storeId,
      store_name: `${userType === 'landlord' ? '임대인' : '임차인'} 매장`,
      floor: '',
      unit_number: ''
    };

    // 서명 업데이트
    try {
      console.log('서명 업데이트 시도');
      const { data: signature, error: signatureError } = await supabaseAdmin
        .from('merchant_association_signatures')
        .update({
          signature_data: signatureData,
          user_type: userType,
          vote_type: voteType || null,
          store_info: storeInfo
        })
        .eq('id', signatureId)
        .select('id')
        .single();

      if (signatureError) {
        console.error('서명 업데이트 오류:', signatureError);
        return NextResponse.json(
          { error: '서명 업데이트 중 오류가 발생했습니다.', details: signatureError.message },
          { status: 500 }
        );
      }

      console.log('서명 업데이트 성공:', signature?.id);
      return NextResponse.json({ 
        success: true, 
        message: '서명이 성공적으로 업데이트되었습니다.',
        id: signature?.id
      });
    } catch (updatingError) {
      console.error('서명 업데이트 중 예외 발생:', updatingError);
      return NextResponse.json(
        { error: '서명 업데이트 중 오류가 발생했습니다.' },
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