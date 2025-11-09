import Header from '../../components/common/Header/Header';
import TabNavigation from '../../components/common/TabNavigation/TabNavigation';
import Heatmap from '../../components/statistics/Heatmap/Heatmap';
import './StatisticsPage.css';

const StatisticsPage = () => {
  // 더미 데이터
  const dummyGrassData = [
    { date: '2024-10-01', count: 1 },
    { date: '2024-10-05', count: 3 },
    { date: '2024-10-10', count: 5 },
    { date: '2024-10-15', count: 8 },
    { date: '2024-11-01', count: 2 },
    { date: '2024-11-06', count: 10 }
  ];

  return (
    <div className="statistics-page">
      <Header username="username" repository="morningpage" />
      <TabNavigation />
      <div className="statistics-page-content">
        <Heatmap data={dummyGrassData} />
      </div>
    </div>
  );
};

export default StatisticsPage;

