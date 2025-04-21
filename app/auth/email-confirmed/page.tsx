// app/auth/email-confirmed/page.tsx
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import supabase from '@/lib/supabase';

export default function EmailConfirmed() {
  const router = useRouter();

  // 인증 상태 확인
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      // 세션이 있으면 로그아웃 (새로 로그인하도록)
      if (session) {
        await supabase.auth.signOut();
      }
    };
    
    checkAuth();
  }, []);

  return (
    <div className="min-h-screen bg-[#F8F9FA] py-12">
      <div className="container-custom mx-auto px-4">
        <div className="max-w-md mx-auto">
          <div className="toss-card text-center p-8">
            <div className="text-[#0F6FFF] mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-[#333] mb-4">이메일 인증 완료</h2>
            <div className="text-[#666] mb-8">
              <p className="mb-4">
                이메일 인증이 성공적으로 완료되었습니다.
              </p>
              <div className="bg-[#F5F9FF] border border-[#DFEDFF] text-[#0F6FFF] p-4 rounded-xl mb-6 text-sm">
                <p className="font-medium mb-2">✓ 다음 단계</p>
                <ol className="text-left pl-5 list-decimal">
                  <li className="mb-1">관리자 승인 대기 중입니다</li>
                  <li>승인이 완료되면 로그인이 가능합니다</li>
                </ol>
              </div>
            </div>
            <Link href="/auth/login" className="btn-primary inline-block">
              로그인 페이지로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}