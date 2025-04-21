// app/api/merchant-association/[id]/signatures/route.ts
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

    console.log(`Fetching signatures for post: ${id}`);

    // 더미 ID인 경우 빈 배열 반환
    if (id === '00000000-0000-0000-0000-000000000000') {
      return NextResponse.json([]);
    }

    // 테이블 확인
    const { error: tableCheckError } = await supabaseAdmin
      .from('merchant_association_signatures')
      .select('id')
      .limit(1);

    if (tableCheckError) {
      // 테이블이 없는 경우
      if (tableCheckError.code === '42P01') {
        console.log('Signatures table does not exist, returning empty array');
        return NextResponse.json([]);
      }
      
      console.error('Table check error:', tableCheckError);
      return NextResponse.json(
        { error: '서명 테이블 확인 중 오류가 발생했습니다.', details: tableCheckError.message },
        { status: 500 }
      );
    }

    // 서비스 롤 키로 서명 정보 조회
    const { data: signatures, error } = await supabaseAdmin
      .from('merchant_association_signatures')
      .select(`
        id,
        post_id,
        user_id,
        signature_data,
        user_type,
        vote_type,
        created_at
      `)
      .eq('post_id', id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching signatures:', error);
      return NextResponse.json(
        { error: '서명 목록 조회 중 오류가 발생했습니다.', details: error.message },
        { status: 500 }
      );
    }

    // 서명이 없는 경우 빈 배열 반환
    if (!signatures || signatures.length === 0) {
      return NextResponse.json([]);
    }

    // 서명한 사용자 정보 추가
    const signaturesWithUsers = [...signatures];
    
    // 고유한 사용자 ID 목록
    const userIds = [...new Set(signaturesWithUsers.map(sig => sig.user_id))];
    
    // 사용자 정보 조회
    const { data: users, error: usersError } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name')
      .in('id', userIds);
    
    if (!usersError && users) {
      // 사용자 정보 매핑
      const usersMap = new Map(users.map(user => [user.id, user.full_name]));
      
      // 서명에 사용자 이름 추가
      signaturesWithUsers.forEach((signature: any) => {
        signature.user_name = usersMap.get(signature.user_id) || '사용자';
      });
    }

    return NextResponse.json(signaturesWithUsers);
  } catch (err: any) {
    console.error('Signatures API error:', err);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.', details: err.message },
      { status: 500 }
    );
  }
}