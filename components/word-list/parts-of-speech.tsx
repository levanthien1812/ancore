import React from "react";

const PartsOfSpeech = ({
  uniquePos,
  wordType,
}: {
  uniquePos: string[];
  wordType: string;
}) => {
  return (
    <p className="font-bold text-sm text-blue-300">
      {uniquePos.length > 0 ? uniquePos.join("/") : wordType}
    </p>
  );
};

export default PartsOfSpeech;
