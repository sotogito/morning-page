import { useState, useEffect } from 'react';
import './FileTree.css';

const buildFileTree = (files) => {
  const tree = [];
  const folderMap = new Map();

  files.forEach(file => {
    const parts = file.path.split('/');
    const fileName = parts.pop();
    
    let currentLevel = tree;
    let currentPath = '';

    parts.forEach(folderName => {
      currentPath = currentPath ? `${currentPath}/${folderName}` : folderName;

      let folder = folderMap.get(currentPath);
      
      if (!folder) {
        folder = {
          name: folderName,
          type: 'folder',
          path: currentPath,
          children: [],
        };
        folderMap.set(currentPath, folder);
        currentLevel.push(folder);
      }

      currentLevel = folder.children;
    });

    currentLevel.push({
      name: fileName,
      type: 'file',
      path: file.path,
      sha: file.sha,
      savedAt: file.savedAt,
    });
  });

  return tree;
};

const sortTreeDescending = (nodes) => {
  const sorted = [...nodes].sort((a, b) => b.name.localeCompare(a.name, 'ko-KR'));

  return sorted.map(node => ({
    ...node,
    children: node.children ? sortTreeDescending(node.children) : node.children
  }));
};

const FileTree = ({ 
  files = [],  // GithubFile[] - 평면 배열
  onFileSelect, 
  selectedFile = null,
  initialExpandedFolders = [],
  todayFilePath = '',
  todayDatePrefix = ''
}) => {
  const [tree, setTree] = useState([]);
  const [expandedFolders, setExpandedFolders] = useState(new Set(initialExpandedFolders));

  // files 배열이 변경되면 트리 재생성
  useEffect(() => {
    if (files.length > 0) {
      const builtTree = buildFileTree(files);
      const sortedTree = sortTreeDescending(builtTree);
      setTree(sortedTree);
    } else {
      setTree([]);
    }
  }, [files]);

  useEffect(() => {
    if (initialExpandedFolders.length > 0) {
      setExpandedFolders(new Set(initialExpandedFolders));
    }
  }, [initialExpandedFolders]);

  const toggleFolder = (folderPath) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderPath)) {
      newExpanded.delete(folderPath);
    } else {
      newExpanded.add(folderPath);
    }
    setExpandedFolders(newExpanded);
  };

  const renderFileTree = (items, depth = 0) => {
    return items.map((item, index) => {
      const isFolder = item.type === 'folder';
      const isExpanded = expandedFolders.has(item.path);
      const isSelected = !isFolder && selectedFile?.path === item.path;
      const isToday = !isFolder && (
        (todayFilePath && item.path === todayFilePath) ||
        (todayDatePrefix && item.name.startsWith(todayDatePrefix))
      );
      const displayName = isFolder ? item.name : item.name.replace(/\.md$/, '');
      
      return (
        <div key={index} className="tree-item-container">
          <div
            className={`tree-item ${!isFolder ? 'file' : ''} ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''}`}
            style={{ paddingLeft: `${depth * 16 + 8}px` }}
            onClick={() => {
              if (isFolder) {
                toggleFolder(item.path);
              } else {
                onFileSelect?.(item);
              }
            }}
          >
            <span className="tree-icon">
              {isFolder ? (isExpanded ? '▼' : '▶') : '📄'}
            </span>
            <span className="tree-name">{displayName}</span>
          </div>
          {isFolder && isExpanded && item.children && (
            <div className="tree-children">
              {renderFileTree(item.children, depth + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div className="file-tree">
      <div className="file-tree-header">
        <span className="file-tree-title">파일</span>
      </div>
      <div className="file-tree-content">
        {tree.length > 0 ? (
          renderFileTree(tree)
        ) : (
          <div className="file-tree-empty">파일이 없습니다</div>
        )}
      </div>
    </div>
  );
};

export default FileTree;
