// app/api/merchant-association/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    // 환경 변수 확인
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Supabase 환경 설정이 누락되었습니다.' },
        { status: 500 }
      );
    }

    // 서비스 롤 키로 Supabase 클라이언트 생성
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    console.log(`Fetching merchant association post: ${id}`);

    // 더미 ID인 경우 더미 데이터 반환
    if (id === '00000000-0000-0000-0000-000000000000') {
      const dummyPost = {
        id: '00000000-0000-0000-0000-000000000000',
        title: '공지사항 예시',
        content: '아직 게시글이 없습니다. 첫 번째 게시글을 작성해보세요!',
        views: 0,
        author_id: 'admin',
        signature_required: false,
        signature_target: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        author_name: '관리자'
      };
      return NextResponse.json(dummyPost);
    }

    // 서비스 롤 키로 게시글 정보 조회
    const { data: post, error } = await supabaseAdmin
      .from('merchant_association_posts')
      .select(`
        id,
        title,
        content,
        views,
        author_id,
        signature_required,
        signature_target,
        created_at,
        updated_at
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching post:', error);
      return NextResponse.json(
        { error: '게시글 조회 중 오류가 발생했습니다.', details: error.message },
        { status: 500 }
      );
    }

    if (!post) {
      return NextResponse.json(
        { error: '게시글을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // post 객체 복사하여 author_name 추가할 준비
    const postWithAuthor: any = { ...post };

    // 작성자 정보 조회
    if (post.author_id) {
      const { data: author, error: authorError } = await supabaseAdmin
        .from('profiles')
        .select('full_name')
        .eq('id', post.author_id)
        .single();
        
      if (!authorError && author) {
        postWithAuthor.author_name = author.full_name;
      } else {
        postWithAuthor.author_name = '관리자';
      }
    }

    // 줄바꿈 문자를 <br> 태그로 변환하여 내용 전달
    postWithAuthor.content = postWithAuthor.content
      .replace(/\r\n/g, '<br>')
      .replace(/\n/g, '<br>');

    return NextResponse.json(postWithAuthor);
  } catch (err: any) {
    console.error('Merchant association post detail API error:', err);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.', details: err.message },
      { status: 500 }
    );
  }
}