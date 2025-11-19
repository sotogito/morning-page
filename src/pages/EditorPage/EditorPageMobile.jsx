import { useState } from 'react';
import Header from '../../components/common/Header/Header';
import TabNavigation from '../../components/common/TabNavigation/TabNavigation';
import ToastContainer from '../../components/common/Message/ToastContainer';
import FileTree from '../../components/editor/FileTree/FileTree';
import EditorPanel from '../../components/editor/EditorPanel/EditorPanel';
import useToast from '../../hooks/useToast';
import { useEditorController } from '../../hooks/useEditorController';
import { useAuthStore } from '../../store/authStore';
import './EditorPage.css';

const EditorPageMobile = () => {
  const { user, repo } = useAuthStore();
  const { toasts, showError, showInfo, removeToast } = useToast();
  const editor = useEditorController({ showError, showInfo });

  const [isFileTreeOpen, setIsFileTreeOpen] = useState(false);

  const handleFileSelect = async (file) => {
    await editor.handleFileSelect(file);
    setIsFileTreeOpen(false);
  };

  return (
    <div className="editor-page editor-page-mobile">
      <ToastContainer toasts={toasts} onClose={removeToast} />
      <Header username={user?.name || user?.login || 'User'} repository={repo || 'repository'} />
      <TabNavigation />

      <div className="editor-mobile-body">
        <EditorPanel
          title={editor.title}
          onTitleChange={editor.handleTitleChange}
          content={editor.content}
          onContentChange={editor.handleContentChange}
          canSave={editor.canSave}
          onCanSave={editor.handleCanSaveChange}
          onSave={editor.handleSave}
          savedAt={editor.lastSavedAt}
          isReadOnly={editor.isReadOnly}
          showPreview={false}
          onTogglePreview={() => {}}
          onError={showError}
        />
        <button
          className="editor-floating-file-button"
          type="button"
          onClick={() => setIsFileTreeOpen(true)}
        >
          파일
        </button>
      </div>

      {isFileTreeOpen && (
        <>
          <div className="mobile-filetree-sheet">
            <div className="mobile-filetree-header">
              <span>파일 탐색</span>
              <button
                className="mobile-filetree-close"
                type="button"
                onClick={() => setIsFileTreeOpen(false)}
              >
                닫기
              </button>
            </div>
            <div className="mobile-filetree-body">
              <FileTree
                tree={editor.fileTree}
                onFileSelect={handleFileSelect}
                selectedFile={editor.selectedFile}
                initialExpandedFolders={editor.expandedFolders}
                todayDatePrefix={editor.todayDatePrefix}
              />
            </div>
          </div>
          <div
            className="mobile-filetree-backdrop"
            onClick={() => setIsFileTreeOpen(false)}
          />
        </>
      )}
    </div>
  );
};

export default EditorPageMobile;
