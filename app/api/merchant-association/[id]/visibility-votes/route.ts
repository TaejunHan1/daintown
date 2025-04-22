// app/api/merchant-association/[id]/visibility-votes/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// 서비스 롤 키로 Supabase 클라이언트 생성
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // 객체 구조 분해로 id 가져오기
    const { id } = params;
    
    console.log('Fetching visibility votes for post:', id);
    
    if (!id) {
      return NextResponse.json(
        { error: '게시글 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    // 게시글에 대한 서명 총 개수 조회
    const { count: totalSignatures, error: signaturesError } = await supabaseAdmin
      .from('merchant_association_signatures')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', id);
    
    if (signaturesError) {
      console.error('서명 개수 조회 오류:', signaturesError);
      return NextResponse.json(
        { error: '서명 개수 조회 중 오류가 발생했습니다.', details: signaturesError.message },
        { status: 500 }
      );
    }

    // 서명 테이블에서 공개 투표 및 비공개 투표 개수 조회
    const { data: votesData, error: votesError } = await supabaseAdmin
      .from('merchant_association_signatures')
      .select('visibility_vote')
      .eq('post_id', id)
      .not('visibility_vote', 'is', null);
    
    if (votesError) {
      console.error('투표 조회 오류:', votesError);
      return NextResponse.json(
        { error: '투표 조회 중 오류가 발생했습니다.', details: votesError.message },
        { status: 500 }
      );
    }
    
    // 투표 결과 집계 - 안전하게 null 체크
    const publicVotes = (votesData || []).filter(vote => vote?.visibility_vote === true).length;
    const privateVotes = (votesData || []).filter(vote => vote?.visibility_vote === false).length;
    const totalVotes = (votesData || []).length;

    // 결과 데이터 생성 - null 값을 0으로 처리하여 undefined 방지
    const result = {
      totalSignatures: totalSignatures || 0,
      publicVotes: publicVotes || 0,
      privateVotes: privateVotes || 0,
      totalVotes: totalVotes || 0
    };
    
    console.log('투표 현황 결과:', result);
    
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error fetching visibility votes:', error);
    
    // 오류 발생 시에도 기본값 제공 (undefined 방지)
    return NextResponse.json({
      totalSignatures: 0,
      publicVotes: 0,
      privateVotes: 0,
      totalVotes: 0,
      error: error.message
    });
  }
}