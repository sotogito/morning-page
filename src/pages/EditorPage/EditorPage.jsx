import { useState } from 'react';
import Header from '../../components/common/Header/Header';
import TabNavigation from '../../components/common/TabNavigation/TabNavigation';
import FileTree from '../../components/editor/FileTree/FileTree';
import EditorPanel from '../../components/editor/EditorPanel/EditorPanel';
import PreviewPanel from '../../components/editor/PreviewPanel/PreviewPanel';
import Resizer from '../../components/common/Resizer/Resizer';
import ToastContainer from '../../components/common/Message/ToastContainer';
import useToast from '../../hooks/useToast';
import { useEditorController } from '../../hooks/useEditorController';
import { useAuthStore } from '../../store/authStore';
import './EditorPage.css';

const EditorPage = () => {
  const { user, repo } = useAuthStore();
  const { toasts, showError, showInfo, removeToast } = useToast();
  
  const editorController = useEditorController({ showError, showInfo });
  
  const [showPreview, setShowPreview] = useState(false);
  const [fileTreeWidth, setFileTreeWidth] = useState(250);
  const [previewWidth, setPreviewWidth] = useState(400);

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

  return (
    <div className="editor-page">
      <ToastContainer toasts={toasts} onClose={removeToast} />
      <Header username={user?.name || user?.login || 'User'} repository={repo || 'repository'} />
      <TabNavigation />
      
      <div className="editor-page-content">
        <div className="editor-layout">
          <div className="file-tree-container" style={{ width: `${fileTreeWidth}px` }}>
            <FileTree 
              tree={editorController.fileTree} 
              onFileSelect={editorController.handleFileSelect}
              selectedFile={editorController.selectedFile}
              initialExpandedFolders={editorController.expandedFolders}
              todayFilePath={editorController.todayFilePath}
              todayDatePrefix={editorController.todayDatePrefix}
            />
          </div>
          
          <Resizer onResize={handleFileTreeResize} direction="horizontal" />
          
          <div className="editor-container">
            <EditorPanel
              title={editorController.title}
              onTitleChange={editorController.handleTitleChange}
              content={editorController.content}
              onContentChange={editorController.handleContentChange}
              canSave={editorController.canSave}
              onCanSave={editorController.handleCanSaveChange}
              onSave={editorController.handleSave}
              savedAt={editorController.lastSavedAt}
              isReadOnly={editorController.isReadOnly}
              showPreview={showPreview}
              onTogglePreview={handleTogglePreview}
              onError={handleErrorMessage}
            />
          </div>

          {showPreview && (
            <>
              <Resizer onResize={handlePreviewResize} direction="horizontal" />
              <div className="preview-container" style={{ width: `${previewWidth}px` }}>
                <PreviewPanel content={editorController.content} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditorPage;
