export const formatDateToYYYYMMDD = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getTodayString = () => {
  return formatDateToYYYYMMDD(new Date());
};

export const isSameDay = (date1, date2) => {
  return date1 === date2;
};

export const isNextDay = (date1, date2) => {
  if (!date1 || !date2) return false;
  
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  
  // date1에 1일 추가
  const nextDay = new Date(d1);
  nextDay.setDate(nextDay.getDate() + 1);
  
  return formatDateToYYYYMMDD(nextDay) === formatDateToYYYYMMDD(d2);
};
