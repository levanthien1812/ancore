export const convertSecondsToMinutes = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  return minutes === 1 ? `${minutes} min` : `${minutes} mins`;
};
