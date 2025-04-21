// app/components/Editor.tsx
'use client';

import React, { useState, useEffect } from 'react';

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function Editor({ value, onChange }: EditorProps) {
  const [editorContent, setEditorContent] = useState(value);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);

  useEffect(() => {
    setEditorContent(value);
  }, [value]);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditorContent(e.target.value);
    onChange(e.target.value);
  };

  const insertFormat = (format: string) => {
    const textarea = document.getElementById('editor') as HTMLTextAreaElement;
    if (!textarea) return;
 
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = editorContent.substring(start, end);
    let formattedText = '';

    switch (format) {
      case 'bold':
        formattedText = `<strong>${selectedText}</strong>`;
        setIsBold(!isBold);
        break;
      case 'italic':
        formattedText = `<em>${selectedText}</em>`;
        setIsItalic(!isItalic);
        break;
      case 'underline':
        formattedText = `<u>${selectedText}</u>`;
        setIsUnderline(!isUnderline);
        break;
      case 'h1':
        formattedText = `<h1>${selectedText}</h1>`;
        break;
      case 'h2':
        formattedText = `<h2>${selectedText}</h2>`;
        break;
      case 'h3':
        formattedText = `<h3>${selectedText}</h3>`;
        break;
      case 'ul':
        formattedText = `<ul>\n  <li>${selectedText}</li>\n</ul>`;
        break;
      case 'ol':
        formattedText = `<ol>\n  <li>${selectedText}</li>\n</ol>`;
        break;
      case 'link':
        const url = prompt('링크 URL을 입력하세요:', 'https://');
        if (url) {
          formattedText = `<a href="${url}" target="_blank">${selectedText || url}</a>`;
        } else {
          return;
        }
        break;
      case 'image':
        const imageUrl = prompt('이미지 URL을 입력하세요:', 'https://');
        if (imageUrl) {
          formattedText = `<img src="${imageUrl}" alt="${selectedText || '이미지'}" />`;
        } else {
          return;
        }
        break;
      default:
        return;
    }

    // 새 콘텐츠 생성
    const newContent = 
      editorContent.substring(0, start) + 
      formattedText + 
      editorContent.substring(end);
    
    // 상태 업데이트
    setEditorContent(newContent);
    onChange(newContent);
    
    // 편집기에 포커스 복원
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + formattedText.length, start + formattedText.length);
    }, 0);
  };

  // HTML로 변환하는 함수 (줄바꿈 유지)
  const convertToHtml = (text: string) => {
    if (!text) return '';
    
    // 엔터를 <br>로 변환하고, HTML 태그는 보존
    return text
      .replace(/\r\n/g, '<br>')
      .replace(/\n/g, '<br>');
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* 툴바 */}
      <div className="bg-gray-100 border-b p-2 flex flex-wrap gap-1">
        <button
          type="button"
          onClick={() => insertFormat('bold')}
          className={`p-2 rounded hover:bg-gray-200 ${isBold ? 'bg-gray-200' : ''}`}
          title="굵게"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 7.5h10.5a2.25 2.25 0 0 1 2.25 2.25v9a2.25 2.25 0 0 1-2.25 2.25h-10.5A2.25 2.25 0 0 1 4.5 18.75v-9a2.25 2.25 0 0 1 2.25-2.25Z" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => insertFormat('italic')}
          className={`p-2 rounded hover:bg-gray-200 ${isItalic ? 'bg-gray-200' : ''}`}
          title="기울임"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="m9.75 16.5-1.5-6 1.5-6m4.5 12 1.5-6-1.5-6" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => insertFormat('underline')}
          className={`p-2 rounded hover:bg-gray-200 ${isUnderline ? 'bg-gray-200' : ''}`}
          title="밑줄"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9h16.5m-16.5 6.75h16.5" />
          </svg>
        </button>
        
        <div className="w-px h-6 bg-gray-300 mx-1"></div>
        
        <button
          type="button"
          onClick={() => insertFormat('h1')}
          className="p-2 rounded hover:bg-gray-200 font-bold"
          title="제목 1"
        >
          H1
        </button>
        <button
          type="button"
          onClick={() => insertFormat('h2')}
          className="p-2 rounded hover:bg-gray-200 font-bold"
          title="제목 2"
        >
          H2
        </button>
        <button
          type="button"
          onClick={() => insertFormat('h3')}
          className="p-2 rounded hover:bg-gray-200 font-bold"
          title="제목 3"
        >
          H3
        </button>
        
        <div className="w-px h-6 bg-gray-300 mx-1"></div>
        
        <button
          type="button"
          onClick={() => insertFormat('ul')}
          className="p-2 rounded hover:bg-gray-200"
          title="글머리 기호"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 5.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => insertFormat('ol')}
          className="p-2 rounded hover:bg-gray-200"
          title="번호 매기기"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 5.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
          </svg>
        </button>
        
        <div className="w-px h-6 bg-gray-300 mx-1"></div>
        
        <button
          type="button"
          onClick={() => insertFormat('link')}
          className="p-2 rounded hover:bg-gray-200"
          title="링크"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => insertFormat('image')}
          className="p-2 rounded hover:bg-gray-200"
          title="이미지"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
          </svg>
        </button>
      </div>
      
      {/* 편집 영역 */}
      <textarea
        id="editor"
        className="w-full min-h-[300px] p-4 focus:outline-none"
        value={editorContent}
        onChange={handleContentChange}
        placeholder="내용을 입력하세요..."
      ></textarea>
      
      {/* 미리보기 영역 */}
      <div className="border-t p-4">
        <div className="text-sm font-medium text-gray-500 mb-2">미리보기</div>
        <div 
          className="prose max-w-none"
          dangerouslySetInnerHTML={{ __html: convertToHtml(editorContent) }}
        ></div>
      </div>
    </div>
  );
}