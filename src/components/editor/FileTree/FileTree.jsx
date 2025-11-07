import { useState } from 'react';
import './FileTree.css';

const FileTree = ({ files = [], onFileSelect }) => {
  const [expandedFolders, setExpandedFolders] = useState(new Set());

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
      
      return (
        <div key={index} className="tree-item-container">
          <div
            className={`tree-item ${!isFolder ? 'file' : ''}`}
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
            <span className="tree-name">{item.name}</span>
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
        {files.length > 0 ? (
          renderFileTree(files)
        ) : (
          <div className="file-tree-empty">파일이 없습니다</div>
        )}
      </div>
    </div>
  );
};

export default FileTree;

