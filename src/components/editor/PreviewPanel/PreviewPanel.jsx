import './PreviewPanel.css';

const PreviewPanel = ({ content = '' }) => {
  // 간단한 마크다운 렌더링 (추후 라이브러리로 교체 가능)
  const renderMarkdown = (text) => {
    if (!text) return '';
    
    // 기본적인 마크다운 변환
    let html = text;
    
    // 헤딩
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
    
    // 볼드
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // 이탤릭
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // 줄바꿈
    html = html.replace(/\n/g, '<br>');
    
    return html;
  };

  return (
    <div className="preview-panel">
      <div className="preview-header">
        <span className="preview-title">미리보기</span>
      </div>
      <div className="preview-content">
        {content ? (
          <div
            className="preview-body"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
          />
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

