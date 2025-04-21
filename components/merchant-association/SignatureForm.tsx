// app/merchant-association/SignatureForm.tsx
'use client';

import { useState } from 'react';

interface SignatureFormProps {
  userSignature: string | null;
  onApprove: () => void;
  onReject: () => void;
}

export default function SignatureForm({ userSignature, onApprove, onReject }: SignatureFormProps) {
  const [voted, setVoted] = useState(false);
  const [voteType, setVoteType] = useState<string | null>(null);

  const handleVote = (type: string) => {
    setVoteType(type);
    setVoted(true);
    
    if (type === 'approve') {
      onApprove();
    } else {
      onReject();
    }
  };

  if (voted) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-lg font-medium text-blue-800 mt-2">
            서명이 완료되었습니다
          </h3>
          <p className="text-sm text-blue-600 mt-1">
            {voteType === 'approve' ? '찬성' : '반대'} 의견이 등록되었습니다.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-blue-800 mb-4">서명하기</h3>
      <p className="text-gray-700 mb-4">
        이 문서에 대한 귀하의 의견을 선택하고 서명해주세요.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <button
          onClick={() => handleVote('approve')}
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
        >
          찬성 및 서명
        </button>
        <button
          onClick={() => handleVote('reject')}
          className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
        >
          반대 및 서명
        </button>
      </div>
      
      <div className="mt-4">
        <p className="text-sm text-gray-500 mb-2">회원가입 시 등록한 서명이 사용됩니다.</p>
        {userSignature ? (
          <div className="border rounded p-2 bg-white inline-block">
            <img 
              src={userSignature} 
              alt="내 서명" 
              className="h-16 object-contain"
            />
          </div>
        ) : (
          <div className="border rounded p-4 bg-white text-gray-400 text-center">
            등록된 서명이 없습니다. 프로필에서 서명을 먼저 생성해주세요.
          </div>
        )}
      </div>
    </div>
  );
}