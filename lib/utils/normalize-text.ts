export const normalizeText = (text: string): string => {
  return text.replace(/\u00A0/g, " ");
};
