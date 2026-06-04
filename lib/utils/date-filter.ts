export const dateFilter = (date: Date) => {
  // Get timezone offset in milliseconds (getTimezoneOffset returns minutes)
  const timezoneOffset = date.getTimezoneOffset() * 60 * 1000;

  // Get the ISO date string (YYYY-MM-DD) in the user's local timezone
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const dateStr = `${year}-${month}-${day}`;

  // Create start: beginning of the day in UTC
  let startOfDay = new Date(`${dateStr}T00:00:00Z`);
  // Adjust for timezone offset to get the actual UTC time of the start of the local day
  startOfDay = new Date(startOfDay.getTime() + timezoneOffset);

  // Create end: end of the day in UTC (next day at 00:00:00)
  let endOfDay = new Date(`${dateStr}T23:59:59.999Z`);
  // Adjust for timezone offset to get the actual UTC time of the end of the local day
  endOfDay = new Date(endOfDay.getTime() + timezoneOffset);

  // console.log("Date selected (local):", dateStr);
  // console.log("Start of day (UTC):", startOfDay.toISOString());
  // console.log("End of day (UTC):", endOfDay.toISOString());

  return {
    gte: startOfDay,
    lte: endOfDay,
  };
};
