import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/common/Header/Header';
import TabNavigation from '../../components/common/TabNavigation/TabNavigation';
import ToastContainer from '../../components/common/Message/ToastContainer';
import { useAuthStore } from '../../store/authStore';
import { useFileStore } from '../../store/fileStore';
import { FavoritesService } from '../../services/favoritesService';
import useToast from '../../hooks/useToast';
import './FavoritesPage.css';

const FavoritesPage = () => {
  const navigate = useNavigate();
  const { user, token, owner, repo, isAuthenticated } = useAuthStore();
  const filesMap = useFileStore(state => state.files);
  const { toasts, showError, showInfo, removeToast } = useToast();
  
  const [favorites, setFavorites] = useState([]);
  const [inputPath, setInputPath] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [sha, setSha] = useState(null);
  const [draggedIndex, setDraggedIndex] = useState(null);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      navigate('/login');
      return;
    }

    const fetchFavorites = async () => {
      try {
        setLoading(true);
        setError(false);

        const favoritesService = new FavoritesService(token, owner, repo);

        const hasMorningPageFolder = await favoritesService.checkMorningPageFolder();
        if (!hasMorningPageFolder) {
          setError(true);
          setLoading(false);
          return;
        }

        const favoritesFile = await favoritesService.fetchFavorites();
        if (favoritesFile) {
          setFavorites(favoritesFile.data.paths || []);
          setSha(favoritesFile.sha);
        }
      } catch (error) {
        console.error('Failed to fetch favorites:', error);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [isAuthenticated, token, owner, repo, navigate]);

  const handleAdd = () => {
    let path = inputPath.trim();
    if (!path) return;
    
    if (!path.endsWith('.md')) {
      path = `${path}.md`;
    }
    
    if (favorites.includes(path)) {
      showError('이미 즐겨찾기에 추가된 파일입니다.');
      return;
    }

    setFavorites([...favorites, path]);
    setInputPath('');
  };

  const handleRemove = (index) => {
    setFavorites(favorites.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    try {
      const validPaths = favorites.filter(path => filesMap.has(path));
      
      if (validPaths.length < favorites.length) {
        const invalidPaths = favorites.filter(path => !filesMap.has(path));
        showError(`존재하지 않는 파일이 있습니다:\n${invalidPaths.join('\n')}`);
        return;
      }

      const favoritesService = new FavoritesService(token, owner, repo);
      const result = await favoritesService.saveFavorites(validPaths, sha);
      
      setSha(result.content.sha);
      setFavorites(validPaths);
      showInfo('즐겨찾기가 저장되었습니다.');
    } catch (error) {
      console.error('Failed to save favorites:', error);
      showError('즐겨찾기 저장에 실패했습니다.');
    }
  };

  const handleFileClick = (path) => {
    const dateMatch = path.match(/(\d{4}-\d{2}-\d{2})/);
    if (dateMatch) {
      navigate(`/editor?date=${dateMatch[1]}`);
    }
  };

  const handleDragStart = (index) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newFavorites = [...favorites];
    const draggedItem = newFavorites[draggedIndex];
    newFavorites.splice(draggedIndex, 1);
    newFavorites.splice(index, 0, draggedItem);

    setFavorites(newFavorites);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  if (loading) {
    return (
      <div className="favorites-page">
        <Header username={user?.name || user?.login || 'User'} repository={repo || 'repository'} />
        <TabNavigation />
        <div className="favorites-page-content">
          <div className="favorites-loading">로딩 중...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="favorites-page">
        <Header username={user?.name || user?.login || 'User'} repository={repo || 'repository'} />
        <TabNavigation />
        <div className="favorites-page-content">
          <div className="favorites-error">
            기능을 사용할 수 없습니다. 모닝페이지 템플릿을 사용해보세요.
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <ToastContainer toasts={toasts} onClose={removeToast} />
      <div className="favorites-page">
        <Header username={user?.name || user?.login || 'User'} repository={repo || 'repository'} />
        <TabNavigation />
        <div className="favorites-page-content">
        <div className="favorites-container">
          <h2 className="favorites-title">즐겨찾기</h2>
          
          <div className="favorites-input-section">
            <input
              type="text"
              className="favorites-input"
              placeholder="제목을 입력하세요. n월/n번째/YYYY-MM-DD"
              value={inputPath}
              onChange={(e) => setInputPath(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
            />
            <button className="favorites-add-btn" onClick={handleAdd}>
              추가
            </button>
          </div>

          <div className="favorites-list">
            {favorites.length === 0 ? (
              <div className="favorites-empty">즐겨찾기가 비어있습니다.</div>
            ) : (
              favorites.map((path, index) => (
                <div
                  key={`${path}-${index}`}
                  className="favorites-item"
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                >
                  <div className="favorites-item-drag">≡</div>
                  <div 
                    className="favorites-item-path"
                    onClick={() => handleFileClick(path)}
                  >
                    {path}
                  </div>
                  <button
                    className="favorites-item-remove"
                    onClick={() => handleRemove(index)}
                  >
                    ✕
                  </button>
                </div>
              ))
            )}
          </div>

          <button className="favorites-save-btn" onClick={handleSave}>
            저장하기
          </button>
        </div>
        </div>
      </div>
    </>
  );
};

export default FavoritesPage;
