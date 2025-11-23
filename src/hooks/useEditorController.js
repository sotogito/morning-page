import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useFileStore } from '../store/fileStore';
import { GitHubFileService } from '../services/githubFileService';
import { createTodayTitle, createTitle } from '../utils/dateTitleFormatter';
import { buildFileTree, sortTreeDescending } from '../utils/fileTreeUtils';
import { INFO_MESSAGE } from '../constants/InfoMessage';

const EDITOR_MODE = Object.freeze({
  EDITABLE: 'editable',
  READ_ONLY: 'readOnly',
});

const stripMd = (path) => path.replace('.md', '');

const buildFinalFilePath = (title) => {
  const trimmed = title.trim();
  return `${trimmed}.md`;
};

const checkCacheNeeds = (cachedFile) => {
  return {
    needContent: !(cachedFile && cachedFile.content),
    needSavedAt: !(cachedFile && cachedFile.savedAt != null)
  };
};

const mergeResults = (results) => {
  return results.reduce((acc, cur) => ({ ...acc, ...cur }), {});
};

const mergeFileData = (cachedFile, fetched) => {
  return {
    content: fetched.content ?? cachedFile?.content ?? '',
    savedAt: fetched.savedAt ?? cachedFile?.savedAt ?? null
  };
};

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
  const [todayDatePrefix, setTodayDatePrefix] = useState('');
  const [editorMode, setEditorMode] = useState(EDITOR_MODE.EDITABLE);
  const [lastSavedAt, setLastSavedAt] = useState(null);
  
  const files = getAllFiles();

  const fileTree = useMemo(() => {
    if (files.length === 0) return [];
    const builtTree = buildFileTree(files);
    
    return sortTreeDescending(builtTree);
  }, [files]);

  const buildSavedFileData = (filePath, response, content) => {
    const savedAt = new Date().toISOString();
    const fileName = filePath.split('/').pop();

    return {
      fileData: {
        name: fileName,
        path: filePath,
        sha: response?.content?.sha || 'saved',
        content: content,
        savedAt,
        downloadUrl: response?.content?.download_url || null
      },
      savedAt
    };
  };

  const expandFolders = (monthFolder, weekFolder) => {
    const foldersToExpand = [
      monthFolder,
      `${monthFolder}/${weekFolder}`
    ];
    setExpandedFolders(foldersToExpand);
  };

  const setEditorState = ({ mode, title, content, savedAt }) => {
    setEditorMode(mode);
    setTitle(title);
    setContent(content);
    setLastSavedAt(savedAt);
  };

  const fetchMissingFileData = async (path, { needContent, needSavedAt }) => {
    const fileService = new GitHubFileService(token, owner, repo);
    const tasks = [];

    if (needContent) {
      tasks.push(
        fileService.fetchFileContent(path).then(f => {
          updateFile(path, { content: f.content });
          return { content: f.content };
        })
      );
    }

    if (needSavedAt) {
      tasks.push(
        fileService.getLastCommitTime(path).then(t => {
          updateFile(path, { savedAt: t });
          return { savedAt: t };
        })
      );
    }

    const results = await Promise.all(tasks);
    return mergeResults(results);
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

  const updateFileStore = (savedFileData, oldFilePath) => {
    if (oldFilePath !== savedFileData.path) {
      const { removeFile } = useFileStore.getState();
      removeFile(oldFilePath);
      addFile(savedFileData);
    } else {
      updateFile(savedFileData.path, savedFileData);
    }
  };

  const updateEditorState = (savedAt, savedFileData) => {
    setLastSavedAt(savedAt);
    setEditorMode(EDITOR_MODE.READ_ONLY);
    setCanSave(false);

    setSelectedFile((prev) => ({
      ...prev,
      name: savedFileData.name,
      path: savedFileData.path,
      sha: savedFileData.sha,
      savedAt,
    }));
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

  const handleFileSelect = async (file) => {
    setSelectedFile(file);

    const isInitFile = !file.sha;
    if (isInitFile) {
      setEditorState({
        mode: EDITOR_MODE.EDITABLE,
        title: file.path.replace('.md', ' '),
        content: '',
        savedAt: null
      });
      return;
    }

    const cachedFile = getFile(file.path);
    const { needContent, needSavedAt } = checkCacheNeeds(cachedFile);

    const isContainCache = !needContent && !needSavedAt;
    if (isContainCache) {
      setEditorState({
        mode: EDITOR_MODE.READ_ONLY,
        title: stripMd(file.path),
        content: cachedFile.content,
        savedAt: cachedFile.savedAt
      });
      return;
    }

    try {
      const fetched = await fetchMissingFileData(file.path, { needContent, needSavedAt });
      const merged = mergeFileData(cachedFile, fetched);

      setEditorState({
        mode: EDITOR_MODE.READ_ONLY,
        title: stripMd(file.path),
        content: merged.content,
        savedAt: merged.savedAt
      });
    } catch (err) {
      console.error(err);
      showError(err.message);
    }
  };

  const handleSave = async (force = false) => {
    if (!force && !canSave) return;
    
    showInfo(INFO_MESSAGE.SAVING);
    
    try {
      const fileService = new GitHubFileService(token, owner, repo);
    
      const finalFilePath = buildFinalFilePath(title);
      const sha = selectedFile?.sha || null;
      const response = await fileService.saveFile(finalFilePath, content, sha);
      
      const { fileData, savedAt } = buildSavedFileData(finalFilePath, response, content);
      
      updateFileStore(fileData, selectedFile.path);
      updateEditorState(savedAt, fileData);
      
      showInfo(INFO_MESSAGE.SAVE_SUCCESS);
    } catch (error) {
      console.error('Failed to save file:', error);
      showError(error.message);
      
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    }
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
        const { monthFolder, weekFolder, targetDate, filePath } = createTitle();

        expandFolders(monthFolder, weekFolder);
        await processDateSelected(targetDate, filePath);
      }
      setTodayDatePrefix(createTodayTitle());
    };

    loadOrReuseFiles();
  }, [isAuthenticated, token, owner, repo, navigate, showError, location.search]);

  return {
    title,
    content,
    canSave,
    selectedFile,
    expandedFolders,
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
  };

};
