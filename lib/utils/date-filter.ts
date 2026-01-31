export const dateFilter = (date: Date) => {
  // Get the ISO date string (YYYY-MM-DD) in the user's local timezone
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const dateStr = `${year}-${month}-${day}`;

  // Create start: beginning of the day in UTC (accounting for the date the user sees locally)
  const startOfDay = new Date(`${dateStr}T00:00:00Z`);

  // Create end: end of the day in UTC (next day at 00:00:00)
  const endOfDay = new Date(`${dateStr}T23:59:59.999Z`);

  return {
    gte: startOfDay,
    lte: endOfDay,
  };
};
