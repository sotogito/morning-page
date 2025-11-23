import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/common/Header/Header';
import TabNavigation from '../../components/common/TabNavigation/TabNavigation';
import Heatmap from '../../components/statistics/Heatmap/Heatmap';
import StatsOverview from '../../components/statistics/StatsOverview/StatsOverview';
import ToastContainer from '../../components/common/Message/ToastContainer';
import { useAuthStore } from '../../store/authStore';
import { useFileStore } from '../../store/fileStore';
import { GitHubFileService } from '../../services/githubFileService';
import { StatsService } from '../../services/statsService';
import { MorningTimeService } from '../../services/morningTimeService';
import { buildHeatmapData } from '../../utils/heatmapUtils';
import useToast from '../../hooks/useToast';
import './StatisticsPage.css';

const StatisticsPage = () => {
  const navigate = useNavigate();
  const { user, token, owner, repo, isAuthenticated } = useAuthStore();
  const filesMap = useFileStore(state => state.files);
  const files = useMemo(() => Array.from(filesMap.values()), [filesMap]);
  const updateFile = useFileStore(state => state.updateFile);
  const requestedPathsRef = useRef(new Set());
  const loggedOnceRef = useRef(false);
  const { toasts, showInfo, showError, removeToast } = useToast();
  
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState(false);
  const [morningTimeConfig, setMorningTimeConfig] = useState(null);
  
  const heatmapData = useMemo(() => {
    const data = buildHeatmapData(files, morningTimeConfig);
    return data.map(item => ({
      ...item,
      onClick: () => navigate(`/editor?date=${item.date}`)
    }));
  }, [files, morningTimeConfig, navigate]);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        setStatsLoading(true);
        setStatsError(false);
        
        const statsService = new StatsService(token, owner, repo);
        
        const hasMorningPageFolder = await statsService.checkMorningPageFolder();
        if (!hasMorningPageFolder) {
          setStatsError(true);
          setStatsLoading(false);
          return;
        }
        
        const statsFile = await statsService.fetchStats();
        if (statsFile) {
          setStats(statsFile.data);
        } else {
          setStatsError(true);
        }

        try {
          const morningTimeService = new MorningTimeService(token, owner, repo);
          const morningTimeFile = await morningTimeService.fetchMorningTime();
          if (morningTimeFile) {
            setMorningTimeConfig(morningTimeFile.data);
          }
        } catch (error) {
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
        setStatsError(true);
      } finally {
        setStatsLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, token, owner, repo, navigate]);

  useEffect(() => {
    if (!isAuthenticated || !token) {
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
      <ToastContainer toasts={toasts} onClose={removeToast} />
      <Header username={user?.name || user?.login || 'User'} repository={repo || 'repository'} />
      <TabNavigation />
      <div className="statistics-page-content">
        <Heatmap 
          data={heatmapData}
          onMorningTimeUpdate={(newConfig) => setMorningTimeConfig(newConfig)}
          showInfo={showInfo}
          showError={showError}
        />
        <StatsOverview 
          stats={stats}
          error={statsError}
          loading={statsLoading}
        />
      </div>
    </div>
  );
};

export default StatisticsPage;
