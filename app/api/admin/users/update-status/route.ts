// app/api/admin/users/update-status/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// 서비스 롤 키로 Supabase 클라이언트 생성
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    const { userId, status } = await request.json();

    if (!userId || !status) {
      return NextResponse.json(
        { error: '사용자 ID와 상태 정보가 필요합니다.' },
        { status: 400 }
      );
    }

    // 유효한 상태 값인지 확인
    if (!['approved', 'pending', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: '유효하지 않은 상태값입니다.' },
        { status: 400 }
      );
    }

    console.log(`Updating user ${userId} status to ${status}`);

    // 서비스 롤 키로 프로필 상태 업데이트
    const { error } = await supabaseAdmin
      .from('profiles')
      .update({ 
        status, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', userId);

    if (error) {
      console.error('Status update error:', error);
      return NextResponse.json(
        { error: '사용자 상태 업데이트 중 오류가 발생했습니다.', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, message: '사용자 상태가 성공적으로 업데이트되었습니다.' }
    );
  } catch (err: any) {
    console.error('Update status API error:', err);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.', details: err.message },
      { status: 500 }
    );
  }
}