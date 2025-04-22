// app/api/merchant-association/signature-visibility/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// 서비스 롤 키로 Supabase 클라이언트 생성
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


export async function POST(request: NextRequest) {
  try {
    // 요청 데이터 파싱
    const requestData = await request.json();
    console.log('서명 공개 여부 투표 요청 데이터:', requestData);
    
    const { postId, userId, storeId, voteForPublic } = requestData;

    // 필수 데이터 확인
    if (!postId || !userId || !storeId || voteForPublic === undefined) {
      return NextResponse.json(
        { error: '필수 정보가 누락되었습니다.' },
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

    // 마감된 게시글 확인
    if (post.expiry_date && new Date() > new Date(post.expiry_date)) {
      return NextResponse.json(
        { error: '마감된 게시글에는 투표할 수 없습니다.' },
        { status: 400 }
      );
    }

    // 사용자가 서명했는지 확인
    const { data: userSignature, error: signatureError } = await supabaseAdmin
      .from('merchant_association_signatures')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .single();

    if (signatureError) {
      console.error('서명 조회 오류:', signatureError);
      return NextResponse.json(
        { error: '서명 후에만 투표할 수 있습니다.' },
        { status: 400 }
      );
    }

    // 이미 투표했는지 확인
    const { data: existingVote, error: voteCheckError } = await supabaseAdmin
      .from('merchant_association_signatures')
      .select('visibility_vote')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .single();

    if (voteCheckError) {
      console.error('투표 확인 오류:', voteCheckError);
    } else if (existingVote && existingVote.visibility_vote !== null) {
      return NextResponse.json(
        { 
          error: '이미 투표하셨습니다. 투표는 수정할 수 없습니다.',
          alreadyVoted: true,
          currentVote: existingVote.visibility_vote
        },
        { status: 400 }
      );
    }

    // 투표 저장
    const { data: updatedSignature, error: updateError } = await supabaseAdmin
      .from('merchant_association_signatures')
      .update({
        visibility_vote: voteForPublic
      })
      .eq('post_id', postId)
      .eq('user_id', userId)
      .select('id, visibility_vote')
      .single();

    if (updateError) {
      console.error('투표 저장 오류:', updateError);
      return NextResponse.json(
        { error: '투표 저장 중 오류가 발생했습니다.', details: updateError.message },
        { status: 500 }
      );
    }

    // 현재 투표 상황 집계
    const { data: voteResults, error: resultsError } = await supabaseAdmin
      .from('merchant_association_signatures')
      .select('visibility_vote')
      .eq('post_id', postId);

    let publicVotes = 0;
    let privateVotes = 0;
    let totalVotes = 0;

    if (!resultsError && voteResults) {
      publicVotes = voteResults.filter(vote => vote.visibility_vote === true).length;
      privateVotes = voteResults.filter(vote => vote.visibility_vote === false).length;
      totalVotes = voteResults.filter(vote => vote.visibility_vote !== null).length;
    }

    // 공개 투표가 비공개 투표보다 많아야만 공개로 설정됨
    const isPublic = publicVotes > privateVotes;

    return NextResponse.json({
      success: true,
      message: `서명 공개 여부 투표가 성공적으로 저장되었습니다. ${voteForPublic ? '공개' : '비공개'}에 투표하셨습니다.`,
      voteStatus: {
        publicVotes,
        privateVotes,
        totalVotes,
        isPublic,
        // 동점일 경우 비공개 처리 메시지
        tieMessage: publicVotes === privateVotes ? '현재 공개/비공개 투표가 동일하여 비공개로 처리됩니다.' : null
      }
    });
    
  } catch (err: any) {
    console.error('서명 공개 여부 투표 API 오류:', err);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.', details: err.message },
      { status: 500 }
    );
  }
}

// 사용자 투표 상태 확인 API
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    const postId = url.searchParams.get('postId');
    const storeId = url.searchParams.get('storeId');

    if (!userId || !postId || !storeId) {
      return NextResponse.json(
        { error: '필수 파라미터가 누락되었습니다.' },
        { status: 400 }
      );
    }

    // 사용자의 투표 상태 조회
    const { data: voteData, error: voteError } = await supabaseAdmin
      .from('merchant_association_signatures')
      .select('visibility_vote')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .eq('store_id', storeId)
      .single();

    if (voteError) {
      console.error('투표 상태 조회 오류:', voteError);
      // 투표 데이터가 없으면 투표하지 않은 것으로 처리
      return NextResponse.json({
        hasVoted: false,
        voteForPublic: null
      });
    }

    return NextResponse.json({
      hasVoted: voteData.visibility_vote !== null,
      voteForPublic: voteData.visibility_vote
    });
    
  } catch (err: any) {
    console.error('투표 상태 확인 API 오류:', err);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.', details: err.message },
      { status: 500 }
    );
  }
}