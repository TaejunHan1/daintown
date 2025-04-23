// app/stores/[floor]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Store, getStoresByFloor } from '../../lib/stores';

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

export default function FloorPage() {
  const params = useParams();
  const floor = params.floor as string;
  const [stores, setStores] = useState<Store[]>([]);

  useEffect(() => {
    // 해당 층의 매장 정보 로드
    const storeData = getStoresByFloor(floor);
    setStores(storeData);
  }, [floor]);

  return (
    <div className="bg-white py-12">
      <div className="container-custom mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#333]">{floorNames[floor]} 매장 안내</h1>
          <p className="text-lg text-[#666] mt-2">다인타운 {floorNames[floor]}에 위치한 매장들을 확인하세요.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stores.map((store) => (
            <Link href={`/stores/${floor}/${store.id}`} key={store.id}>
              <div className="bg-white rounded-xl shadow-toss overflow-hidden hover:shadow-md transition-shadow border border-[#f2f2f2]">
                {store.image && (
                  <div className="h-48 overflow-hidden">
                    <img 
                      src={store.image} 
                      alt={store.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-5">
                  <div className="flex items-center mb-3">
                    <div className="w-8 h-8 rounded-full bg-[#EBF4FF] flex items-center justify-center mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#0F6FFF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-[#333]">{store.name}</h3>
                  </div>
                  
                  <p className="text-[#666] mb-4 line-clamp-2">{store.shortDescription}</p>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm bg-[#e3f2fd] text-[#0F6FFF] px-2 py-1 rounded">{store.category}</span>
                    <span className="text-[#0F6FFF] text-sm font-medium flex items-center">
                      더보기
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}