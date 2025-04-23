// app/stores/[floor]/[storeId]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getStoreById, Store } from '../../../lib/stores';

// 층별 표시 이름 매핑
const floorNames: { [key: string]: string } = {
  '1f': '1층',
  '2f': '2층',
  '3f': '3층',
  '4f': '4층',
  '5f': '5층',
  '6f': '6층',
  '7f': '7층',
  '8f': '8층',
  '9f': '9층',
};

export default function StorePage() {
  const params = useParams();
  const floor = params.floor as string;
  const storeId = params.storeId as string;
  
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 매장 상세 정보 로드
    const storeData = getStoreById(floor, storeId);
    setStore(storeData);
    setLoading(false);
  }, [floor, storeId]);

  if (loading) {
    return <div className="container-custom mx-auto py-12 text-center">로딩 중...</div>;
  }

  if (!store) {
    return (
      <div className="container-custom mx-auto py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">매장을 찾을 수 없습니다</h1>
        <Link href={`/stores/${floor}`} className="text-[#0F6FFF] hover:underline">
          {floorNames[floor]} 매장 목록으로 돌아가기
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white">
      <div className="container-custom mx-auto py-12">
        {/* 경로 표시 */}
        <div className="mb-6 flex items-center text-sm text-[#666]">
          <Link href="/" className="hover:text-[#0F6FFF]">홈</Link>
          <span className="mx-2">›</span>
          <Link href={`/stores/${floor}`} className="hover:text-[#0F6FFF]">{floorNames[floor]}</Link>
          <span className="mx-2">›</span>
          <span className="text-[#333] font-medium">{store.name}</span>
        </div>

        {/* 매장 헤더 */}
        <div className="flex flex-col md:flex-row items-start gap-6 mb-8">
          {store.image && (
            <div className="w-full md:w-1/2 h-64 md:h-80 rounded-xl overflow-hidden">
              <img 
                src={store.image} 
                alt={store.name} 
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          <div className="w-full md:w-1/2">
            <div className="flex items-center mb-3">
              <span className="text-sm bg-[#e3f2fd] text-[#0F6FFF] px-2 py-1 rounded mr-2">{floorNames[floor]}</span>
              <span className="text-sm bg-[#e3f2fd] text-[#0F6FFF] px-2 py-1 rounded">{store.category}</span>
            </div>
            <h1 className="text-3xl font-bold text-[#333] mb-4">{store.name}</h1>
            <p className="text-lg text-[#666] mb-6">{store.shortDescription}</p>
            
            {store.contact && (
              <div className="flex items-center mb-3 text-[#333]">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-[#0F6FFF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span>{store.contact}</span>
              </div>
            )}
            
            {store.hours && (
              <div className="flex items-center mb-3 text-[#333]">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-[#0F6FFF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{store.hours}</span>
              </div>
            )}
          </div>
        </div>

        {/* 매장 상세 정보 */}
        <div className="bg-white p-6 rounded-xl shadow-toss border border-[#f2f2f2] mb-8">
          <h2 className="text-xl font-bold text-[#333] mb-4">매장 소개</h2>
          <div className="prose max-w-none text-[#333]" dangerouslySetInnerHTML={{ __html: store.description }} />
        </div>

        {/* 매장 위치 (지도가 있다면) */}
        {store.mapImage && (
          <div className="bg-white p-6 rounded-xl shadow-toss border border-[#f2f2f2]">
            <h2 className="text-xl font-bold text-[#333] mb-4">매장 위치</h2>
            <div className="h-80 rounded-xl overflow-hidden">
              <img 
                src={store.mapImage} 
                alt={`${store.name} 위치`} 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}