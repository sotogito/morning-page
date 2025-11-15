import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../../components/common/Header/Header';
import TabNavigation from '../../components/common/TabNavigation/TabNavigation';
import FileTree from '../../components/editor/FileTree/FileTree';
import EditorPanel from '../../components/editor/EditorPanel/EditorPanel';
import PreviewPanel from '../../components/editor/PreviewPanel/PreviewPanel';
import Resizer from '../../components/common/Resizer/Resizer';
import ToastContainer from '../../components/common/Message/ToastContainer';
import useToast from '../../hooks/useToast';
import { INFO_MESSAGE } from '../../constants/InfoMessage';
import { useAuthStore } from '../../store/authStore';
import { useFileStore } from '../../store/fileStore';
import { GitHubFileService } from '../../services/githubFileService';
import { createTitle } from '../../utils/dateTitleFormatter';
import { buildFileTree, sortTreeDescending } from '../../utils/fileTreeUtils';
import './EditorPage.css';

const EDITOR_MODE = Object.freeze({
  EDITABLE: 'editable',
  READ_ONLY: 'readOnly',
});

const EditorPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
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
  const files = getAllFiles();

  const fileTree = useMemo(() => {
    if (files.length === 0) return [];
    const builtTree = buildFileTree(files);
    
    return sortTreeDescending(builtTree);
  }, [files]);

  const expandFolders = (monthFolder, weekFolder) => {
    const foldersToExpand = [
      monthFolder,
      `${monthFolder}/${weekFolder}`
    ];
    setExpandedFolders(foldersToExpand);
  }

  const createTodayContext = () => {
    const { monthFolder, weekFolder, today, filePath } = createTitle();

    expandFolders(monthFolder, weekFolder);
    setTodayFilePath(filePath);
    setTodayDatePrefix(today);

    return { today, filePath };
  };

  const processDateSelected = async (dateStr, filePath) => {
    const file = findFileByDate(dateStr);
    if (file) {
      await handleFileSelect(file);
      return;
    }

    const newFile = {
      name: `${dateStr}.md`,
      path: filePath,
      sha: null,
      downloadUrl: null,
      content: null,
      savedAt: null
    };
    addFile(newFile);
    await handleFileSelect(newFile);
  };

  useEffect(() => {
    if (!isAuthenticated || !token) {
      navigate('/login');
      return;
    }

    const loadOrReuseFiles = async () => {
      const existingFiles = getAllFiles();
      const params = new URLSearchParams(location.search);
      const paramDate = params.get('date');

      if (existingFiles && existingFiles.length <= 0) {
        try {
          const fileService = new GitHubFileService(token, owner, repo);
          const mdFiles = await fileService.fetchAllMarkdownFiles();

          setFileStore(mdFiles);
        } catch (error) {
          console.error('Failed to load files:', error);
          showError(error.message);
          navigate('/login');
          return;
        }
      }

      if (paramDate) {
        const dateObj = new Date(paramDate);
        const { monthFolder, weekFolder, filePath } = createTitle(dateObj);
        expandFolders(monthFolder, weekFolder);
        await processDateSelected(paramDate, filePath);
      } else {
        const context = createTodayContext();
        await processDateSelected(context.today, context.filePath);
      }
    };

    loadOrReuseFiles();
  }, [isAuthenticated, token, owner, repo, navigate, showError, location.search]);

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
    const needContent = !(cachedFile && cachedFile.content);
    const needSavedAt = !(cachedFile && cachedFile.savedAt != null);

    if (!needContent && !needSavedAt) {
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
      const tasks = [];
      if (needContent) {
        tasks.push(
          fileService.fetchFileContent(file.path).then(f => {
            updateFile(file.path, { content: f.content });
            return { content: f.content };
          })
        );
      }
      if (needSavedAt) {
        tasks.push(
          fileService.getLastCommitTime(file.path).then(lastCommit => {
            updateFile(file.path, { savedAt: lastCommit });
            return { savedAt: lastCommit };
          })
        );
      }
      const results = await Promise.all(tasks);
      const merged = results.reduce((acc, cur) => ({ ...acc, ...cur }), {});

      setEditorState({
        mode: EDITOR_MODE.READ_ONLY,
        title: file.path.replace('.md', ''),
        content: merged.content ?? cachedFile?.content ?? '',
        savedAt: merged.savedAt ?? cachedFile?.savedAt ?? null
      });
    } catch (error) {
      console.error('Failed to load file:', error);
      showError(error.message);
    }
  };

  const handleSave = async (force = false) => {
    if (!force && !canSave) return;
    
    showInfo(INFO_MESSAGE.SAVING);
    
    try {
      const fileService = new GitHubFileService(token, owner, repo);
      
      const trimmedTitle = title.trim();
      const finalFilePath = `${trimmedTitle}.md`;
      const commitMessage = `Add morning page: ${trimmedTitle}`;
      
      const sha = selectedFile?.sha || null;
      const response = await fileService.saveFile(finalFilePath, content, commitMessage, sha);
      
      const savedAt = new Date().toISOString();
      const fileName = finalFilePath.split('/').pop();
      
      const savedFileData = {
        name: fileName,
        path: finalFilePath,
        sha: response?.content?.sha || 'saved',
        content: content,
        savedAt: savedAt,
        downloadUrl: response?.content?.download_url || null
      };
      
      if (selectedFile.path !== finalFilePath) {
        const { removeFile } = useFileStore.getState();
        removeFile(selectedFile.path);
        addFile(savedFileData);
      } else {
        updateFile(finalFilePath, savedFileData);
      }
      
      setLastSavedAt(savedAt);
      setEditorMode(EDITOR_MODE.READ_ONLY);
      setCanSave(false);
      
      // selectedFile 업데이트
      setSelectedFile({ ...selectedFile, 
        name: fileName, 
        path: finalFilePath, 
        sha: savedFileData.sha, 
        savedAt 
      });
      
      showInfo(INFO_MESSAGE.SAVE_SUCCESS);
    } catch (error) {
      console.error('Failed to save file:', error);
      showError(error.message);
      
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
              tree={fileTree} 
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
              canSave={canSave}
              onCanSave={handleCanSaveChange}
              onSave={handleSave}
              savedAt={lastSavedAt}
              isReadOnly={editorMode === EDITOR_MODE.READ_ONLY}
              showPreview={showPreview}
              onTogglePreview={handleTogglePreview}
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
