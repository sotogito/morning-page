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
  isReadOnly = false,
  savedAt = null,
}) => {
  const [charCount, setCharCount] = useState(0);
  const [remainingTime, setRemainingTime] = useState(1800); //30분
  const minCharCount = 1000;

  useEffect(() => {
    setCharCount(content.length);
  }, [content]);

  useEffect(() => {
    if (isReadOnly) {
      onCanSave?.(false);
      return;
    }

    const canSaveNow = charCount >= minCharCount;
    onCanSave?.(canSaveNow);
  }, [charCount, isReadOnly, minCharCount, onCanSave]);

  useEffect(() => {
    if (isReadOnly) {
      setRemainingTime(1800);
      return;
    }

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
  }, [isReadOnly]);

  const handleContentChange = (e) => {
    if (isReadOnly) {
      return;
    }

    const newContent = e.target.value;
    
    if (newContent.length < content.length) {
      onError?.(ERROR_MESSAGE.DELETE_TEXT_FAIL);
      return;
    }
    
    onContentChange?.(newContent);
  };

  const handleTitleChange = (e) => {
    if (isReadOnly) {
      return;
    }

    onTitleChange?.(e.target.value);
  };

  const handleContentDelete = (e) => {
    if (isReadOnly) {
      return;
    }

    if(e.key === 'Backspace' || e.key === 'Delete') {
      e.preventDefault();
      onError?.(ERROR_MESSAGE.DELETE_TEXT_FAIL);
    }
  };

  const handleSave = () => {
    if (isReadOnly) {
      return;
    }

    if (canSave) {
      onSave?.();
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const formatSavedAt = (timestamp) => {
    if (!timestamp) {
      return '저장 이력이 없습니다';
    }

    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) {
      return '저장 이력이 없습니다';
    }

    return date.toLocaleString();
  };

  return (
    <div className="editor-panel">
      <div className="editor-header">
        <input
          type="text"
          className={`editor-title ${isReadOnly ? 'read-only' : ''}`}
          value={title}
          onChange={handleTitleChange}
          placeholder="제목을 입력하세요"
          disabled={isReadOnly}
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
          className={`editor-textarea ${isReadOnly ? 'read-only' : ''}`}
          value={content}
          onChange={handleContentChange}
          onKeyDown={handleContentDelete}
          placeholder="글을 작성하세요..."
          readOnly={isReadOnly}
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
          {isReadOnly ? (
            <span className="saved-time">{formatSavedAt(savedAt)}</span>
          ) : (
            <span className="timer">{formatTime(remainingTime)}</span>
          )}
          <button 
            className="save-button" 
            disabled={isReadOnly || !canSave}
            onClick={handleSave}
          >
            {isReadOnly ? '읽기 전용' : '저장'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditorPanel;
