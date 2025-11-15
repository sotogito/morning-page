import { useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/common/Header/Header';
import TabNavigation from '../../components/common/TabNavigation/TabNavigation';
import Heatmap from '../../components/statistics/Heatmap/Heatmap';
import { useAuthStore } from '../../store/authStore';
import { useFileStore } from '../../store/fileStore';
import { GitHubFileService } from '../../services/githubFileService';
import { buildHeatmapData } from '../../utils/heatmapUtils';
import './StatisticsPage.css';

const StatisticsPage = () => {
  const navigate = useNavigate();
  const { user, token, owner, repo, isAuthenticated } = useAuthStore();
  const filesMap = useFileStore(state => state.files);
  const files = useMemo(() => Array.from(filesMap.values()), [filesMap]);
  const updateFile = useFileStore(state => state.updateFile);
  const requestedPathsRef = useRef(new Set());
  const loggedOnceRef = useRef(false);
  
  const heatmapData = useMemo(() => {
    const data = buildHeatmapData(files);
    return data.map(item => ({
      ...item,
      onClick: () => navigate(`/editor?date=${item.date}`)
    }));
  }, [files, navigate]);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      navigate('/login');
      return;
    }

    const fetchMissingSavedAt = async () => {
      const fileService = new GitHubFileService(token, owner, repo);
      const targets = files.filter(f => f.sha && (f.savedAt == null) && !requestedPathsRef.current.has(f.path));

      if (targets.length === 0) {
        return;
      }

      if (!loggedOnceRef.current) {
        loggedOnceRef.current = true;
      }

      targets.forEach(t => requestedPathsRef.current.add(t.path));

      const concurrency = 4;
      let idx = 0;
      const runNext = async () => {
        if (idx >= targets.length) return;
        const file = targets[idx++];
        try {
          const savedAt = await fileService.getLastCommitTime(file.path);
          if (savedAt) {
            updateFile(file.path, { savedAt });
          }
        } catch (_) {
        }
        return runNext();
      };

      await Promise.all(Array.from({ length: Math.min(concurrency, targets.length) }, runNext));
    };

    fetchMissingSavedAt();
  }, [isAuthenticated, token, owner, repo, navigate, files, updateFile]);

  return (
    <div className="statistics-page">
      <Header username={user?.name || user?.login || 'User'} repository={repo || 'repository'} />
      <TabNavigation />
      <div className="statistics-page-content">
        <Heatmap data={heatmapData} />
      </div>
    </div>
  );
};

export default StatisticsPage;
