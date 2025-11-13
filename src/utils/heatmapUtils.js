const HEATMAP_STATUS = Object.freeze({
  GRAY: 'gray',
  GREEN: 'green',
  ORANGE: 'orange',
  RED: 'red',
});

const HOUR_THRESHOLD = Object.freeze({
  MORNING: 10,
  AFTERNOON: 14,
});

export const buildHeatmapData = (files) => {
  return files.map(file => {
    const dateMatch = file.name.match(/\d{4}-\d{2}-\d{2}/);
    const dateStr = dateMatch ? dateMatch[0] : null;
    if (!dateStr) {
      return null;
    }

    let status = HEATMAP_STATUS.GRAY;
    let title = file.name.replace(/\.md$/, '');

    if (file.savedAt) {
      const savedDate = new Date(file.savedAt);
      const savedYmd = savedDate.toISOString().split('T')[0];
      if (savedYmd === dateStr) {
        const hour = savedDate.getHours();
        if (hour < HOUR_THRESHOLD.MORNING) status = HEATMAP_STATUS.GREEN;
        else if (hour < HOUR_THRESHOLD.AFTERNOON) status = HEATMAP_STATUS.ORANGE;
        else status = HEATMAP_STATUS.RED;
        title = `${title} • ${savedDate.toLocaleString()}`;
      } else {
        title = `${title} • 커밋: ${savedDate.toLocaleString()} (다른 날)`;
      }
    }

    return {
      date: dateStr,
      status,
      title
    };
  }).filter(Boolean);
};
