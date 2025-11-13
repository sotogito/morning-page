export const buildFileTree = (files) => {
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

export const sortTreeDescending = (nodes) => {
  const sorted = [...nodes].sort((a, b) => b.name.localeCompare(a.name, 'ko-KR'));

  return sorted.map(node => ({
    ...node,
    children: node.children ? sortTreeDescending(node.children) : node.children
  }));
};
