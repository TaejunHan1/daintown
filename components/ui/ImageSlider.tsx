// app/admin/users/page.tsx
'use client';

import React, { useState, useEffect } from 'react';

// 임시 배경색 배열 (이미지 대신 사용)
const backgroundColors = [
  'bg-blue-500',
  'bg-green-500',
  'bg-red-500',
  'bg-purple-500'
];

interface ImageSliderProps {
  images: string[];
}

const ImageSlider: React.FC<ImageSliderProps> = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // 자동 슬라이드 설정
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % backgroundColors.length);
    }, 5000); // 5초마다 슬라이드 변경

    return () => clearInterval(interval);
  }, []);

  // 이전 이미지로 이동
  const goToPrevious = () => {
    const isFirstSlide = currentIndex === 0;
    const newIndex = isFirstSlide ? backgroundColors.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
  };

  // 다음 이미지로 이동
  const goToNext = () => {
    const isLastSlide = currentIndex === backgroundColors.length - 1;
    const newIndex = isLastSlide ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
  };

  // 특정 슬라이드로 이동
  const goToSlide = (slideIndex: number) => {
    setCurrentIndex(slideIndex);
  };

  return (
    <div className="relative h-96 md:h-[500px] w-full overflow-hidden">
      {/* 배경색 (이미지 대신 임시로 사용) */}
      <div
        className={`w-full h-full transition-transform duration-500 ease-out ${backgroundColors[currentIndex]} flex items-center justify-center`}
      >
        <h2 className="text-white text-3xl font-bold">다인타운에 오신 것을 환영합니다</h2>
      </div>

      {/* 좌우 화살표 버튼 */}
      <div className="absolute inset-0 flex items-center justify-between p-4">
        <button
          onClick={goToPrevious}
          className="p-2 rounded-full bg-white bg-opacity-50 hover:bg-opacity-75 transition-all"
          aria-label="이전 이미지"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-gray-800"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <button
          onClick={goToNext}
          className="p-2 rounded-full bg-white bg-opacity-50 hover:bg-opacity-75 transition-all"
          aria-label="다음 이미지"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-gray-800"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>

      {/* 인디케이터 점 */}
      <div className="absolute bottom-4 w-full flex justify-center">
        <div className="flex space-x-2">
          {backgroundColors.map((_, slideIndex) => (
            <button
              key={slideIndex}
              onClick={() => goToSlide(slideIndex)}
              className={`w-3 h-3 rounded-full ${
                slideIndex === currentIndex ? 'bg-white' : 'bg-white bg-opacity-50'
              }`}
              aria-label={`슬라이드 ${slideIndex + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ImageSlider;