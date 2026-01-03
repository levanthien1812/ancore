export const toBoolean = (value: string | boolean | number) => {
  if (typeof value === "string") {
    return value === "true";
  } else if (typeof value === "number") {
    return value === 1;
  } else {
    return value;
  }
};
