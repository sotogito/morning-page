import { create } from 'zustand';

export const useFileStore = create((set, get) => ({
  files: new Map(),   // Map<path, GithubFile>

  setFiles: (githubFiles) => {
    const fileMap = new Map();
    githubFiles.forEach(file => {
      fileMap.set(file.path, file);
    });
    set({ files: fileMap });
  },

  getFile: (path) => {
    return get().files.get(path);
  },

  getAllFiles: () => {
    return Array.from(get().files.values());
  },

  addFile: (githubFile) => {
    set((state) => {
      const newFiles = new Map(state.files);
      newFiles.set(githubFile.path, githubFile);
      return { files: newFiles };
    });
  },

  updateFile: (path, updates) => {
    set((state) => {
      const file = state.files.get(path);
      if (!file) return state;

      const newFiles = new Map(state.files);
      newFiles.set(path, { ...file, ...updates });
      return { files: newFiles };
    });
  },

  removeFile: (path) => {
    set((state) => {
      const newFiles = new Map(state.files);
      newFiles.delete(path);
      return { files: newFiles };
    });
  },

  findFileByDate: (datePrefix) => {
    const files = get().files;
    for (const [path, file] of files) {
      if (file.name.includes(datePrefix)) {
        return file;
      }
    }
    return null;
  },

  clear: () => {
    set({ files: new Map() });
  },
  
}));
