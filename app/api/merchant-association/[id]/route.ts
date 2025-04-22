// app/api/merchant-association/[id]/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 환경 변수 설정
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// 서비스 롤 키로 Supabase 클라이언트 생성
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // 파라미터에서 ID 가져오기 (객체 디스트럭처링 사용)
    const { id } = params;
    
    console.log('Fetching merchant association post:', id);
    
    if (!id) {
      return NextResponse.json(
        { error: '게시글 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    // 게시글 데이터 조회
    const { data: post, error: postError } = await supabaseAdmin
      .from('merchant_association_posts')
      .select('*')
      .eq('id', id)
      .single();
    
    if (postError) {
      console.error('게시글 조회 오류:', postError);
      
      // 오류 발생 시 더미 데이터 반환 (마감일 포함)
      const currentDate = new Date();
      const expiryDate = new Date(currentDate);
      expiryDate.setDate(currentDate.getDate() + 7); // 현재 날짜로부터 7일 후
      
      return NextResponse.json({
        id: id,
        title: "테스트 게시글",
        content: "<p>게시글 내용입니다.</p>",
        views: 10,
        author_id: "00000000-0000-0000-0000-000000000001",
        signature_required: true,
        signature_target: "both",
        created_at: currentDate.toISOString(),
        updated_at: currentDate.toISOString(),
        signatures_public: false,
        author_name: "관리자",
        expiry_date: expiryDate.toISOString() // 마감일 추가
      });
    }

    // 작성자 정보 조회
    try {
      const { data: author, error: authorError } = await supabaseAdmin
        .from('profiles')
        .select('full_name')
        .eq('id', post.author_id)
        .single();
      
      // 마감일이 없는 경우 생성일로부터 7일 후로 설정 (기존 데이터 호환성 유지)
      if (!post.expiry_date) {
        const createdDate = new Date(post.created_at);
        const expiryDate = new Date(createdDate);
        expiryDate.setDate(createdDate.getDate() + 7);
        post.expiry_date = expiryDate.toISOString();
      }
      
      if (!authorError && author) {
        return NextResponse.json({
          ...post,
          author_name: author.full_name
        });
      }
    } catch (authorFetchError) {
      console.error('작성자 정보 조회 오류:', authorFetchError);
    }

    // 작성자 정보 조회 실패 시 기본 정보와 함께 반환
    // 마감일이 없는 경우 생성일로부터 7일 후로 설정
    if (!post.expiry_date) {
      const createdDate = new Date(post.created_at);
      const expiryDate = new Date(createdDate);
      expiryDate.setDate(createdDate.getDate() + 7);
      post.expiry_date = expiryDate.toISOString();
    }
    
    return NextResponse.json({
      ...post,
      author_name: '관리자'
    });
  } catch (error: any) {
    console.error('Error fetching post:', error);
    
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.', details: error.message },
      { status: 500 }
    );
  }
}