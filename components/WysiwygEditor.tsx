// components/WysiwygEditor.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';

interface WysiwygEditorProps {
  value: string;
  onChange: (content: string) => void;
}

const WysiwygEditor: React.FC<WysiwygEditorProps> = ({ value, onChange }) => {
  const [mounted, setMounted] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);

  // 클라이언트 사이드에서만 렌더링
  useEffect(() => {
    setMounted(true);
    
    // 에디터 초기화
    if (editorRef.current) {
      editorRef.current.innerHTML = value;
    }
  }, []);

  // 에디터 컨텐츠가 변경될 때 부모 컴포넌트에 알림
  useEffect(() => {
    const handleInput = () => {
      if (editorRef.current) {
        onChange(editorRef.current.innerHTML);
      }
    };

    const editor = editorRef.current;
    if (editor) {
      editor.addEventListener('input', handleInput);
    }

    return () => {
      if (editor) {
        editor.removeEventListener('input', handleInput);
      }
    };
  }, [onChange]);

  // 에디터 컨텐츠 업데이트 (value prop이 변경될 때)
  useEffect(() => {
    if (editorRef.current && !editorRef.current.isEqualNode(document.activeElement) && value !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  // 툴바 버튼 클릭 핸들러
  const execCommand = (command: string, value: string = '') => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
      editorRef.current.focus();
    }
  };

  // 헤딩 적용
  const applyHeading = (level: string) => {
    if (level) {
      document.execCommand('formatBlock', false, level);
      if (editorRef.current) {
        onChange(editorRef.current.innerHTML);
        editorRef.current.focus();
      }
    }
  };
  
  // 버튼 클릭 이벤트 핸들러 (버블링 방지)
  const handleToolbarButtonClick = (e: React.MouseEvent, callback: Function) => {
    e.preventDefault();
    e.stopPropagation();
    callback();
  };

  if (!mounted) {
    return (
      <div className="border border-gray-200 rounded-xl h-64 bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="editor-container">
      <div 
        ref={toolbarRef}
        className="editor-toolbar bg-gray-50 p-2 border border-gray-200 rounded-t-xl flex flex-wrap gap-1 items-center justify-between"
      >
        <div className="flex flex-wrap gap-1 items-center">
          {/* 제목 스타일 */}
          <select 
            className="bg-white border border-gray-200 rounded px-2 py-1 text-sm"
            onChange={(e) => {
              e.preventDefault();
              applyHeading(e.target.value);
            }}
          >
            <option value="">스타일</option>
            <option value="h1">제목 1</option>
            <option value="h2">제목 2</option>
            <option value="h3">제목 3</option>
            <option value="p">일반</option>
          </select>

          <div className="border-r border-gray-300 h-6 mx-1"></div>

          {/* 텍스트 서식 */}
          <button 
            type="button"
            className="p-1 rounded hover:bg-gray-200" 
            onClick={(e) => handleToolbarButtonClick(e, () => execCommand('bold'))}
            title="굵게"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path>
              <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path>
            </svg>
          </button>
          
          <button 
            type="button"
            className="p-1 rounded hover:bg-gray-200" 
            onClick={(e) => handleToolbarButtonClick(e, () => execCommand('italic'))}
            title="기울임"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="4" x2="10" y2="4"></line>
              <line x1="14" y1="20" x2="5" y2="20"></line>
              <line x1="15" y1="4" x2="9" y2="20"></line>
            </svg>
          </button>
          
          <button 
            type="button"
            className="p-1 rounded hover:bg-gray-200" 
            onClick={(e) => handleToolbarButtonClick(e, () => execCommand('underline'))}
            title="밑줄"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3"></path>
              <line x1="4" y1="21" x2="20" y2="21"></line>
            </svg>
          </button>

          <div className="border-r border-gray-300 h-6 mx-1"></div>

          {/* 텍스트 정렬 */}
          <button 
            type="button"
            className="p-1 rounded hover:bg-gray-200" 
            onClick={(e) => handleToolbarButtonClick(e, () => execCommand('justifyLeft'))}
            title="왼쪽 정렬"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="12" x2="15" y2="12"></line>
              <line x1="3" y1="18" x2="18" y2="18"></line>
            </svg>
          </button>
          
          <button 
            type="button"
            className="p-1 rounded hover:bg-gray-200" 
            onClick={(e) => handleToolbarButtonClick(e, () => execCommand('justifyCenter'))}
            title="가운데 정렬"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="8" y1="12" x2="16" y2="12"></line>
              <line x1="6" y1="18" x2="18" y2="18"></line>
            </svg>
          </button>
          
          <button 
            type="button"
            className="p-1 rounded hover:bg-gray-200" 
            onClick={(e) => handleToolbarButtonClick(e, () => execCommand('justifyRight'))}
            title="오른쪽 정렬"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="9" y1="12" x2="21" y2="12"></line>
              <line x1="6" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>

          <div className="border-r border-gray-300 h-6 mx-1"></div>

          {/* 목록 */}
          <button 
            type="button"
            className="p-1 rounded hover:bg-gray-200" 
            onClick={(e) => handleToolbarButtonClick(e, () => execCommand('insertUnorderedList'))}
            title="글머리 기호 목록"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="8" y1="6" x2="21" y2="6"></line>
              <line x1="8" y1="12" x2="21" y2="12"></line>
              <line x1="8" y1="18" x2="21" y2="18"></line>
              <line x1="3" y1="6" x2="3.01" y2="6"></line>
              <line x1="3" y1="12" x2="3.01" y2="12"></line>
              <line x1="3" y1="18" x2="3.01" y2="18"></line>
            </svg>
          </button>
          
          <button 
            type="button"
            className="p-1 rounded hover:bg-gray-200" 
            onClick={(e) => handleToolbarButtonClick(e, () => execCommand('insertOrderedList'))}
            title="번호 목록"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="10" y1="6" x2="21" y2="6"></line>
              <line x1="10" y1="12" x2="21" y2="12"></line>
              <line x1="10" y1="18" x2="21" y2="18"></line>
              <path d="M4 6h1v4"></path>
              <path d="M4 10h2"></path>
              <path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"></path>
            </svg>
          </button>

          <div className="border-r border-gray-300 h-6 mx-1"></div>

          {/* 서식 지우기 */}
          <button 
            type="button"
            className="p-1 rounded hover:bg-gray-200" 
            onClick={(e) => handleToolbarButtonClick(e, () => execCommand('removeFormat'))}
            title="서식 지우기"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 3l18 18"></path>
              <path d="M12 8l-5 5 5 5"></path>
              <path d="M16 12h4"></path>
            </svg>
          </button>
        </div>
        
        {/* 미리보기 버튼 */}
        <button
          type="button"
          className={`text-sm px-2 py-1 rounded ${showPreview ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 hover:bg-gray-200'}`}
          onClick={(e) => {
            e.preventDefault();
            setShowPreview(!showPreview);
          }}
        >
          {showPreview ? '편집 모드' : '미리보기'}
        </button>
      </div>

      {showPreview ? (
        <div className="preview-content p-3 border border-gray-200 border-t-0 rounded-b-xl min-h-[200px] max-h-[400px] overflow-y-auto">
          <div dangerouslySetInnerHTML={{ __html: value }}></div>
        </div>
      ) : (
        <div
          ref={editorRef}
          className="editor-content p-3 border border-gray-200 border-t-0 rounded-b-xl min-h-[200px] max-h-[400px] overflow-y-auto focus:outline-none"
          contentEditable={true}
          suppressContentEditableWarning={true}
          data-placeholder="내용을 입력하세요..."
        ></div>
      )}

      <style jsx global>{`
        .preview-content {
          font-family: -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Pretendard', sans-serif;
          font-size: 14px;
        }
        .preview-content h1 {
          font-size: 1.75rem;
          font-weight: 600;
          margin: 1rem 0;
        }
        .preview-content h2 {
          font-size: 1.5rem;
          font-weight: 600;
          margin: 0.8rem 0;
        }
        .preview-content h3 {
          font-size: 1.25rem;
          font-weight: 600;
          margin: 0.6rem 0;
        }
        .preview-content p {
          margin: 0.5rem 0;
        }
        .preview-content ul {
          list-style-type: disc;
          margin-left: 1.5rem;
        }
        .preview-content ol {
          list-style-type: decimal;
          margin-left: 1.5rem;
        }
        .editor-content {
          font-family: -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Pretendard', sans-serif;
          font-size: 14px;
        }
        .editor-content:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
          position: absolute;
        }
        .editor-content h1 {
          font-size: 1.75rem;
          font-weight: 600;
          margin: 1rem 0;
        }
        .editor-content h2 {
          font-size: 1.5rem;
          font-weight: 600;
          margin: 0.8rem 0;
        }
        .editor-content h3 {
          font-size: 1.25rem;
          font-weight: 600;
          margin: 0.6rem 0;
        }
        .editor-content p {
          margin: 0.5rem 0;
        }
        .editor-content ul {
          list-style-type: disc;
          margin-left: 1.5rem;
        }
        .editor-content ol {
          list-style-type: decimal;
          margin-left: 1.5rem;
        }
      `}</style>
    </div>
  );
};

export default WysiwygEditor;