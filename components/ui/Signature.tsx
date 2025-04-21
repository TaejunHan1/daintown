// app/auth/register/page.tsx
'use client';

import React, { useEffect, useState, useCallback } from 'react';

interface SignatureProps {
  name: string;
  onChange: (signatureData: string) => void;
}

// 사용할 폰트 목록 - 한글/영문 모두 지원하는 폰트들
const SIGNATURE_FONTS = [
  { name: '나눔 펜 스크립트', fontFamily: "'Nanum Pen Script', cursive" },
  { name: '나눔 브러쉬', fontFamily: "'Nanum Brush Script', cursive" },
  { name: '제주 명조', fontFamily: "'Jeju Myeongjo', serif" },
  { name: '고운 돋움', fontFamily: "'Gowun Dodum', sans-serif" },
  { name: '송명', fontFamily: "'Song Myung', serif" },
  { name: '개밀당', fontFamily: "'Gaegu', cursive" },
  { name: '도현', fontFamily: "'Do Hyeon', sans-serif" },
  { name: '주아', fontFamily: "'Jua', sans-serif" },
  { name: '양진체', fontFamily: "'Gamja Flower', cursive" },
  { name: '귀여운 글씨', fontFamily: "'Cute Font', cursive" },
  { name: '수화 명조', fontFamily: "'Song Myung', serif" },
  { name: '연성체', fontFamily: "'Yeon Sung', cursive" },
  { name: '검은 고딕', fontFamily: "'Black Han Sans', sans-serif" },
  { name: '어비 남매체', fontFamily: "'Single Day', cursive" },
  { name: '포도 매실', fontFamily: "'Poor Story', cursive" },
  { name: '하이멜', fontFamily: "'Hi Melody', cursive" },
  { name: '동해 독도', fontFamily: "'East Sea Dokdo', cursive" },
  { name: '국립 박물관', fontFamily: "'Stylish', sans-serif" },
  { name: '기쁨 나눔', fontFamily: "'Sunflower', sans-serif" },
  { name: '코트라 희망체', fontFamily: "'Gothic A1', sans-serif" }
];

const Signature: React.FC<SignatureProps> = ({ name, onChange }) => {
  const [signatureData, setSignatureData] = useState<string>('');
  const [currentFontIndex, setCurrentFontIndex] = useState<number>(0);
  
  // SVG 서명 생성 함수
  const generateSignature = useCallback((text: string, fontIndex: number) => {
    if (!text) return '';
    
    // 폰트 선택
    const font = SIGNATURE_FONTS[fontIndex];
    
    // 서명 SVG 생성
    const width = Math.max(300, text.length * 40);
    const height = 120;
    
    // 서명 SVG 생성 (이름만 표시, 다른 장식 없음)
    const svgContent = `
      <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
        <text x="50%" y="50%" 
          font-family="${font.fontFamily}" 
          font-size="42"
          fill="#000000" 
          text-anchor="middle"
          dominant-baseline="middle">${text}</text>
      </svg>
    `;
    
    // SVG를 데이터 URL로 변환
    return `data:image/svg+xml;utf8,${encodeURIComponent(svgContent)}`;
  }, []);
  
  // 폰트 변경 함수
  const changeFont = useCallback(() => {
    // 다음 폰트 인덱스 계산
    const nextFontIndex = (currentFontIndex + 1) % SIGNATURE_FONTS.length;
    setCurrentFontIndex(nextFontIndex);
    
    // 새 폰트로 서명 재생성
    if (name) {
      const newSignatureData = generateSignature(name, nextFontIndex);
      setSignatureData(newSignatureData);
      onChange(newSignatureData);
    }
  }, [currentFontIndex, generateSignature, name, onChange]);
  
  // 이름이 변경될 때 서명 데이터 생성
  useEffect(() => {
    if (!name) {
      setSignatureData('');
      onChange('');
      return;
    }
    
    // 서명 생성
    const newSignatureData = generateSignature(name, currentFontIndex);
    
    if (newSignatureData !== signatureData) {
      setSignatureData(newSignatureData);
      onChange(newSignatureData);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, currentFontIndex, generateSignature]);
  
  if (!name) return null;
  
  return (
    <div className="mt-4">
      <div className="flex justify-between items-center mb-2">
        <label className="form-label">서명</label>
        <button 
          type="button"
          onClick={changeFont}
          className="text-[#0F6FFF] text-sm flex items-center hover:underline"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
          </svg>
          폰트 변경
        </button>
      </div>
      <div className="toss-card p-4 bg-[#FCFCFC]">
        {signatureData ? (
          <div className="flex flex-col items-center">
            <div 
              className="max-w-full h-24 flex items-center justify-center"
            >
              <img src={signatureData} alt="생성된 서명" className="max-h-20" />
            </div>
            <p className="text-sm text-[#999] mt-2 flex items-center">
              <span className="font-medium text-[#666] mr-1">{SIGNATURE_FONTS[currentFontIndex].name}</span>
              <span>폰트로 생성된 서명입니다</span>
            </p>
          </div>
        ) : (
          <div className="text-center text-[#999] py-4">
            이름을 입력하면 서명이 자동으로 생성됩니다
          </div>
        )}
      </div>
    </div>
  );
};

export default Signature;