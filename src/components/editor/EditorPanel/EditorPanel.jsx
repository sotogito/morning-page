import { useState, useEffect } from 'react';
import './EditorPanel.css';
import { ERROR_MESSAGE } from '../../../constants/ErrorMessage';
import { INFO_MESSAGE } from '../../../constants/InfoMessage';

const EditorPanel = ({
  title = '',
  onTitleChange,
  content = '',
  onCanSave,
  onContentChange,
  onTogglePreview,
  showPreview = false,
  onError,
  onInfo,
  onSave,
  canSave = false,
}) => {
  const [charCount, setCharCount] = useState(0);
  const [remainingTime, setRemainingTime] = useState(5);
  const minCharCount = 1000;

  useEffect(() => {
    setCharCount(content.length);
  }, [content]);

  useEffect(() => {
    const canSaveNow = charCount >= minCharCount;
    onCanSave?.(canSaveNow);
  }, [charCount, minCharCount, onCanSave]);

  useEffect(() => {
    const timerId = setInterval(() => {
      setRemainingTime((prev) => {
        if (prev <= 1) {
          clearInterval(timerId);
          onInfo?.(INFO_MESSAGE.WRITE_TIMEOUT);
          onSave?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerId);
  }, []);

  const handleContentChange = (e) => {
    const newContent = e.target.value;
    
    if (newContent.length < content.length) {
      onError?.(ERROR_MESSAGE.DELETE_TEXT_FAIL);
      return;
    }
    
    onContentChange?.(newContent);
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

  const handleSave = () => {
    if (canSave) {
      onSave?.();
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

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
        <div className="footer-actions">
          <span className="timer">{formatTime(remainingTime)}</span>
          <button 
            className="save-button" 
            disabled={!canSave}
            onClick={handleSave}
          >
            저장
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditorPanel;
