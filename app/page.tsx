// app/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

// 이미지 슬라이더 컴포넌트
const SimpleImageSlider = ({ images }: { images: string[] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // 3초마다 이미지 전환 (useState를 useEffect로 변경)
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [images]);

  return (
    <div className="relative w-full h-96 overflow-hidden">
      {images.map((src, index) => (
        <div 
          key={index}
          className={`absolute top-0 left-0 w-full h-full transition-opacity duration-1000 ${
            index === currentIndex ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <img 
            src={src} 
            alt={`Building image ${index + 1}`} 
            className="w-full h-full object-cover"
          />
        </div>
      ))}
    </div>
  );
};

export default function Home() {
  // 각 층별 더보기 상태 관리
  const [expanded, setExpanded] = useState<{[key: string]: boolean}>({
    '1f': false,
    '2f': false,
    '3f': false,
    '4f': false,
    '5f': false,
    '6f': false,
    '7f': false,
    '8f': false,
    '9f': false,
  });

  // 더보기/접기 토글 함수
  const toggleExpand = (floor: string) => {
    setExpanded({
      ...expanded,
      [floor]: !expanded[floor]
    });
  };

  // 건물 이미지 - 수정된 부분 (올바른 경로 사용)
  const buildingImages = [
    '/images/stores/1F/puffpuff/puffpuff1.jpeg',
    '/images/stores/1F/pharmacy/pharmacy1.jpeg',
    '/images/stores/1F/pb/pb1.jpg',
    '/images/stores/1F/haejang/haejang1.jpg',
  ];

  return (
    <div className="bg-white">
      {/* 히어로 섹션 - 이미지 슬라이더 (수정) */}
      <SimpleImageSlider images={buildingImages} />

      {/* 다인타운 소개 섹션 */}
      <section className="py-16 bg-white">
        <div className="container-custom mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#333] mb-4">다인타운에 오신 것을 환영합니다</h2>
            <p className="text-lg text-[#666] max-w-3xl mx-auto">
              다인타운은 부천시 상동에 위치한 복합 시설로, 교육, 의료, 먹거리, 쇼핑 등 다양한 시설과 서비스를 한곳에서 만나보실 수 있습니다.
            </p>
          </div>

          {/* 특징 박스 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-toss hover:shadow-md transition-shadow border border-[#f2f2f2]">
              <div className="w-12 h-12 rounded-full bg-[#EBF4FF] flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#0F6FFF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-[#333]">다양한 시설</h3>
              <p className="text-[#666]">
                음식점, 전자담배, 약국, 통신사, 의원, 학원 등 다양한 매장들을 한 건물에서 만나보세요.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-toss hover:shadow-md transition-shadow border border-[#f2f2f2]">
              <div className="w-12 h-12 rounded-full bg-[#EBF4FF] flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#0F6FFF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-[#333]">편리한 접근성</h3>
              <p className="text-[#666]">
                상동역 7번 출구 또는 8번 출구에서 도보 20초 거리에 위치해 있어 교통이 매우 편리합니다.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-toss hover:shadow-md transition-shadow border border-[#f2f2f2]">
              <div className="w-12 h-12 rounded-full bg-[#EBF4FF] flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#0F6FFF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-[#333]">다채로운 경험</h3>
              <p className="text-[#666]">
                노래방, 필라테스, PC방, 스크린 골프, 요가, 음악교실 등 다양한 취미와 여가 활동을 즐길 수 있습니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 층별 안내 섹션 */}
      <section className="py-16 bg-[#f8f9fa]">
        <div className="container-custom mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#333] mb-4">층별 안내</h2>
            <p className="text-lg text-[#666] max-w-3xl mx-auto">
              다인타운의 각 층에는 다양한 매장과 시설이 있습니다.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 1층 카드 */}
            <div className="bg-white rounded-xl shadow-toss overflow-hidden">
              <div className="p-5 border-b border-[#f2f2f2] flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-[#EBF4FF] flex items-center justify-center mr-4">
                    <span className="text-[#0F6FFF] font-bold">1F</span>
                  </div>
                  <h3 className="text-lg font-semibold text-[#333]">1층</h3>
                </div>
                <Link href="/stores/1f" className="text-[#0F6FFF] hover:underline text-sm font-medium flex items-center">
                  자세히 보기
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
              <div className="p-4">
                <div className="space-y-2">
                  <div className="flex items-center p-3 bg-[#f8f9fa] rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-[#FFECEC] flex items-center justify-center mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#FF6B6B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <span className="text-[#333] font-medium">양평해장국</span>
                  </div>
                  <div className="flex items-center p-3 bg-[#f8f9fa] rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-[#E6F3FF] flex items-center justify-center mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#0F6FFF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                      </svg>
                    </div>
                    <span className="text-[#333] font-medium">뻐끔뻐끔전자담배</span>
                  </div>
                  <div className="flex items-center p-3 bg-[#f8f9fa] rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-[#E6FFE9] flex items-center justify-center mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#2BC451]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                      </svg>
                    </div>
                    <span className="text-[#333] font-medium">종로김밥</span>
                  </div>
                  
                  {expanded['1f'] ? (
                    <>
                      <div className="flex items-center p-3 bg-[#f8f9fa] rounded-lg">
                        <div className="w-8 h-8 rounded-full bg-[#E6FFFA] flex items-center justify-center mr-3">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#0694A2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                          </svg>
                        </div>
                        <span className="text-[#333] font-medium">SK텔레콤</span>
                      </div>
                      <div className="flex items-center p-3 bg-[#f8f9fa] rounded-lg">
                        <div className="w-8 h-8 rounded-full bg-[#FFE6F2] flex items-center justify-center mr-3">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#E83E8C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                          </svg>
                        </div>
                        <span className="text-[#333] font-medium">빈티지멀티샵</span>
                      </div>
                      <div className="flex items-center p-3 bg-[#f8f9fa] rounded-lg">
                        <div className="w-8 h-8 rounded-full bg-[#E6FFE9] flex items-center justify-center mr-3">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#2BC451]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                          </svg>
                        </div>
                        <span className="text-[#333] font-medium">선비꼬마김밥</span>
                      </div>
                      <div className="flex items-center p-3 bg-[#f8f9fa] rounded-lg">
                        <div className="w-8 h-8 rounded-full bg-[#FFF3E0] flex items-center justify-center mr-3">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#FF9800]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                          </svg>
                        </div>
                        <span className="text-[#333] font-medium">경비실</span>
                      </div>
                      <div className="flex items-center p-3 bg-[#f8f9fa] rounded-lg">
                        <div className="w-8 h-8 rounded-full bg-[#F0E6FF] flex items-center justify-center mr-3">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#8B5CF6]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                          </svg>
                        </div>
                        <span className="text-[#333] font-medium">파리바게트</span>
                      </div>
                      <div className="flex items-center p-3 bg-[#f8f9fa] rounded-lg">
                        <div className="w-8 h-8 rounded-full bg-[#E6F7FF] flex items-center justify-center mr-3">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#0CA5E9]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                        </div>
                        <span className="text-[#333] font-medium">온누리약국</span>
                      </div>
                    </>
                  ) : null}
                  
                  <button
                    onClick={() => toggleExpand('1f')}
                    className="w-full p-2 mt-1 text-[#0F6FFF] bg-[#EBF4FF] rounded-lg text-sm font-medium flex items-center justify-center hover:bg-[#D4E8FF] transition-colors"
                  >
                    {expanded['1f'] ? (
                      <>
                        접기
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                      </>
                    ) : (
                      <>
                        더보기 (+6)
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* 2층 카드 */}
            <div className="bg-white rounded-xl shadow-toss overflow-hidden">
              <div className="p-5 border-b border-[#f2f2f2] flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-[#EBF4FF] flex items-center justify-center mr-4">
                    <span className="text-[#0F6FFF] font-bold">2F</span>
                  </div>
                  <h3 className="text-lg font-semibold text-[#333]">2층</h3>
                </div>
                <Link href="/stores/2f" className="text-[#0F6FFF] hover:underline text-sm font-medium flex items-center">
                  자세히 보기
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
              <div className="p-4">
                <div className="space-y-2">
                  <div className="flex items-center p-3 bg-[#f8f9fa] rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-[#FFF3E0] flex items-center justify-center mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#FF9800]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </div>
                    <span className="text-[#333] font-medium">국민필라테스</span>
                  </div>
                  <div className="flex items-center p-3 bg-[#f8f9fa] rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-[#F0E6FF] flex items-center justify-center mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#8B5CF6]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <span className="text-[#333] font-medium">지니24 스터디카페</span>
                  </div>
                  <div className="flex items-center p-3 bg-[#f8f9fa] rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-[#FFE6E6] flex items-center justify-center mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#F43F5E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm0-5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z" />
                      </svg>
                    </div>
                    <span className="text-[#333] font-medium">바바헤어</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 3층 카드 */}
            <div className="bg-white rounded-xl shadow-toss overflow-hidden">
              <div className="p-5 border-b border-[#f2f2f2] flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-[#EBF4FF] flex items-center justify-center mr-4">
                    <span className="text-[#0F6FFF] font-bold">3F</span>
                  </div>
                  <h3 className="text-lg font-semibold text-[#333]">3층</h3>
                </div>
                <Link href="/stores/3f" className="text-[#0F6FFF] hover:underline text-sm font-medium flex items-center">
                  자세히 보기
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
              <div className="p-4">
                <div className="space-y-2">
                  <div className="flex items-center p-3 bg-[#f8f9fa] rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-[#FFE6F2] flex items-center justify-center mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#E83E8C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                      </svg>
                    </div>
                    <span className="text-[#333] font-medium">108 가라오케</span>
                  </div>
                  <div className="flex items-center p-3 bg-[#f8f9fa] rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-[#E6F7FF] flex items-center justify-center mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#0CA5E9]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                      </svg>
                    </div>
                    <span className="text-[#333] font-medium">씨아이코인노래방</span>
                  </div>
                  <div className="flex items-center p-3 bg-[#f8f9fa] rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-[#E6FFFA] flex items-center justify-center mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#0694A2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                      </svg>
                    </div>
                    <span className="text-[#333] font-medium">디에뜨의원</span>
                    <span className="ml-2 text-xs bg-[#e3f2fd] text-[#0F6FFF] px-2 py-0.5 rounded">피부과/성형외과</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 4층 카드 */}
            <div className="bg-white rounded-xl shadow-toss overflow-hidden">
              <div className="p-5 border-b border-[#f2f2f2] flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-[#EBF4FF] flex items-center justify-center mr-4">
                    <span className="text-[#0F6FFF] font-bold">4F</span>
                  </div>
                  <h3 className="text-lg font-semibold text-[#333]">4층</h3>
                </div>
                <Link href="/stores/4f" className="text-[#0F6FFF] hover:underline text-sm font-medium flex items-center">
                  자세히 보기
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
              <div className="p-4">
                <div className="space-y-2">
                  <div className="flex items-center p-3 bg-[#f8f9fa] rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-[#E6F7FF] flex items-center justify-center mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#0CA5E9]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <span className="text-[#333] font-medium">아이센스</span>
                  </div>
                  <div className="flex items-center p-3 bg-[#f8f9fa] rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-[#F0E6FF] flex items-center justify-center mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#8B5CF6]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <span className="text-[#333] font-medium">블랙라벨PC방</span>
                  </div>
                  <div className="flex items-center p-3 bg-[#f8f9fa] rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-[#FFF3E0] flex items-center justify-center mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#FF9800]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <span className="text-[#333] font-medium">복싱전문 케이오짐</span>
                  </div>
                  
                  {expanded['4f'] && (
                    <div className="flex items-center p-3 bg-[#f8f9fa] rounded-lg">
                      <div className="w-8 h-8 rounded-full bg-[#E6FFFA] flex items-center justify-center mr-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#0694A2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                        </svg>
                      </div>
                      <span className="text-[#333] font-medium">제니스</span>
                      <span className="ml-2 text-xs bg-[#e3f2fd] text-[#0F6FFF] px-2 py-0.5 rounded">피부/비뇨기과</span>
                    </div>
                  )}
                  
                  <button
                    onClick={() => toggleExpand('4f')}
                    className="w-full p-2 mt-1 text-[#0F6FFF] bg-[#EBF4FF] rounded-lg text-sm font-medium flex items-center justify-center hover:bg-[#D4E8FF] transition-colors"
                  >
                    {expanded['4f'] ? (
                      <>
                        접기
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                      </>
                    ) : (
                      <>
                        더보기 (+1)
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* 5층 카드 */}
            <div className="bg-white rounded-xl shadow-toss overflow-hidden">
              <div className="p-5 border-b border-[#f2f2f2] flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-[#EBF4FF] flex items-center justify-center mr-4">
                    <span className="text-[#0F6FFF] font-bold">5F</span>
                  </div>
                  <h3 className="text-lg font-semibold text-[#333]">5층</h3>
                </div>
                <Link href="/stores/5f" className="text-[#0F6FFF] hover:underline text-sm font-medium flex items-center">
                  자세히 보기
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
              <div className="p-4">
                <div className="space-y-2">
                  <div className="flex items-center p-3 bg-[#f8f9fa] rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-[#E6F7FF] flex items-center justify-center mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#0CA5E9]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <span className="text-[#333] font-medium">세이브존 문화센터</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 6층 카드 */}
            <div className="bg-white rounded-xl shadow-toss overflow-hidden">
              <div className="p-5 border-b border-[#f2f2f2] flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-[#EBF4FF] flex items-center justify-center mr-4">
                    <span className="text-[#0F6FFF] font-bold">6F</span>
                  </div>
                  <h3 className="text-lg font-semibold text-[#333]">6층</h3>
                </div>
                <Link href="/stores/6f" className="text-[#0F6FFF] hover:underline text-sm font-medium flex items-center">
                  자세히 보기
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
              <div className="p-4">
                <div className="space-y-2">
                  <div className="flex items-center p-3 bg-[#f8f9fa] rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-[#E6FFFA] flex items-center justify-center mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#0694A2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                        </svg>
                      </div>
                    <span className="text-[#333] font-medium">후한의원</span>
                    <span className="ml-2 text-xs bg-[#e3f2fd] text-[#0F6FFF] px-2 py-0.5 rounded">피부/비만/통증</span>
                  </div>
                  <div className="flex items-center p-3 bg-[#f8f9fa] rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-[#FFF3E0] flex items-center justify-center mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#FF9800]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </div>
                    <span className="text-[#333] font-medium">S플라잉&필라테스</span>
                  </div>
                  <div className="flex items-center p-3 bg-[#f8f9fa] rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-[#F0E6FF] flex items-center justify-center mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#8B5CF6]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <span className="text-[#333] font-medium">에스티어학원</span>
                  </div>
                  
                  {expanded['6f'] && (
                    <div className="flex items-center p-3 bg-[#f8f9fa] rounded-lg">
                      <div className="w-8 h-8 rounded-full bg-[#F0E6FF] flex items-center justify-center mr-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#8B5CF6]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      </div>
                      <span className="text-[#333] font-medium">PRS창의독서논술학원</span>
                    </div>
                  )}
                  
                  <button
                    onClick={() => toggleExpand('6f')}
                    className="w-full p-2 mt-1 text-[#0F6FFF] bg-[#EBF4FF] rounded-lg text-sm font-medium flex items-center justify-center hover:bg-[#D4E8FF] transition-colors"
                  >
                    {expanded['6f'] ? (
                      <>
                        접기
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                      </>
                    ) : (
                      <>
                        더보기 (+1)
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* 7층 카드 */}
            <div className="bg-white rounded-xl shadow-toss overflow-hidden">
              <div className="p-5 border-b border-[#f2f2f2] flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-[#EBF4FF] flex items-center justify-center mr-4">
                    <span className="text-[#0F6FFF] font-bold">7F</span>
                  </div>
                  <h3 className="text-lg font-semibold text-[#333]">7층</h3>
                </div>
                <Link href="/stores/7f" className="text-[#0F6FFF] hover:underline text-sm font-medium flex items-center">
                  자세히 보기
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
              <div className="p-4">
                <div className="space-y-2">
                  <div className="flex items-center p-3 bg-[#f8f9fa] rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-[#F0E6FF] flex items-center justify-center mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#8B5CF6]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <span className="text-[#333] font-medium">제대로 학원</span>
                    <span className="ml-2 text-xs bg-[#e3f2fd] text-[#0F6FFF] px-2 py-0.5 rounded">종합</span>
                  </div>
                  <div className="flex items-center p-3 bg-[#f8f9fa] rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-[#E6FFFA] flex items-center justify-center mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#0694A2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                      </svg>
                    </div>
                    <span className="text-[#333] font-medium">은혜정신과</span>
                  </div>
                  <div className="flex items-center p-3 bg-[#f8f9fa] rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-[#FFE6E6] flex items-center justify-center mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#F43F5E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm0-5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z" />
                      </svg>
                    </div>
                    <span className="text-[#333] font-medium">리블룸뷰티</span>
                  </div>
                  
                  {expanded['7f'] && (
                    <div className="flex items-center p-3 bg-[#f8f9fa] rounded-lg">
                      <div className="w-8 h-8 rounded-full bg-[#F0E6FF] flex items-center justify-center mr-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#8B5CF6]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      </div>
                      <span className="text-[#333] font-medium">키즈스피치마루지</span>
                    </div>
                  )}
                  
                  <button
                    onClick={() => toggleExpand('7f')}
                    className="w-full p-2 mt-1 text-[#0F6FFF] bg-[#EBF4FF] rounded-lg text-sm font-medium flex items-center justify-center hover:bg-[#D4E8FF] transition-colors"
                  >
                    {expanded['7f'] ? (
                      <>
                        접기
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                      </>
                    ) : (
                      <>
                        더보기 (+1)
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* 8층 카드 */}
            <div className="bg-white rounded-xl shadow-toss overflow-hidden">
              <div className="p-5 border-b border-[#f2f2f2] flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-[#EBF4FF] flex items-center justify-center mr-4">
                    <span className="text-[#0F6FFF] font-bold">8F</span>
                  </div>
                  <h3 className="text-lg font-semibold text-[#333]">8층</h3>
                </div>
                <Link href="/stores/8f" className="text-[#0F6FFF] hover:underline text-sm font-medium flex items-center">
                  자세히 보기
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
              <div className="p-4">
                <div className="space-y-2">
                  <div className="flex items-center p-3 bg-[#f8f9fa] rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-[#FFF3E0] flex items-center justify-center mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#FF9800]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                    </div>
                    <span className="text-[#333] font-medium">나이스스크린골프</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 9층 카드 */}
            <div className="bg-white rounded-xl shadow-toss overflow-hidden">
              <div className="p-5 border-b border-[#f2f2f2] flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-[#EBF4FF] flex items-center justify-center mr-4">
                    <span className="text-[#0F6FFF] font-bold">9F</span>
                  </div>
                  <h3 className="text-lg font-semibold text-[#333]">9층</h3>
                </div>
                <Link href="/stores/9f" className="text-[#0F6FFF] hover:underline text-sm font-medium flex items-center">
                  자세히 보기
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
              <div className="p-4">
                <div className="space-y-2">
                  <div className="flex items-center p-3 bg-[#f8f9fa] rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-[#F0E6FF] flex items-center justify-center mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#8B5CF6]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <span className="text-[#333] font-medium">제대로 학원</span>
                  </div>
                  <div className="flex items-center p-3 bg-[#f8f9fa] rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-[#FFF3E0] flex items-center justify-center mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#FF9800]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </div>
                    <span className="text-[#333] font-medium">요가 아쉬람</span>
                  </div>
                  <div className="flex items-center p-3 bg-[#f8f9fa] rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-[#E6FFE9] flex items-center justify-center mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#2BC451]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <span className="text-[#333] font-medium">브라운크리스탈PT</span>
                  </div>
                  
                  {expanded['9f'] && (
                    <>
                      <div className="flex items-center p-3 bg-[#f8f9fa] rounded-lg">
                        <div className="w-8 h-8 rounded-full bg-[#E6F7FF] flex items-center justify-center mr-3">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#0CA5E9]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        </div>
                        <span className="text-[#333] font-medium">(주)LKD / (주)백진</span>
                      </div>
                      <div className="flex items-center p-3 bg-[#f8f9fa] rounded-lg">
                        <div className="w-8 h-8 rounded-full bg-[#FFE6F2] flex items-center justify-center mr-3">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#E83E8C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                          </svg>
                        </div>
                        <span className="text-[#333] font-medium">석순음악교실</span>
                      </div>
                      <div className="flex items-center p-3 bg-[#f8f9fa] rounded-lg">
                        <div className="w-8 h-8 rounded-full bg-[#FFE6E6] flex items-center justify-center mr-3">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#F43F5E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm0-5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z" />
                          </svg>
                        </div>
                        <span className="text-[#333] font-medium">네일샵</span>
                      </div>
                    </>
                  )}
                  
                  <button
                    onClick={() => toggleExpand('9f')}
                    className="w-full p-2 mt-1 text-[#0F6FFF] bg-[#EBF4FF] rounded-lg text-sm font-medium flex items-center justify-center hover:bg-[#D4E8FF] transition-colors"
                  >
                    {expanded['9f'] ? (
                      <>
                        접기
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                      </>
                    ) : (
                      <>
                        더보기 (+3)
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 교통 안내 섹션 */}
      <section className="py-16 bg-white">
        <div className="container-custom mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-[#333] mb-4">교통 안내</h2>
            <p className="text-lg text-[#666] max-w-3xl mx-auto">
              다인타운은 대중교통으로 쉽게 방문하실 수 있습니다.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-toss border border-[#f2f2f2]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold mb-4 text-[#333] flex items-center">
                  <div className="w-10 h-10 rounded-full bg-[#EBF4FF] flex items-center justify-center mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#0F6FFF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  지하철
                </h3>
                <div className="space-y-3 pl-13">
                  <div className="p-4 bg-[#f8f9fa] rounded-lg flex items-center">
                    <span className="flex-shrink-0 inline-flex items-center justify-center h-8 w-8 rounded-full bg-[#33a23d] text-white text-sm font-medium mr-3">7</span>
                    <span className="text-[#333]">상동역 7번 출구 도보 20초</span>
                  </div>
                  <div className="p-4 bg-[#f8f9fa] rounded-lg flex items-center">
                    <span className="flex-shrink-0 inline-flex items-center justify-center h-8 w-8 rounded-full bg-[#33a23d] text-white text-sm font-medium mr-3">8</span>
                    <span className="text-[#333]">상동역 8번 출구 도보 20초</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold mb-4 text-[#333] flex items-center">
                  <div className="w-10 h-10 rounded-full bg-[#EBF4FF] flex items-center justify-center mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#0F6FFF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  주변 정보
                </h3>
                <div className="space-y-3 pl-13">
                  <div className="p-4 bg-[#f8f9fa] rounded-lg flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-[#E6F7FF] flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#0CA5E9]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <span className="text-[#333]">부천시청 근처</span>
                  </div>
                  <div className="p-4 bg-[#f8f9fa] rounded-lg flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-[#E6FFE9] flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#2BC451]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <span className="text-[#333]">상동 중심 상권 위치</span>
                  </div>
                  <div className="p-4 bg-[#f8f9fa] rounded-lg flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-[#FFF3E0] flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#FF9800]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                      </svg>
                    </div>
                    <span className="text-[#333]">상동 공원 인접</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA 섹션 */}
      <section className="py-16 bg-[#0F6FFF] text-white">
        <div className="container-custom mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">다인타운에서 비즈니스 시작하기</h2>
          <p className="text-lg mb-8 max-w-3xl mx-auto">
            다인타운에서 새로운 비즈니스 기회를 찾아보세요. 교육, 의료, 서비스 등 다양한 업종의 상가가 여러분을 기다리고 있습니다.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link href="/building" className="px-8 py-3 bg-white text-[#0F6FFF] rounded-xl font-medium hover:bg-[#f8f9fa] transition-colors">
              건물 정보 보기
            </Link>
            <Link href="/auth/register" className="px-8 py-3 bg-white text-[#0F6FFF] rounded-xl font-medium hover:bg-[#f8f9fa] transition-colors">
              입점 문의하기
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}