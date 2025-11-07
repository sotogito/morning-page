import { useState, useEffect } from 'react';
import './Heatmap.css';

const Heatmap = ({ data = [] }) => {
  const [weeks, setWeeks] = useState([]);
  const [months, setMonths] = useState([]);

  useEffect(() => {
    generateHeatmap();
  }, []);

  const generateHeatmap = () => {
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
        const contribution = data.find(d => d.date === dateStr);
        
        weekDays.push({
          date: dateStr,
          count: contribution?.count || 0,
          level: getLevel(contribution?.count || 0)
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

    setWeeks(weeksArray);
    setMonths(monthsArray);
  };

  const getLevel = (count) => {
    if (count === 0) return 0;
    if (count < 3) return 1;
    if (count < 6) return 2;
    if (count < 9) return 3;
    return 4;
  };

  return (
    <div className="heatmap-calendar">
      <div className="heatmap-header">
        <h2 className="heatmap-title">기여도</h2>
        <div className="heatmap-legend">
          <span className="legend-label">적음</span>
          <div className="legend-item level-0" />
          <div className="legend-item level-1" />
          <div className="legend-item level-2" />
          <div className="legend-item level-3" />
          <div className="legend-item level-4" />
          <span className="legend-label">많음</span>
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
                    className={`heatmap-day level-${day.level}`}
                    data-date={day.date}
                    data-count={day.count}
                    title={`${day.date}: ${day.count}개 작성`}
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

