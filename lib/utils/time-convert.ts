export const convertSecondsToMinutes = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  return minutes === 1 ? `${minutes} min` : `${minutes} mins`;
};

export const convertSecondsToMinutes2 = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds}`;
};

export const convertSecondsToHHMM = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const remainingSeconds = seconds % 3600;
  const minutes = Math.floor(remainingSeconds / 60);
  if (hours === 0) {
    return `${minutes}m`;
  }
  return `${hours}h ${minutes}m`;
};

export const convertHoursToDaysHours = (hours: number = 0): string => {
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  return `${days}d ${remainingHours}h`;
};

/**
 * Parses time strings into total minutes since midnight.
 * Handles both "HH:mm" and legacy "hh:mm AM/PM" formats.
 */
export const parseTimeToMinutes = (timeStr: string) => {
  if (
    timeStr.toLowerCase().includes("am") ||
    timeStr.toLowerCase().includes("pm")
  ) {
    const [time, modifier] = timeStr.split(" ");
    let [hours, minutes] = time.split(":").map(Number);
    if (modifier?.toUpperCase() === "PM" && hours < 12) hours += 12;
    if (modifier?.toUpperCase() === "AM" && hours === 12) hours = 0;
    return hours * 60 + minutes;
  }
  const [h, m] = timeStr.split(":").map(Number);
  return h * 60 + (m || 0);
};
