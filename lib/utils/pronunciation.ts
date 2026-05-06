export const formatPronunciation = (
  pronunciation: string | undefined | null,
) => {
  return pronunciation
    ? !pronunciation.includes("/")
      ? `/${pronunciation}/`
      : pronunciation
    : "";
};
