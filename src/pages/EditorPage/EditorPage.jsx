import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/common/Header/Header';
import TabNavigation from '../../components/common/TabNavigation/TabNavigation';
import FileTree from '../../components/editor/FileTree/FileTree';
import EditorPanel from '../../components/editor/EditorPanel/EditorPanel';
import PreviewPanel from '../../components/editor/PreviewPanel/PreviewPanel';
import Resizer from '../../components/common/Resizer/Resizer';
import ToastContainer from '../../components/common/Message/ToastContainer';
import useToast from '../../hooks/useToast';
import { useAuthStore } from '../../store/authStore';
import { useFileStore } from '../../store/fileStore';
import { GitHubFileService } from '../../services/githubFileService';
import { createTitle } from '../../utils/dateTitleFormatter';
import './EditorPage.css';

const EDITOR_MODE = Object.freeze({
  EDITABLE: 'editable',
  READ_ONLY: 'readOnly',
});

const EditorPage = () => {
  const navigate = useNavigate();
  const { user, token, owner, repo, isAuthenticated } = useAuthStore();
  const { 
    setFiles: setFileStore, 
    getAllFiles, 
    findFileByDate, 
    getFile, 
    updateFile, 
    addFile 
  } = useFileStore();
  const { toasts, showError, showInfo, removeToast } = useToast();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [canSave, setCanSave] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [fileTreeWidth, setFileTreeWidth] = useState(250);
  const [previewWidth, setPreviewWidth] = useState(400);
  const [selectedFile, setSelectedFile] = useState(null);
  const [expandedFolders, setExpandedFolders] = useState([]);
  const [todayFilePath, setTodayFilePath] = useState('');
  const [todayDatePrefix, setTodayDatePrefix] = useState('');
  const [editorMode, setEditorMode] = useState(EDITOR_MODE.EDITABLE);
  const [lastSavedAt, setLastSavedAt] = useState(null);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  
  // fileStore에서 파일 목록 가져오기
  const files = getAllFiles();

  useEffect(() => {
    if (!isAuthenticated || !token) {
      navigate('/login');
      return;
    }

    const loadFiles = async () => {
      setIsLoadingFiles(true);
      try {
        const fileService = new GitHubFileService(token, owner, repo);
        const mdFiles = await fileService.fetchAllMarkdownFiles();
        
        // fileStore에 GithubFile[] 저장
        setFileStore(mdFiles);
        
        const { monthFolder, weekFolder, today, filePath } = createTitle();

        const foldersToExpand = [
          monthFolder,
          `${monthFolder}/${weekFolder}`
        ];
        setExpandedFolders(foldersToExpand);
        setTodayFilePath(filePath);
        setTodayDatePrefix(today);
        
        // fileStore에서 오늘 파일 찾기 (날짜로)
        const todayFile = findFileByDate(today);
        
        if (todayFile) {
          // 오늘 파일이 있으면 선택
          await handleFileSelect(todayFile);
        } else {
          // 오늘 파일이 없으면 draft 생성
          const fileName = `${today}.md`;
          const newFile = {
              name: fileName,
              path: filePath,
              sha: null,  // sha가 없으면 draft
              downloadUrl: null,
              content: null,
              savedAt: null
          };
          
          // fileStore에 draft 추가
          addFile(newFile);
          await handleFileSelect(newFile);
        }
      } catch (error) {
        console.error('Failed to load files:', error);
        showError('파일 목록을 불러오는데 실패했습니다.');
      } finally {
        setIsLoadingFiles(false);
      }
    };

    loadFiles();
  }, [isAuthenticated, token, owner, repo, navigate, showError]);

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

  const setEditorState = ({ mode, title, content, savedAt }) => {
    setEditorMode(mode);
    setTitle(title);
    setContent(content);
    setLastSavedAt(savedAt);
  };

  const handleFileSelect = async (file) => {
    setSelectedFile(file);
    
    if (!file.sha) {
      setEditorState({
        mode: EDITOR_MODE.EDITABLE,
        title: file.path.replace('.md', ' '),
        content: '',
        savedAt: null
      });
      return;
    }

    const cachedFile = getFile(file.path);
    if (cachedFile?.content) {
      setEditorState({
        mode: EDITOR_MODE.READ_ONLY,
        title: file.path.replace('.md', ''),
        content: cachedFile.content,
        savedAt: cachedFile.savedAt || null
      });
      return;
    }

    try {
      const fileService = new GitHubFileService(token, owner, repo);
      const fileWithContent = await fileService.fetchFileContent(file.path);
      const lastCommit = await fileService.getLastCommitTime(file.path);

      updateFile(file.path, {
        content: fileWithContent.content,
        savedAt: lastCommit
      });
      
      setEditorState({
        mode: EDITOR_MODE.READ_ONLY,
        title: file.path.replace('.md', ''),
        content: fileWithContent.content,
        savedAt: lastCommit
      });
    } catch (error) {
      console.error('Failed to load file:', error);
      showError('파일을 불러오는데 실패했습니다.');
    }
  };

  const handleSave = async (force = false) => {
    // 강제 저장이 아니고 저장 불가능 상태면 리턴
    if (!force && !canSave) return;
    
    showInfo('저장 중...');
    
    try {
      const fileService = new GitHubFileService(token, owner, repo);
      
      // 제목 trim 처리
      const trimmedTitle = title.trim();
      const finalFilePath = `${trimmedTitle}.md`;
      const commitMessage = `Add morning page: ${trimmedTitle}`;
      
      // 파일 저장 (신규 또는 업데이트)
      const sha = selectedFile?.sha || null;
      const response = await fileService.saveFile(finalFilePath, content, commitMessage, sha);
      
      const savedAt = new Date().toISOString();
      const fileName = finalFilePath.split('/').pop();
      
      // fileStore에 파일 추가/업데이트
      const savedFileData = {
        name: fileName,
        path: finalFilePath,
        sha: response?.content?.sha || 'saved',
        content: content,
        savedAt: savedAt,
        downloadUrl: response?.content?.download_url || null
      };
      
      // 경로가 변경되었으면 (draft → 실제 파일명) 기존 파일 제거 후 새로 추가
      if (selectedFile.path !== finalFilePath) {
        const { removeFile } = useFileStore.getState();
        removeFile(selectedFile.path);
        addFile(savedFileData);
      } else {
        // 경로가 같으면 업데이트
        updateFile(finalFilePath, savedFileData);
      }
      
      // UI 상태 업데이트
      setLastSavedAt(savedAt);
      setEditorMode(EDITOR_MODE.READ_ONLY);
      setCanSave(false);
      
      // selectedFile 업데이트
      setSelectedFile({ ...selectedFile, name: fileName, path: finalFilePath, sha: savedFileData.sha, savedAt });
      
      showInfo('저장 완료!');
    } catch (error) {
      console.error('Failed to save file:', error);
      showError('파일 저장에 실패했습니다. 페이지를 새로고침합니다.');
      
      // 저장 실패 시 전체 리로드로 데이터 정합성 보장
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    }
  };

  return (
    <div className="editor-page">
      <ToastContainer toasts={toasts} onClose={removeToast} />
      <Header username={user?.name || user?.login || 'User'} repository={repo || 'repository'} />
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
              todayDatePrefix={todayDatePrefix}
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
              isReadOnly={editorMode === EDITOR_MODE.READ_ONLY}
              savedAt={lastSavedAt}
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
