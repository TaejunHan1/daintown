// app/api/admin/users/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// 서비스 롤 키로 Supabase 클라이언트 생성
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: NextRequest) {
  try {
    console.log('Fetching user list');

    // 서비스 롤 키로 모든 프로필 정보 조회
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Users fetch error:', error);
      return NextResponse.json(
        { error: '사용자 목록 조회 중 오류가 발생했습니다.', details: error.message },
        { status: 500 }
      );
    }

    // 이메일 정보는 auth에서 가져와야 하지만 실제 구현에서는 복잡해서 생략
    // 실제 구현 시에는 auth.users에서 이메일 정보를 가져와서 병합해야 함
    return NextResponse.json(data);
  } catch (err: any) {
    console.error('Users API error:', err);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.', details: err.message },
      { status: 500 }
    );
  }
}