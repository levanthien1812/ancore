"use client";
import { useState } from "react";
import { shorten } from "@/lib/utils/shorten";
import { normalizeText } from "@/lib/utils/normalize-text";
import { useLayoutStore } from "@/lib/stores/layout-store";

interface WordDefinitionProps {
  meanings: string[];
  wordIndex?: number;
}

const WordDefinition = ({ meanings, wordIndex }: WordDefinitionProps) => {
  const { mode } = useLayoutStore();

  if (!meanings || meanings.length === 0) return null;

  if (mode === "grid") {
    if (wordIndex === undefined) return null;
    const currentMeaning = meanings[wordIndex];
    return (
      <div className="flex flex-col">
        <p className="text-sm text-white" title={currentMeaning}>
          {shorten(normalizeText(currentMeaning), 70)}
        </p>
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
