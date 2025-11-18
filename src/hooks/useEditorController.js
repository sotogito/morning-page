import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useFileStore } from '../store/fileStore';
import { GitHubFileService } from '../services/githubFileService';
import { createTitle } from '../utils/dateTitleFormatter';
import { buildFileTree, sortTreeDescending } from '../utils/fileTreeUtils';
import { INFO_MESSAGE } from '../constants/InfoMessage';

const EDITOR_MODE = Object.freeze({
  EDITABLE: 'editable',
  READ_ONLY: 'readOnly',
});

export const useEditorController = ({ showError, showInfo }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { token, owner, repo, isAuthenticated } = useAuthStore();
  const { 
    setFiles: setFileStore, 
    getAllFiles, 
    findFileByDate, 
    getFile, 
    updateFile, 
    addFile 
  } = useFileStore();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [canSave, setCanSave] = useState(false);
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
  };

  const createTodayContext = () => {
    const { monthFolder, weekFolder, today, filePath } = createTitle();
    expandFolders(monthFolder, weekFolder);
    setTodayFilePath(filePath);
    setTodayDatePrefix(today);
    return { today, filePath };
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

  const handleSave = async (force = false) => {
    if (!force && !canSave) return;
    
    showInfo(INFO_MESSAGE.SAVING);
    
    try {
      const fileService = new GitHubFileService(token, owner, repo);
      
      const trimmedTitle = title.trim();
      const finalFilePath = `${trimmedTitle}.md`;
      
      const sha = selectedFile?.sha || null;
      const response = await fileService.saveFile(finalFilePath, content, sha);
      
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
      
      setSelectedFile({ 
        ...selectedFile, 
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

  const handleContentChange = (newContent) => {
    setContent(newContent);
  };

  const handleTitleChange = (newTitle) => {
    setTitle(newTitle);
  };

  const handleCanSaveChange = (canSave) => {
    setCanSave(canSave);
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

  return {
    title,
    content,
    canSave,
    selectedFile,
    expandedFolders,
    todayFilePath,
    todayDatePrefix,
    editorMode,
    lastSavedAt,
    fileTree,
    isReadOnly: editorMode === EDITOR_MODE.READ_ONLY,
  
    handleFileSelect,
    handleSave,
    handleContentChange,
    handleTitleChange,
    handleCanSaveChange,
  }
  
};
