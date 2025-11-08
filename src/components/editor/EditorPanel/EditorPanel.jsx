import { useState, useEffect } from 'react';
import './EditorPanel.css';
import { ERROR_MESSAGE } from '../../../constants/ErrorMessages';

const EditorPanel = ({
  title = '',
  onTitleChange,
  content = '',
  onChange,
  onTogglePreview,
  showPreview = false,
  onError,
}) => {
  const [charCount, setCharCount] = useState(0);
  const minCharCount = 1000;

  useEffect(() => {
    setCharCount(content.length);
  }, [content]);

  const handleContentChange = (e) => {
    const newContent = e.target.value;
    
    // 텍스트가 줄어들면 수정 방지
    if (newContent.length < content.length) {
      onError?.(ERROR_MESSAGE.DELETE_TEXT_FAIL);
      return;
    }
    
    onChange?.(newContent);
  };

  const handleTitleChange = (e) => {
    onTitleChange?.(e.target.value);
  };

  const handleContentDelete = (e) => {
    if(e.key === 'Backspace' || e.key === 'Delete') {
      e.preventDefault();
      onError?.(ERROR_MESSAGE.DELETE_TEXT_FAIL);
    }
  };


  const canSave = charCount >= minCharCount;

  return (
    <div className="editor-panel">
      <div className="editor-header">
        <input
          type="text"
          className="editor-title"
          value={title}
          onChange={handleTitleChange}
          placeholder="제목을 입력하세요"
        />
        <div className="editor-actions">
          <button
            className={`preview-toggle ${showPreview ? 'active' : ''}`}
            onClick={onTogglePreview}
          >
            {showPreview ? '미리보기 끄기' : '미리보기'}
          </button>
        </div>
      </div>
      
      <div className="editor-body">
        <textarea
          className="editor-textarea"
          value={content}
          onChange={handleContentChange}
          onKeyDown={handleContentDelete}
          placeholder="글을 작성하세요..."
        />
      </div>

      <div className="editor-footer">
        <div className="char-counter">
          <span className={charCount >= minCharCount ? 'success' : 'warning'}>
            {charCount.toLocaleString()}
          </span>
          <span className="char-limit"> / {minCharCount.toLocaleString()}자</span>
        </div>
        <button 
          className="save-button" 
          disabled={!canSave}
        >
          저장
        </button>
      </div>
    </div>
  );
};

export default EditorPanel;
