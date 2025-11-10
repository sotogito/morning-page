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
import { GitHubFileService } from '../../services/githubFileService';
import { createTitle } from '../../utils/dateTitleFormatter';
import './EditorPage.css';

const EDITOR_MODE = Object.freeze({
  EDITABLE: 'editable',
  READ_ONLY: 'readOnly',
});

const findFileInTree = (nodes, datePrefix) => {
  for (const node of nodes) {
    if (node.type === 'file' && node.name.includes(datePrefix)) {
      return node;
    }

    if (node.type === 'folder' && node.children?.length) {
      const found = findFileInTree(node.children, datePrefix);
      if (found) return found;
    }
  }

  return null;
};

const cloneTreeNodes = (nodes) =>
  nodes.map(node => ({
    ...node,
    children: node.children ? cloneTreeNodes(node.children) : undefined
  }));

const addFileToTree = (nodes, monthFolder, weekFolder, fileNode) => {
  const tree = cloneTreeNodes(nodes);

  let monthNode = tree.find(node => node.type === 'folder' && node.name === monthFolder);
  if (!monthNode) {
    monthNode = {
      name: monthFolder,
      type: 'folder',
      path: monthFolder,
      children: []
    };
    tree.push(monthNode);
  } else if (!monthNode.children) {
    monthNode.children = [];
  } else {
    monthNode.children = [...monthNode.children];
  }

  const weekPath = `${monthFolder}/${weekFolder}`;
  let weekNode = monthNode.children.find(node => node.type === 'folder' && node.name === weekFolder);
  if (!weekNode) {
    weekNode = {
      name: weekFolder,
      type: 'folder',
      path: weekPath,
      children: []
    };
    monthNode.children.push(weekNode);
  } else if (!weekNode.children) {
    weekNode.children = [];
  } else {
    weekNode.children = [...weekNode.children];
  }

  const exists = weekNode.children.some(node => node.path === fileNode.path);
  if (!exists) {
    weekNode.children.push(fileNode);
  }

  return tree;
};

const EditorPage = () => {
  const navigate = useNavigate();
  const { user, token, owner, repo, isAuthenticated } = useAuthStore();
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
  const [files, setFiles] = useState([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);

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
        const fileTree = fileService.buildFileTree(mdFiles);
        const { monthFolder, weekFolder, today, filePath } = createTitle();

        const foldersToExpand = [
          monthFolder,
          `${monthFolder}/${weekFolder}`
        ];
        setExpandedFolders(foldersToExpand);
        setTodayFilePath(filePath);
        setTodayDatePrefix(today);
        
        // 방금 만든 fileTree에서 오늘 파일 찾기 (날짜로)
        const todayFile = findFileInTree(fileTree, today);
        
        let nextTree = fileTree;

        if (todayFile) {
          await handleFileSelect(todayFile);
        } else {
          const fileName = `${today}.md`;
          const newFile = {
              name: fileName,
              type: 'file',
              path: filePath,
              isDraft: true
          };
          await handleFileSelect(newFile);
          nextTree = addFileToTree(fileTree, monthFolder, weekFolder, newFile);
        }

        setFiles(nextTree);
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

  const handleFileSelect = async (file) => {
    setSelectedFile(file);
    
    if (file.isDraft) {
      setEditorMode(EDITOR_MODE.EDITABLE);
      setTitle(file.path.replace('.md', ' '));
      setContent('');
      setLastSavedAt(null);
      return;
    }

    try {
      const fileService = new GitHubFileService(token, owner, repo);
      const fileWithContent = await fileService.fetchFileContent(file.path);
      const lastCommit = await fileService.getLastCommitTime(file.path);
      
      setEditorMode(EDITOR_MODE.READ_ONLY);
      setTitle(file.path.replace('.md', ''));
      setContent(fileWithContent.content);
      setLastSavedAt(lastCommit);
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
      await fileService.saveFile(finalFilePath, content, commitMessage, sha);
      
      const savedAt = new Date().toISOString();
      setLastSavedAt(savedAt);
      setEditorMode(EDITOR_MODE.READ_ONLY);
      setCanSave(false);
      
      showInfo('저장 완료!');
      
      // 파일 목록 다시 로드
      const mdFiles = await fileService.fetchAllMarkdownFiles();
      const fileTree = fileService.buildFileTree(mdFiles);
      setFiles(fileTree);
    } catch (error) {
      console.error('Failed to save file:', error);
      showError('파일 저장에 실패했습니다.');
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
