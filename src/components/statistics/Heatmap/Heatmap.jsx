import { useMemo } from 'react';
import './Heatmap.css';

const Heatmap = ({ data = [] }) => {
  const dataByDate = useMemo(() => {
    const map = new Map();
    data.forEach(d => map.set(d.date, d));
    return map;
  }, [data]);

  const getLevel = (count) => {
    if (count === 0) return 0;
    if (count < 3) return 1;
    if (count < 6) return 2;
    if (count < 9) return 3;
    return 4;
  };

  const { weeks, months } = useMemo(() => {
    const today = new Date();
    const yearAgo = new Date();
    yearAgo.setFullYear(today.getFullYear() - 1);

    // 일요일부터 시작하도록 조정
    const startDate = new Date(yearAgo);
    startDate.setDate(startDate.getDate() - startDate.getDay());

    const weeksArray = [];
    const monthsArray = [];
    let currentMonth = '';

    // 53주 생성
    for (let week = 0; week < 53; week++) {
      const weekDays = [];
      
      for (let day = 0; day < 7; day++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(currentDate.getDate() + week * 7 + day);
        
        const dateStr = currentDate.toISOString().split('T')[0];
        const contribution = dataByDate.get(dateStr);
        
        weekDays.push({
          date: dateStr,
          count: contribution?.count || 0,
          level: getLevel(contribution?.count || 0),
          status: contribution?.status || null,
          title: contribution?.title || null,
          onClick: contribution?.onClick || null,
        });

        // 월 레이블 추적
        if (day === 0) {
          const monthName = currentDate.toLocaleDateString('ko-KR', { month: 'short' });
          if (monthName !== currentMonth) {
            currentMonth = monthName;
            monthsArray.push({ week, label: monthName });
          }
        }
      }
      
      weeksArray.push(weekDays);
    }

    return { weeks: weeksArray, months: monthsArray };
  }, [dataByDate]);

  const getClassName = (day) => {
    if (day.status) {
      return `heatmap-day status-${day.status}`;
    }
    return `heatmap-day level-${day.level}`;
  };

  const getTitle = (day) => {
    if (day.title) return day.title;
    return `${day.date}: ${day.count}개 작성`;
  };

  return (
    <div className="heatmap-calendar">
      <div className="heatmap-header">
        <h2 className="heatmap-title">기여도</h2>
        <div className="heatmap-legend">
          <span className="legend-label">상태</span>
          <div className="legend-item status-gray" title="커밋 없음 (또는 다른 날)" />
          <div className="legend-item status-green" title="10:00 이전" />
          <div className="legend-item status-orange" title="14:00 이전" />
          <div className="legend-item status-red" title="14:00 이후" />
        </div>
      </div>

      <div className="heatmap-container">
        <div className="heatmap-months">
          {months.map((month, idx) => (
            <span 
              key={idx} 
              className="month-label"
              style={{ left: `${month.week * 14}px` }}
            >
              {month.label}
            </span>
          ))}
        </div>

        <div className="heatmap-grid">
          <div className="heatmap-days">
            <span className="day-label">월</span>
            <span className="day-label">수</span>
            <span className="day-label">금</span>
          </div>

          <div className="heatmap-weeks">
            {weeks.map((week, weekIdx) => (
              <div key={weekIdx} className="heatmap-week">
                {week.map((day, dayIdx) => (
                  <div
                    key={`${weekIdx}-${dayIdx}`}
                    className={getClassName(day)}
                    data-date={day.date}
                    data-count={day.count}
                    title={getTitle(day)}
                    onClick={day.onClick || undefined}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Heatmap;
