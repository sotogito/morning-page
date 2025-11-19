import { useState, useEffect } from 'react';
import './EditorPanel.css';
import { ERROR_MESSAGE } from '../../../constants/ErrorMessage';

const MAX_TITLE_LENGTH = 50;
const MAX_CONTENT_LENGTH = 30000;
const DATE_PREFIX_REGEX = /^.*?\d{4}-\d{2}-\d{2}\s?/;

const extractUserTitle = (value) => {
  const match = value.match(/\d{4}-\d{2}-\d{2}/);
  if (!match) return value;
  return value.slice(match.index + match[0].length).trimStart();
};

const isTitlePrefixIntact = (currentTitle, nextTitle) => {
  const prefixMatch = currentTitle.match(DATE_PREFIX_REGEX);
  if (prefixMatch) {
    const requiredPrefix = prefixMatch[0];
    if (!nextTitle.startsWith(requiredPrefix)) {
      return false;
    }
  }
  return true;
};

const isTitleTooLong = (nextTitle) => {
  const userTitle = extractUserTitle(nextTitle);
  return userTitle.length > MAX_TITLE_LENGTH;
};

const isContentTooLong = (nextContent) => 
  nextContent.length > MAX_CONTENT_LENGTH;

const EditorPanel = ({
  title = '',
  onTitleChange,
  content = '',
  onContentChange,
  canSave = false,
  onCanSave,
  onSave,
  savedAt = null,
  isReadOnly = false,
  showPreview = false,
  onTogglePreview,
  onError,
}) => {
  const [charCount, setCharCount] = useState(0);
  const minCharCount = 1000;

  useEffect(() => {
    setCharCount(content?.length || 0);
  }, [content]);

  useEffect(() => {
    if (isReadOnly) {
      onCanSave?.(false);
      return;
    }

    const canSaveNow = charCount >= minCharCount;
    onCanSave?.(canSaveNow);
  }, [charCount, isReadOnly, minCharCount, onCanSave]);

  const handleContentChange = (e) => {
    if (isReadOnly) {
      return;
    }

    const newContent = e.target.value;
    if (isContentTooLong(newContent)) {
      onError?.(ERROR_MESSAGE.CONTENT_LIMIT_EXCEEDED(MAX_CONTENT_LENGTH));
      return;
    }
    onContentChange?.(newContent);
  };

  const handleTitleChange = (e) => {
    if (isReadOnly) {
      return;
    }

    const newTitle = e.target.value;
    if (!isTitlePrefixIntact(title, newTitle)) {
      onError?.(ERROR_MESSAGE.TITLE_PREFIX_IMMUTABLE);
      return;
    }

    if (isTitleTooLong(newTitle)) {
      onError?.(ERROR_MESSAGE.TITLE_LIMIT_EXCEEDED(MAX_TITLE_LENGTH));
      return;
    }

    onTitleChange?.(newTitle);
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
          value={title || ''}
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
          value={content || ''}
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
          {isReadOnly && (
            <span className="saved-time">{formatSavedAt(savedAt)}</span>
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
