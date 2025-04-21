// app/api/profile/update/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// 서비스 롤 키로 Supabase 클라이언트 생성
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    const { userId, fullName, phoneNumber } = await request.json();

    if (!userId || !fullName) {
      return NextResponse.json(
        { error: '필수 정보가 누락되었습니다.' },
        { status: 400 }
      );
    }

    console.log('Updating profile for user:', userId);

    // 서비스 롤 키로 프로필 정보 업데이트 (이름만 업데이트)
    const { error } = await supabaseAdmin
      .from('profiles')
      .update({
        full_name: fullName,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (error) {
      console.error('Profile update error:', error);
      return NextResponse.json(
        { error: '프로필 정보 업데이트 중 오류가 발생했습니다.', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, message: '프로필이 성공적으로 업데이트되었습니다.' }
    );
  } catch (err: any) {
    console.error('Profile update API error:', err);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.', details: err.message },
      { status: 500 }
    );
  }
}