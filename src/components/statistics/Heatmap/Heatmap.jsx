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
    const currentYear = today.getFullYear();
    
    // 로컬 날짜를 YYYY-MM-DD 형식으로 변환하는 헬퍼 함수
    const formatDate = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    
    const januaryFirst = new Date(currentYear, 0, 1);
    const decemberLast = new Date(currentYear, 11, 31);
    const firstDayOfWeek = januaryFirst.getDay();
    const totalDays = Math.floor((decemberLast - januaryFirst) / (1000 * 60 * 60 * 24)) + 1;
    const weeksNeeded = Math.ceil((firstDayOfWeek + totalDays) / 7);
    const weeksArray = [];
    const monthsMap = new Map();

    for (let week = 0; week < weeksNeeded; week++) {
      const weekDays = [];
      
      for (let day = 0; day < 7; day++) {
        const dayIndex = week * 7 + day - firstDayOfWeek;
        
        // 1월 1일 이전이나 12월 31일 이후는 빈 칸
        if (dayIndex < 0 || dayIndex >= totalDays) {
          weekDays.push({
            date: null,
            count: 0,
            level: 0,
            status: null,
            title: null,
            onClick: null,
          });
          continue;
        }
        
        // 로컬 날짜로 계산 (타임존 문제 방지)
        const currentDate = new Date(currentYear, 0, 1 + dayIndex);
        const dateStr = formatDate(currentDate);
        const contribution = dataByDate.get(dateStr);
        
        // 월 레이블 추적 - 각 월의 첫 번째 날짜
        if (currentDate.getDate() === 1) {
          const month = currentDate.getMonth();
          const monthName = currentDate.toLocaleDateString('ko-KR', { month: 'short' });
          monthsMap.set(month, { week, label: monthName });
        }
        
        weekDays.push({
          date: dateStr,
          count: contribution?.count || 0,
          level: getLevel(contribution?.count || 0),
          status: contribution?.status || null,
          title: contribution?.title || null,
          onClick: contribution?.onClick || null,
        });
      }
      
      weeksArray.push(weekDays);
    }

    // 월 레이블을 1월부터 12월까지 순서대로 정렬
    const monthsArray = Array.from(monthsMap.entries())
      .sort((a, b) => a[0] - b[0]) // 월 순서로 정렬
      .map(([_, value]) => value);

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
      </div>

      <div className="heatmap-container">
        <div className="heatmap-grid">
          <div className="heatmap-days">
            <span className="day-label">일</span>
            <span className="day-label">월</span>
            <span className="day-label">화</span>
            <span className="day-label">수</span>
            <span className="day-label">목</span>
            <span className="day-label">금</span>
            <span className="day-label">토</span>
          </div>

          <div className="heatmap-weeks-wrapper">
            <div className="heatmap-months">
              {months.map((month, idx) => (
                <span 
                  key={idx} 
                  className="month-label"
                  style={{ '--week-index': month.week }}
                >
                  {month.label}
                </span>
              ))}
            </div>

            <div className="heatmap-weeks">
              {weeks.map((week, weekIdx) => (
                <div key={weekIdx} className="heatmap-week">
                  {week.map((day, dayIdx) => (
                    <div
                      key={`${weekIdx}-${dayIdx}`}
                      className={day.date ? getClassName(day) : 'heatmap-day empty'}
                      data-date={day.date}
                      data-count={day.count}
                      title={day.date ? getTitle(day) : ''}
                      onClick={day.onClick || undefined}
                      style={{ cursor: day.date ? 'pointer' : 'default' }}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Heatmap;
