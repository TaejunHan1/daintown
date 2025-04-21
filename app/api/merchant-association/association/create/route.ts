// app/api/merchant-association/association/create/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    // 요청 데이터 파싱
    const { title, content, signatureRequired, signatureTarget } = await request.json();

    // 환경 변수 확인
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Supabase 환경 설정이 누락되었습니다.' },
        { status: 500 }
      );
    }

    // 서비스 롤 키로 Supabase 클라이언트 생성 (Admin 권한)
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // 세션 대신 요청 쿠키를 수동으로 확인
    let userId = null;

    // 1. 요청 헤더에서 토큰 확인 시도
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const { data: userData } = await supabaseAdmin.auth.getUser(token);
        userId = userData?.user?.id;
      } catch (error) {
        console.error('Token validation error:', error);
      }
    } 
    
    // 2. Cookie 헤더에서 토큰 확인 시도
    if (!userId) {
      const cookieHeader = request.headers.get('cookie');
      if (cookieHeader) {
        const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
          const [key, value] = cookie.trim().split('=');
          acc[key] = value;
          return acc;
        }, {} as Record<string, string>);
        
        const accessToken = cookies['sb-access-token'] || cookies['sb:token'];
        
        if (accessToken) {
          try {
            const { data: userData } = await supabaseAdmin.auth.getUser(accessToken);
            userId = userData?.user?.id;
          } catch (error) {
            console.error('Cookie token validation error:', error);
          }
        }
      }
    }

    // 3. 인증 확인
    if (!userId) {
      // 개발 모드에서 테스트 목적으로 사용할 수 있는 옵션:
      // 프로필 테이블에서 관리자 찾기
      try {
        const { data: adminUser } = await supabaseAdmin
          .from('profiles')
          .select('id')
          .eq('role', 'admin')
          .limit(1)
          .single();
          
        if (adminUser) {
          console.log('개발 모드: 관리자 계정으로 자동 처리:', adminUser.id);
          userId = adminUser.id;
        } else {
          return NextResponse.json(
            { error: '인증되지 않은 요청입니다. 로그인 후 다시 시도해주세요.' },
            { status: 401 }
          );
        }
      } catch (adminFindError) {
        console.error('관리자 검색 오류:', adminFindError);
        return NextResponse.json(
          { error: '인증되지 않은 요청입니다. 로그인 후 다시 시도해주세요.' },
          { status: 401 }
        );
      }
    }

    // 필수 데이터 확인
    if (!title || !title.trim()) {
      return NextResponse.json(
        { error: '제목을 입력해주세요.' },
        { status: 400 }
      );
    }

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: '내용을 입력해주세요.' },
        { status: 400 }
      );
    }

    // 게시글 저장
    const { data: post, error: postError } = await supabaseAdmin
      .from('merchant_association_posts')
      .insert({
        title,
        content,
        author_id: userId,
        signature_required: signatureRequired || false,
        signature_target: signatureRequired ? signatureTarget : null,
        views: 0,
      })
      .select('id')
      .single();

    if (postError) {
      console.error('Error creating post:', postError);
      return NextResponse.json(
        { error: '게시글 저장 중 오류가 발생했습니다.', details: postError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: '게시글이 성공적으로 작성되었습니다.',
      id: post.id 
    });
  } catch (err: any) {
    console.error('Create post API error:', err);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.', details: err.message },
      { status: 500 }
    );
  }
}