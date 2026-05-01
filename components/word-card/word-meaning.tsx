import type { WordMeaning } from "@prisma/client";
import React from "react";

const WordMeaning = ({
  word,
  meaning,
}: {
  word: string;
  meaning: WordMeaning;
}) => {
  const examples = meaning.exampleSentences
    ? meaning.exampleSentences.split("|").map((example) => (
        <li key={example} className="italic">
          <div
            dangerouslySetInnerHTML={{
              __html: example.replace(
                word,
                `<span class="text-primary-2">${word}</span>`,
              ),
            }}
          ></div>
        </li>
      ))
    : [];

  return (
    <div
      key={meaning.id}
      className="text-white border border-white  rounded-lg p-4"
    >
      {meaning.partOfSpeech && (
        <p className="italic">({meaning.partOfSpeech})</p>
      )}
      <p className="text-primary-2 text-xl font-bold">{meaning.definition}</p>
      {examples.length > 0 && (
        <div className="mt-2">
          <p className="text-lg">Examples:</p>
          <ul className="list-disc ms-4">{examples}</ul>
        </div>
      )}
      <hr className="my-2 border-dashed" />
      {meaning.synonyms && meaning.synonyms.length > 0 && (
        <div className="mt-2">
          <p className="text-md">Synonyms:</p>
          <p className="text-sm italic">👉 {meaning.synonyms}</p>
        </div>
      )}
      {meaning.antonyms && meaning.antonyms.length > 0 && (
        <div className="mt-2">
          <p className="text-md">Antonyms:</p>
          <p className="text-sm italic">👉 {meaning.antonyms}</p>
        </div>
      )}
      {meaning.usageNotes && meaning.usageNotes.length > 0 && (
        <div className="mt-2">
          <p className="text-md">Usage notes:</p>
          <p className="text-sm italic">📝 {meaning.usageNotes}</p>
        </div>
      )}
    </div>
  );
};

export default WordMeaning;
