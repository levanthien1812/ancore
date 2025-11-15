export const shorten = (text: string, length: number = 50) => {
  if (text.length <= length) return text;
  return text.slice(0, length) + "...";
};
