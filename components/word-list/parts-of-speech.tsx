import React from "react";

const PartsOfSpeech = ({
  uniquePos,
  wordType,
  additionalClasses,
}: {
  uniquePos: string[];
  wordType: string;
  additionalClasses?: string;
}) => {
  return (
    <p className={`font-bold text-sm text-blue-300 ${additionalClasses}`}>
      {uniquePos.length > 0 ? uniquePos.join("/") : wordType}
    </p>
  );
};

export default PartsOfSpeech;
