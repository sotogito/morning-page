import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/common/Header/Header';
import TabNavigation from '../../components/common/TabNavigation/TabNavigation';
import Heatmap from '../../components/statistics/Heatmap/Heatmap';
import { useAuthStore } from '../../store/authStore';
import { useFileStore } from '../../store/fileStore';
import { GitHubFileService } from '../../services/githubFileService';
import './StatisticsPage.css';

const StatisticsPage = () => {
  const navigate = useNavigate();
  const { token, owner, repo, isAuthenticated } = useAuthStore();
  const filesMap = useFileStore(state => state.files);
  const files = useMemo(() => Array.from(filesMap.values()), [filesMap]);
  const updateFile = useFileStore(state => state.updateFile);
  const [heatmapData, setHeatmapData] = useState([]);
  const requestedPathsRef = useRef(new Set());
  const loggedOnceRef = useRef(false);

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

  useEffect(() => {
    // fileStore 기반 heatmap 데이터 생성
    const data = files.map(file => {
      const dateMatch = file.name.match(/\d{4}-\d{2}-\d{2}/);
      const dateStr = dateMatch ? dateMatch[0] : null;
      if (!dateStr) {
        return null;
      }


      let status = 'gray';
      let title = file.name.replace(/\.md$/, '');

      if (file.savedAt) {
        const savedDate = new Date(file.savedAt);
        const savedYmd = savedDate.toISOString().split('T')[0];
        if (savedYmd === dateStr) {
          const hour = savedDate.getHours();
          if (hour < 10) status = 'green';
          else if (hour < 14) status = 'orange';
          else status = 'red';
          title = `${title} • ${savedDate.toLocaleString()}`;
        } else {
          title = `${title} • 커밋: ${savedDate.toLocaleString()} (다른 날)`;
        }
      }

      return {
        date: dateStr,
        status,
        title,
        onClick: () => navigate(`/editor?date=${dateStr}`)
      };
    }).filter(Boolean);

    setHeatmapData(data);
  }, [files, navigate]);

  return (
    <div className="statistics-page">
      <Header username="username" repository="morningpage" />
      <TabNavigation />
      <div className="statistics-page-content">
        <Heatmap data={heatmapData} />
      </div>
    </div>
  );
};

export default StatisticsPage;
