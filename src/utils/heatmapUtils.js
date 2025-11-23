import { HEATMAP_STATUS, HOUR_THRESHOLD } from '../constants/HeatmapStatus';
import { TITLE_REGEX } from '../constants/TitleRegex';

const extractDateFromName = (name) => name.match(TITLE_REGEX.ISO)?.[0] ?? null;

const stripExtension = (name) => name.replace(/\.md$/, '');

const timeToMinutes = (timeStr) => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

const getDefaultStatusByHour = (hour) => {
  if (hour < HOUR_THRESHOLD.MORNING) return HEATMAP_STATUS.GREEN;
  if (hour < HOUR_THRESHOLD.AFTERNOON) return HEATMAP_STATUS.ORANGE;
  return HEATMAP_STATUS.RED;
};

const getStatusByTimeConfig = (hour, minute, timeConfig) => {
  if (!timeConfig) {
    return getDefaultStatusByHour(hour);
  }

  const currentMinutes = hour * 60 + minute;

  const greenStart = timeToMinutes(timeConfig.green.start);
  const greenEnd = timeToMinutes(timeConfig.green.end);
  if (currentMinutes >= greenStart && currentMinutes < greenEnd) {
    return HEATMAP_STATUS.GREEN;
  }

  const orangeStart = timeToMinutes(timeConfig.orange.start);
  const orangeEnd = timeToMinutes(timeConfig.orange.end);
  if (currentMinutes >= orangeStart && currentMinutes < orangeEnd) {
    return HEATMAP_STATUS.ORANGE;
  }

  return HEATMAP_STATUS.RED;
};

const buildStatusAndTitle = (baseTitle, dateStr, savedAt, timeConfig) => {
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
    const status = getStatusByTimeConfig(
      savedDate.getHours(),
      savedDate.getMinutes(),
      timeConfig
    );
    return {
      status,
      title: `${baseTitle} • ${savedDate.toLocaleString()}`,
    };
  }

  return {
    status: HEATMAP_STATUS.GRAY,
    title: `${baseTitle} • 커밋: ${savedDate.toLocaleString()} (다른 날)`,
  };
};

export const buildHeatmapData = (files, timeConfig = null) => {
  return files
    .map((file) => {
      const date = extractDateFromName(file.name);
      if (!date) return null;

      const baseTitle = stripExtension(file.name);
      const { status, title } = buildStatusAndTitle(baseTitle, date, file.savedAt, timeConfig);

      return {
        date,
        status,
        title,
      };
    })
    .filter(Boolean);
};
