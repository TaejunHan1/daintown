// app/components/layout/Header.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import supabase from '@/lib/supabase';

const Header = () => {
  const [user, setUser] = useState<any>(null);
  const [showFloorMenu, setShowFloorMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showMobileFloorMenu, setShowMobileFloorMenu] = useState(false);
  const floorMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    // 현재 로그인한 사용자 정보 가져오기
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session) {
          setUser(session.user);
        } else {
          setUser(null);
        }
      }
    );

    // Initial session check
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    };
    
    checkUser();

    // Cleanup subscription on unmount
    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // 로그아웃 핸들러
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
    setMobileMenuOpen(false);
  };

  // 클릭 외부에서 메뉴 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (floorMenuRef.current && !floorMenuRef.current.contains(event.target as Node)) {
        setShowFloorMenu(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node) && 
          (event.target as HTMLElement).id !== 'mobile-menu-button') {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // 층별 메뉴
  const floors = [
    { id: 'b1', name: '지하 1층' },
    { id: '1f', name: '1층' },
    { id: '2f', name: '2층' },
    { id: '3f', name: '3층' },
    { id: '4f', name: '4층' },
    { id: '5f', name: '5층' },
    { id: '6f', name: '6층' },
    { id: '7f', name: '7층' },
    { id: '8f', name: '8층' },
    { id: '9f', name: '9층' },
  ];

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
    setShowMobileFloorMenu(false);
  };

  const toggleMobileFloorMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowMobileFloorMenu(!showMobileFloorMenu);
  };

  return (
    <header className="bg-white shadow-sm border-b border-[#f2f2f2]">
      <div className="container-custom mx-auto">
        <div className="flex justify-between items-center py-4">
          {/* 로고 */}
          <Link href="/" className="text-2xl font-bold text-[#0F6FFF] z-10">
            다인타운
          </Link>

          {/* 모바일 메뉴 버튼 */}
          <div className="md:hidden">
            <button
              id="mobile-menu-button"
              className="text-[#333] hover:text-[#0F6FFF] focus:outline-none p-2"
              onClick={toggleMobileMenu}
              aria-label="메뉴 열기/닫기"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {mobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>

          {/* 데스크톱 메뉴 아이템 */}
          <nav className="hidden md:flex items-center space-x-1">
            {/* 상가정보 드롭다운 */}
            <div className="relative" ref={floorMenuRef}>
              <button
                className="nav-link flex items-center"
                onMouseEnter={() => setShowFloorMenu(true)}
              >
                상가정보
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 ml-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {/* 드롭다운 메뉴 */}
              {showFloorMenu && (
                <div
                  className="absolute left-0 mt-2 w-40 bg-white rounded-xl shadow-toss z-10 overflow-hidden"
                  onMouseLeave={() => setShowFloorMenu(false)}
                >
                  <div className="py-1">
                    {floors.map((floor) => (
                      <Link
                        key={floor.id}
                        href={`/stores/${floor.id}`}
                        className="block px-4 py-2 text-sm text-[#333] hover:bg-[#F8F9FA] hover:text-[#0F6FFF]"
                      >
                        {floor.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Link href="/parking" className="nav-link">
              주차정보
            </Link>
            <Link href="/feedback" className="nav-link">
              고객의소리
            </Link>
            <Link href="/building" className="nav-link">
              건물 정보
            </Link>
            <Link href="/merchant-association" className="nav-link">
              상가번영회
            </Link>
          </nav>

          {/* 데스크톱 로그인/회원가입 버튼 */}
          <div className="hidden md:flex items-center space-x-2">
            {user ? (
              <div className="flex items-center space-x-2">
                <Link href="/profile" className="nav-link">
                  내 정보
                </Link>
                <button 
                  onClick={handleLogout} 
                  className="px-4 py-2 bg-[#F8F9FA] text-[#333] rounded-xl text-sm font-medium hover:bg-[#F0F1F2]"
                >
                  로그아웃
                </button>
              </div>
            ) : (
              <Link 
                href="/auth/login" 
                className="px-4 py-2 bg-[#0F6FFF] text-white rounded-xl text-sm font-medium hover:bg-[#0051D4]"
              >
                로그인
              </Link>
            )}
          </div>

          {/* 모바일 메뉴 (슬라이드 다운) */}
          {mobileMenuOpen && (
            <div 
              ref={mobileMenuRef}
              className="absolute top-16 left-0 right-0 bg-white shadow-md z-50 border-t border-[#f2f2f2] md:hidden"
            >
              <div className="px-4 py-3">
                {/* 모바일 메뉴 항목 */}
                <div className="space-y-1">
                  {/* 상가정보 드롭다운 */}
                  <div className="py-1 border-b border-[#f2f2f2]">
                    <button
                      onClick={toggleMobileFloorMenu}
                      className="flex justify-between items-center w-full py-3 text-[#333]"
                    >
                      <span className="font-medium">상가정보</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className={`h-4 w-4 transition-transform ${
                          showMobileFloorMenu ? 'transform rotate-180' : ''
                        }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>
                    {showMobileFloorMenu && (
                      <div className="pl-4 py-2 space-y-2 bg-[#F8F9FA] rounded-xl my-2">
                        {floors.map((floor) => (
                          <Link
                            key={floor.id}
                            href={`/stores/${floor.id}`}
                            className="block py-2 text-[#666] hover:text-[#0F6FFF]"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            {floor.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>

                  <Link
                    href="/parking"
                    className="block py-3 text-[#333] border-b border-[#f2f2f2] font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    주차정보
                  </Link>
                  <Link
                    href="/feedback"
                    className="block py-3 text-[#333] border-b border-[#f2f2f2] font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    고객의소리
                  </Link>
                  <Link
                    href="/building"
                    className="block py-3 text-[#333] border-b border-[#f2f2f2] font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    건물 정보
                  </Link>
                  <Link
                    href="/merchant-association"
                    className="block py-3 text-[#333] border-b border-[#f2f2f2] font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    상가번영회
                  </Link>
                </div>

                {/* 모바일 로그인/회원가입 버튼 */}
                <div className="mt-4 space-y-3">
                  {user ? (
                    <div className="space-y-3">
                      <Link
                        href="/profile"
                        className="block w-full py-3 text-center text-[#333] bg-[#F8F9FA] rounded-xl font-medium"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        내 정보
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="block w-full py-3 text-center text-[#333] bg-[#F8F9FA] rounded-xl font-medium"
                      >
                        로그아웃
                      </button>
                    </div>
                  ) : (
                    <Link
                      href="/auth/login"
                      className="block w-full py-3 text-center text-white bg-[#0F6FFF] rounded-xl font-medium"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      로그인
                    </Link>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;