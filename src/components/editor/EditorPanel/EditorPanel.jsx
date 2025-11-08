import { useState, useEffect } from 'react';
import './EditorPanel.css';

const EditorPanel = ({ 
  content = '', 
  onChange, 
  onTogglePreview,
  showPreview = false 
}) => {
  const [title, setTitle] = useState('');
  const [charCount, setCharCount] = useState(0);
  const minCharCount = 1000;

  useEffect(() => {
    // 기본 제목: YYYY-MM-DD 
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];
    setTitle(dateStr + ' ');
  }, []);

  useEffect(() => {
    setCharCount(content.length);
  }, [content]);

  const handleContentChange = (e) => {
    onChange?.(e.target.value);
  };

  const handleTitleChange = (e) => {
    setTitle(e.target.value);
  };

  const handleContentDelete = (e) => {
    if(e.key == 'Backspace') {
      return e.preventDefault();
    }

    const textarea = e.target;
    const hasSelection = textarea.selectionStart !== textarea.selectionEnd;
    if(hasSelection) {
      e.preventDefault();
    }
  }

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

