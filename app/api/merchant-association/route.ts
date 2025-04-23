// app/api/merchant-association/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  try {
    // 환경 변수 확인
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Supabase 환경 변수 누락');
      return NextResponse.json(
        { error: 'Supabase 환경 설정이 누락되었습니다.' },
        { status: 500 }
      );
    }

    // 서비스 롤 키로 Supabase 클라이언트 생성 (모든 권한 허용)
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    console.log('Fetching merchant association posts - 서비스 키 사용');

    try {
      // 테이블 존재 여부 확인
      const { data: tableCheck, error: tableCheckError } = await supabaseAdmin.rpc('table_exists', { table_name: 'merchant_association_posts' });
      
      if (tableCheckError) {
        console.log('테이블 확인 실패, 더미 데이터 반환:', tableCheckError);
        return NextResponse.json([getDummyPost()]);
      }
      
      if (!tableCheck) {
        console.log('테이블이 존재하지 않음, 더미 데이터 반환');
        return NextResponse.json([getDummyPost()]);
      }
    } catch (rpcError) {
      console.error('RPC error:', rpcError);
      // RPC 함수가 없을 수 있으므로 무시하고 계속 진행
    }

    // 게시글 직접 쿼리 시도 - expiry_date 필드 추가
    const { data: posts, error } = await supabaseAdmin
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
        updated_at,
        signatures_public,
        expiry_date
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching posts, returning dummy data:', error);
      return NextResponse.json([getDummyPost()]);
    }

    // 빈 결과면 더미 데이터 반환
    if (!posts || posts.length === 0) {
      return NextResponse.json([getDummyPost()]);
    }

    // 작성자 정보 추가
    const postsWithAuthor = [...posts];
    
    try {
      if (postsWithAuthor.length > 0) {
        // 고유한 작성자 ID 목록
        const authorIds = [...new Set(postsWithAuthor.map(post => post.author_id))];
        
        // 작성자 정보 조회
        const { data: authors, error: authorsError } = await supabaseAdmin
          .from('profiles')
          .select('id, full_name')
          .in('id', authorIds);
        
        if (!authorsError && authors) {
          // 작성자 정보 매핑
          const authorsMap = new Map(authors.map(author => [author.id, author.full_name]));
          
          // 게시글에 작성자 이름 추가
          postsWithAuthor.forEach((post: any) => {
            post.author_name = authorsMap.get(post.author_id) || '관리자';
          });
        }
      }
    } catch (authorError) {
      console.error('Author mapping error:', authorError);
      // 작성자 정보 조회 실패해도 계속 진행
    }

    return NextResponse.json(postsWithAuthor);
  } catch (err: any) {
    console.error('Merchant association posts API error:', err);
    // 오류 발생 시 더미 데이터로 대체
    return NextResponse.json([getDummyPost()], { status: 200 });
  }
}

// 더미 게시글 데이터 - expiry_date 필드 추가
function getDummyPost() {
  // 현재 날짜로부터 7일 후를 만기일로 설정
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + 7);
  
  return {
    id: '00000000-0000-0000-0000-000000000000',
    title: '샘플 게시글',
    content: '아직 게시글이 없습니다. 첫 번째 게시글을 작성해보세요!',
    views: 0,
    author_id: 'admin',
    signature_required: false,
    signature_target: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    expiry_date: expiryDate.toISOString(),
    signatures_public: false,
    author_name: '관리자'
  };
}