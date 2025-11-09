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
  const [canSave, setCanSave] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [fileTreeWidth, setFileTreeWidth] = useState(250);
  const [previewWidth, setPreviewWidth] = useState(400);
  const [selectedFile, setSelectedFile] = useState(null);
  const [expandedFolders, setExpandedFolders] = useState([]);
  const [todayFilePath, setTodayFilePath] = useState('');
  const { toasts, showError, showInfo, removeToast } = useToast();

  // 더미 데이터 (초기값)
  const initialFiles = [
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

  const [files, setFiles] = useState(initialFiles);

  // 페이지 로드 시 오늘 날짜 파일 확인 및 생성
  useEffect(() => {
    // TODO: GitHub에서 파일 목록 불러오기
    // TODO: 오늘 날짜 파일 있는지 확인
    
    // 현재는 오늘 파일이 없다고 가정하고 생성
    const todayTitle = createTitle();
    setTitle(todayTitle);

    // 제목에서 경로 파싱: "11월/2째주/2025-11-08 "
    const parts = todayTitle.trim().split('/');
    const monthFolder = parts[0]; // "11월"
    const weekFolder = parts[1];  // "2째주"
    const dateStr = parts[2];     // "2025-11-08"
    const fileName = `${dateStr}.md`;
    const filePath = `${monthFolder}/${weekFolder}/${fileName}`;
    
    // 오늘 파일 경로 저장
    setTodayFilePath(filePath);

    const foldersToExpand = [
      monthFolder,
      `${monthFolder}/${weekFolder}`
    ];
    setExpandedFolders(foldersToExpand);

    // 파일 추가 로직
    setFiles(prevFiles => {
      const newFiles = [...prevFiles];
      
      // 월 폴더 찾기 또는 생성
      let monthNode = newFiles.find(node => node.name === monthFolder && node.type === 'folder');
      if (!monthNode) {
        monthNode = {
          name: monthFolder,
          type: 'folder',
          path: monthFolder,
          children: []
        };
        newFiles.push(monthNode);
      }

      // 주차 폴더 찾기 또는 생성
      let weekNode = monthNode.children.find(node => node.name === weekFolder && node.type === 'folder');
      if (!weekNode) {
        weekNode = {
          name: weekFolder,
          type: 'folder',
          path: `${monthFolder}/${weekFolder}`,
          children: []
        };
        monthNode.children.push(weekNode);
      }

      // 오늘 파일이 이미 있는지 확인
      const fileExists = weekNode.children.some(node => node.name === fileName);
      if (!fileExists) {
        // 오늘 파일 추가 (임시 파일)
        const newFile = {
          name: fileName,
          type: 'file',
          path: filePath,
          isDraft: true
        };
        weekNode.children.push(newFile);
        
        // 생성한 파일을 자동 선택
        setSelectedFile(newFile);
      }

      return newFiles;
    });
  }, []);

  const handleContentChange = (newContent) => {
    setContent(newContent);
  };

  const handleTitleChange = (newTitle) => {
    setTitle(newTitle);
  };

  const handleCanSaveChange = (canSave) => {
    setCanSave(canSave);
  }

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

  const handleSave = () => {
    // TODO: GitHub에 파일 저장 로직
    console.log('Saving...', { title, content });
    showInfo('저장 중...');
    
    // 저장 후 처리
    // setIsReadOnly(true); // 나중에 읽기 전용 기능 추가 시
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
              files={files} 
              onFileSelect={handleFileSelect}
              selectedFile={selectedFile}
              initialExpandedFolders={expandedFolders}
              todayFilePath={todayFilePath}
            />
          </div>
          
          <Resizer onResize={handleFileTreeResize} direction="horizontal" />
          
          <div className="editor-container">
            <EditorPanel
              title={title}
              onTitleChange={handleTitleChange}
              content={content}
              onContentChange={handleContentChange}
              onCanSave={handleCanSaveChange}
              onTogglePreview={handleTogglePreview}
              showPreview={showPreview}
              onError={handleErrorMessage}
              onInfo={handleInfoMessage}
              onSave={handleSave}
              canSave={canSave}
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
