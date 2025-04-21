// components/layout/Footer.tsx
import React from 'react';
import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-[#f2f2f2] py-10">
      <div className="container-custom mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* 회사 정보 */}
          <div>
            <h3 className="text-xl font-bold text-[#333] mb-4">다인타운</h3>
            <div className="space-y-2 text-[#666]">
              <p className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-[#999] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                서울특별시 강남구 역삼동 123-45
              </p>
              <p className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-[#999] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                02-123-4567
              </p>
              <p className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-[#999] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                info@daintown.com
              </p>
            </div>
          </div>
          
          {/* 바로가기 링크 */}
          <div>
            <h3 className="text-xl font-bold text-[#333] mb-4">바로가기</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/stores/1f" className="text-[#666] hover:text-[#0F6FFF] transition-colors flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  상가정보
                </Link>
              </li>
              <li>
                <Link href="/parking" className="text-[#666] hover:text-[#0F6FFF] transition-colors flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  주차정보
                </Link>
              </li>
              <li>
                <Link href="/feedback" className="text-[#666] hover:text-[#0F6FFF] transition-colors flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  고객의소리
                </Link>
              </li>
              <li>
                <Link href="/building" className="text-[#666] hover:text-[#0F6FFF] transition-colors flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  건물 정보
                </Link>
              </li>
              <li>
                <Link href="/merchant-association" className="text-[#666] hover:text-[#0F6FFF] transition-colors flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  상가번영회
                </Link>
              </li>
            </ul>
          </div>
          
          {/* 영업시간 */}
          <div>
            <h3 className="text-xl font-bold text-[#333] mb-4">영업시간</h3>
            <div className="space-y-2 text-[#666]">
              <p className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-[#999] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                평일: 10:00 - 22:00
              </p>
              <p className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-[#999] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                주말 및 공휴일: 10:30 - 21:30
              </p>
            </div>
            
            <div className="mt-8 pt-4 border-t border-[#f2f2f2]">
              <p className="text-sm text-[#999]">© 2025 다인타운. All rights reserved.</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;