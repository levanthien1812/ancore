import type { WordMeaning } from "@prisma/client";
import { Dot, NotebookPen, Quote, ThumbsDown, ThumbsUp } from "lucide-react";
import { Badge } from "../ui/badge";
import IconDisplay from "../shared/icon-display";

const WordMeaning = ({
  word,
  meaning,
}: {
  word: string;
  meaning: WordMeaning;
}) => {
  if (!meaning.examples) return null;

  const examples = meaning.examples.map((example) => {
    // Normalize non-breaking spaces (\u00A0 / &nbsp;) to regular spaces to allow proper browser line wrapping
    const normalizedExample = example.replace(/\u00A0/g, " ");
    return (
      <li key={example} className="text-sm italic">
        <div
          dangerouslySetInnerHTML={{
            __html: normalizedExample.replace(
              new RegExp(`\\b${word}\\b`, "gi"),
              (match) => `<span class="text-primary-2">${match}</span>`,
            ),
          }}
        ></div>
      </li>
    );
  });

  return (
    <div
      key={meaning.id}
      className="text-white border border-white/40 rounded-lg p-4 max-h-[420px] no-scrollbar overflow-y-auto h-full"
    >
      <div className="">
        {meaning.partOfSpeech && (
          <span className="font-bold text-blue-400">
            {meaning.partOfSpeech}
          </span>
        )}
        {meaning.partOfSpeech && meaning.guideWord && (
          <Dot
            width={16}
            height={16}
            color="white"
            opacity={0.5}
            className="inline"
          />
        )}
        {meaning.guideWord && (
          <span className="text-sm font-bold text-purple-300">
            [{meaning.guideWord.toUpperCase()}]
          </span>
        )}
      </div>
      <p className=" text-xl font-bold">{meaning.definition}</p>
      {examples.length > 0 && (
        <>
          <hr className="border-gray-100/20 my-3" />
          <div className="flex gap-2">
            <IconDisplay icon={Quote} bgClass="bg-blue-400" />
            <div className="">
              <p className="text-md font-bold">Examples:</p>
              <ul className="list-disc ms-4 mt-1">{examples}</ul>
            </div>
          </div>
        </>
      )}
      {(meaning.synonyms || meaning.antonyms) && (
        <>
          <hr className="my-3 border-gray-100/20" />
          {meaning.synonyms && meaning.synonyms.length > 0 && (
            <div className="flex gap-2">
              <IconDisplay icon={ThumbsUp} bgClass="bg-green-700" />
              <div className="flex-1">
                <p className="text-md font-bold">Synonyms:</p>

                <div className="flex gap-1 flex-wrap mt-1">
                  {meaning.synonyms.split(",").map((synonym, index) => (
                    <Badge
                      variant={"outline"}
                      key={index}
                      className="text-white text-sm bg-white/10 whitespace-normal"
                    >
                      {synonym}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
          {meaning.antonyms && meaning.antonyms.length > 0 && (
            <div className="flex gap-2 mt-2">
              <IconDisplay icon={ThumbsDown} bgClass="bg-red-700" />
              <div className="flex-1">
                <p className="text-md font-bold">Antonyms:</p>
                <div className="flex gap-1 flex-wrap mt-1">
                  {meaning.antonyms.split(",").map((antonym, index) => (
                    <Badge
                      variant={"outline"}
                      key={index}
                      className="text-white text-sm bg-white/10 whitespace-normal"
                    >
                      {antonym}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}
      {meaning.usageNotes && meaning.usageNotes.length > 0 && (
        <>
          <>
            <hr className="border-gray-100/20 my-3" />
            <div className="flex gap-2">
              <IconDisplay icon={NotebookPen} bgClass="bg-purple-400" />
              <div className="">
                <p className="text-md font-bold">Usage Notes:</p>
                <p className="mt-1 text-sm">{meaning.usageNotes}</p>
              </div>
            </div>
          </>
        </>
      )}
    </div>
  );
};

export default WordMeaning;
