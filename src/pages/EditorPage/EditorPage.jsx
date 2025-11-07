import { useState } from 'react';
import Header from '../../components/common/Header/Header';
import TabNavigation from '../../components/common/TabNavigation/TabNavigation';
import FileTree from '../../components/editor/FileTree/FileTree';
import EditorPanel from '../../components/editor/EditorPanel/EditorPanel';
import PreviewPanel from '../../components/editor/PreviewPanel/PreviewPanel';
import Resizer from '../../components/common/Resizer/Resizer';
import './EditorPage.css';

const EditorPage = () => {
  const [content, setContent] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [fileTreeWidth, setFileTreeWidth] = useState(250);
  const [previewWidth, setPreviewWidth] = useState(400);

  // 더미 데이터
  const dummyFiles = [
    {
      name: '2024',
      type: 'folder',
      path: '2024',
      children: [
        {
          name: '2024-01-15 아침의 생각.md',
          type: 'file',
          path: '2024/2024-01-15.md'
        },
        {
          name: '2024-01-16 새로운 시작.md',
          type: 'file',
          path: '2024/2024-01-16.md'
        }
      ]
    },
    {
      name: '2024-11-06 오늘의 글.md',
      type: 'file',
      path: '2024-11-06.md'
    }
  ];

  const handleContentChange = (newContent) => {
    setContent(newContent);
  };

  const handleTogglePreview = () => {
    setShowPreview(!showPreview);
  };

  const handleFileTreeResize = (delta) => {
    setFileTreeWidth(prev => Math.max(200, Math.min(500, prev + delta)));
  };

  const handlePreviewResize = (delta) => {
    setPreviewWidth(prev => Math.max(300, Math.min(800, prev - delta)));
  };

  const handleFileSelect = (file) => {
    console.log('Selected file:', file);
    // TODO: 파일 내용 로드
  };

  return (
    <div className="editor-page">
      <Header username="username" repository="morningpage" />
      <TabNavigation />
      
      <div className="editor-page-content">
        <div className="editor-layout">
          <div className="file-tree-container" style={{ width: `${fileTreeWidth}px` }}>
            <FileTree files={dummyFiles} onFileSelect={handleFileSelect} />
          </div>
          
          <Resizer onResize={handleFileTreeResize} direction="horizontal" />
          
          <div className="editor-container">
            <EditorPanel
              content={content}
              onChange={handleContentChange}
              onTogglePreview={handleTogglePreview}
              showPreview={showPreview}
            />
          </div>

          {showPreview && (
            <>
              <Resizer onResize={handlePreviewResize} direction="horizontal" />
              <div className="preview-container" style={{ width: `${previewWidth}px` }}>
                <PreviewPanel content={content} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditorPage;

