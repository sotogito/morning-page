const getWeekOfMonth = (date) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const firstWeekday = firstDay.getDay();
  const dayOfMonth = date.getDate();

  return Math.ceil((dayOfMonth + firstWeekday) / 7);
};

export const createTitle = (date = new Date()) => {
  const month = date.getMonth() + 1;
  const weekNumber = getWeekOfMonth(date);
  const today = date.toLocaleDateString('sv-SE');
  
  const monthFolder = `${month}월`;
  const weekFolder = `${weekNumber}째주`;
  const filePath = `${monthFolder}/${weekFolder}/${today}.md`;

  return {
    monthFolder,
    weekFolder,
    today,
    filePath
  }
}
