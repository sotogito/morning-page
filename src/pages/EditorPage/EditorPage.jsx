import { useState, useEffect } from 'react';
import Header from '../../components/common/Header/Header';
import TabNavigation from '../../components/common/TabNavigation/TabNavigation';
import FileTree from '../../components/editor/FileTree/FileTree';
import EditorPanel from '../../components/editor/EditorPanel/EditorPanel';
import PreviewPanel from '../../components/editor/PreviewPanel/PreviewPanel';
import Resizer from '../../components/common/Resizer/Resizer';
import ToastContainer from '../../components/common/Message/ToastContainer';
import useToast from '../../hooks/useToast';
import { createTitle } from '../../utils/dateTitleFormatter';
import './EditorPage.css';

const EditorPage = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [fileTreeWidth, setFileTreeWidth] = useState(250);
  const [previewWidth, setPreviewWidth] = useState(400);
  const [selectedFile, setSelectedFile] = useState(null);
  const { toasts, showError, showInfo, removeToast } = useToast();

  // 페이지 로드 시 제목 생성 (나중에 GitHub 확인 로직 추가 예정)
  useEffect(() => {
    // TODO: GitHub에서 파일 목록 불러오기
    // TODO: 오늘 날짜 파일 있는지 확인
    // TODO: 없으면 제목 생성 + FileTree에 추가
    
    const todayTitle = createTitle();
    setTitle(todayTitle);
  }, []);

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
          name: '2025-11-08 새로운 시작.md',
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

  const handleTitleChange = (newTitle) => {
    setTitle(newTitle);
  };

  const handleTogglePreview = () => {
    setShowPreview(!showPreview);
  };

  const handleInfoMessage = (message) => {
    showInfo(message);
  };

  const handleErrorMessage = (message) => {
    showError(message);
  };

  const handleFileTreeResize = (delta) => {
    setFileTreeWidth(prev => Math.max(200, Math.min(500, prev + delta)));
  };

  const handlePreviewResize = (delta) => {
    setPreviewWidth(prev => Math.max(300, Math.min(800, prev - delta)));
  };

  const handleFileSelect = (file) => {
    setSelectedFile(file);
    console.log('Selected file:', file);
    // TODO: 파일 내용 로드
  };

  return (
    <div className="editor-page">
      <ToastContainer toasts={toasts} onClose={removeToast} />
      <Header username="username" repository="morningpage" />
      <TabNavigation />
      
      <div className="editor-page-content">
        <div className="editor-layout">
          <div className="file-tree-container" style={{ width: `${fileTreeWidth}px` }}>
            <FileTree 
              files={dummyFiles} 
              onFileSelect={handleFileSelect}
              selectedFile={selectedFile}
            />
          </div>
          
          <Resizer onResize={handleFileTreeResize} direction="horizontal" />
          
          <div className="editor-container">
            <EditorPanel
              title={title}
              onTitleChange={handleTitleChange}
              content={content}
              onChange={handleContentChange}
              onTogglePreview={handleTogglePreview}
              showPreview={showPreview}
              onError={handleErrorMessage}
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
