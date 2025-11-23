import './StatsOverview.css';

const StatsOverview = ({ stats, error, loading }) => {
  if (!stats && !error && !loading) {
    return null;
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="stats-overview">
      <div className="stats-header">
        <h2 className="stats-title">통계</h2>
      </div>
      {loading && (
        <div className="stats-loading">로딩 중...</div>
      )}
      {error && (
        <div className="stats-error">
          기능을 사용할 수 없습니다. 모닝페이지 템플릿을 사용해보세요.
        </div>
      )}
      {stats && (
        <div className="stats-container">
          <div className="stats-item">
            <span className="stats-label">총 작성일</span>
            <span className="stats-value">{stats.totalDays}일</span>
          </div>
          <div className="stats-item">
            <span className="stats-label">연속 작성일</span>
            <span className="stats-value">{stats.streak}일</span>
          </div>
          <div className="stats-item">
            <span className="stats-label">마지막 작성일</span>
            <span className="stats-value">{formatDate(stats.lastDate)}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatsOverview;
