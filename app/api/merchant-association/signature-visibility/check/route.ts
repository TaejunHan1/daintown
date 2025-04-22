// app/api/merchant-association/signature-visibility/check/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// 서비스 롤 키로 Supabase 클라이언트 생성
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const postId = searchParams.get('postId');
    const storeId = searchParams.get('storeId'); // 사용하지 않지만 기존 API 호환성 유지

    if (!userId || !postId) {
      return NextResponse.json(
        { error: '필수 파라미터가 누락되었습니다.' },
        { status: 400 }
      );
    }

    // 사용자의 서명 및 투표 상태 확인
    try {
      const { data: signatureData, error: signatureError } = await supabaseAdmin
        .from('merchant_association_signatures')
        .select('visibility_vote')
        .eq('post_id', postId)
        .eq('user_id', userId)
        .maybeSingle();
      
      if (signatureError) {
        console.error('서명 확인 중 오류 발생:', signatureError);
        
        // 더미 데이터 반환
        return NextResponse.json({
          hasVoted: false,
          voteForPublic: null
        });
      }
      
      if (signatureData && signatureData.visibility_vote !== null) {
        return NextResponse.json({
          hasVoted: true,
          voteForPublic: signatureData.visibility_vote
        });
      } else {
        return NextResponse.json({
          hasVoted: false,
          voteForPublic: null
        });
      }
    } catch (error) {
      console.error('투표 상태 확인 중 예외 발생:', error);
      
      // 오류 발생 시 기본 응답
      return NextResponse.json({
        hasVoted: false,
        voteForPublic: null
      });
    }
  } catch (err: any) {
    console.error('API 오류:', err);
    
    // 오류 발생 시 기본 응답
    return NextResponse.json({
      hasVoted: false,
      voteForPublic: null
    });
  }
}