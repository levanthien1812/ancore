"use client";
import { useState } from "react";
import { shorten } from "@/lib/utils/shorten";
import { normalizeText } from "@/lib/utils/normalize-text";
import { useLayoutStore } from "@/lib/stores/layout-store";

const WordDefinition = ({ meanings }: { meanings: string[] }) => {
  const { mode } = useLayoutStore();
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!meanings || meanings.length === 0) return null;

  if (mode === "grid") {
    const currentMeaning = meanings[currentIndex] ?? meanings[0];

    return (
      <div className="flex flex-col">
        <p className="text-sm text-white" title={currentMeaning}>
          {shorten(normalizeText(currentMeaning), 70)}
        </p>
        {meanings.length > 1 && (
          <div className="flex items-center gap-1.5 mt-2">
            {meanings.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(index);
                }}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-200 cursor-pointer focus:outline-none ${
                  index === currentIndex
                    ? "bg-white scale-125"
                    : "bg-white/40 hover:bg-white/70"
                }`}
                title={`Meaning ${index + 1}`}
                aria-label={`View meaning ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <ul className="list-disc ms-4">
      {meanings.map((meaning, index) => (
        <li key={index} className="text-primary-2" title={meaning}>
          {shorten(normalizeText(meaning))}
        </li>
      ))}
    </ul>
  );
};

export default WordDefinition;
