// app/api/merchant-association/view/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// 서비스 롤 키로 Supabase 클라이언트 생성
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    // 요청 데이터 파싱
    const { postId } = await request.json();

    if (!postId) {
      return NextResponse.json(
        { error: '게시글 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    // 인증 요구 제거 (401 에러 해결을 위해)
    // 사용자 세션 확인하지 않고 조회수만 증가

    // 현재 조회수 가져오기
    const { data: post, error: postError } = await supabaseAdmin
      .from('merchant_association_posts')
      .select('views')
      .eq('id', postId)
      .single();

    if (postError) {
      console.error('Error fetching post views:', postError);
      return NextResponse.json(
        { error: '게시글을 찾을 수 없습니다.', details: postError.message },
        { status: 404 }
      );
    }

    // 조회수 증가
    const { error: updateError } = await supabaseAdmin
      .from('merchant_association_posts')
      .update({ 
        views: (post.views || 0) + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', postId);

    if (updateError) {
      console.error('Error updating post views:', updateError);
      return NextResponse.json(
        { error: '조회수 업데이트 중 오류가 발생했습니다.', details: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true,
      views: (post.views || 0) + 1
    });
  } catch (err: any) {
    console.error('View count API error:', err);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.', details: err.message },
      { status: 500 }
    );
  }
}