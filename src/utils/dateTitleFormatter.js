const getWeekOfMonth = (date) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const firstWeekday = firstDay.getDay();
  const dayOfMonth = date.getDate();

  return Math.ceil((dayOfMonth + firstWeekday) / 7);
};

export const createTitle = (date) => {
    const month = date.getMonth() + 1;
    const weekNumber = getWeekOfMonth(date);
    const dateStr = date.toISOString().split('T')[0];

    return `${month}월/${weekNumber}째주/${dateStr} `;
}
