import ReactMarkdown from 'react-markdown';
import remarkBreaks from 'remark-breaks';
import remarkGfm from 'remark-gfm';
import './PreviewPanel.css';

const PreviewPanel = ({ content = '' }) => {

  return (
    <div className="preview-panel">
      <div className="preview-header">
        <span className="preview-title">미리보기</span>
      </div>
      <div className="preview-content">
        {content ? (
          <div className="preview-body">
            <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
              {content}
            </ReactMarkdown>
          </div>
        ) : (
          <div className="preview-empty">
            작성된 내용이 여기에 표시됩니다
          </div>
        )}
      </div>
    </div>
  );
};

export default PreviewPanel;
