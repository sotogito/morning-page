import { HEATMAP_STATUS, HOUR_THRESHOLD } from '../constants/HeatmapStatus';
import { TITLE_REGEX } from '../constants/TitleRegex';

const extractDateFromName = (name) => name.match(TITLE_REGEX.ISO)?.[0] ?? null;

const stripExtension = (name) => name.replace(/\.md$/, '');

const getStatusByHour = (hour) => {
  if (hour < HOUR_THRESHOLD.MORNING) return HEATMAP_STATUS.GREEN;
  if (hour < HOUR_THRESHOLD.AFTERNOON) return HEATMAP_STATUS.ORANGE;
  return HEATMAP_STATUS.RED;
};

const buildStatusAndTitle = (baseTitle, dateStr, savedAt) => {
  if (!savedAt) {
    return {
      status: HEATMAP_STATUS.GRAY,
      title: baseTitle,
    };
  }

  const savedDate = new Date(savedAt);
  if (Number.isNaN(savedDate.getTime())) {
    return {
      status: HEATMAP_STATUS.GRAY,
      title: baseTitle,
    };
  }

  const savedYmd = savedDate.toISOString().split('T')[0];
  if (savedYmd === dateStr) {
    return {
      status: getStatusByHour(savedDate.getHours()),
      title: `${baseTitle} • ${savedDate.toLocaleString()}`,
    };
  }

  return {
    status: HEATMAP_STATUS.GRAY,
    title: `${baseTitle} • 커밋: ${savedDate.toLocaleString()} (다른 날)`,
  };
};

export const buildHeatmapData = (files) => {
  return files
    .map((file) => {
      const date = extractDateFromName(file.name);
      if (!date) return null;

      const baseTitle = stripExtension(file.name);
      const { status, title } = buildStatusAndTitle(baseTitle, date, file.savedAt);

      return {
        date,
        status,
        title,
      };
    })
    .filter(Boolean);
};
