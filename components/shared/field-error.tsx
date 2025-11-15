import React from "react";

const FieldError = ({ error }: { error: string | undefined }) => {
  if (!error) return null;
  return <p className="text-sm text-red-500 text-end mt-1 italic">{error}</p>;
};

export default FieldError;
