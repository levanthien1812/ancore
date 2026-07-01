import { WordWithMeanings } from "@/components/add-word/add-word-form";
import { removeDuplicates } from "./remove-duplicates";

export const getDistinctPartsOfSpeech = (word: WordWithMeanings) => {
  const partsOfSpeech = word.meanings
    .map((meaning) => {
      if (meaning.partOfSpeech) return meaning.partOfSpeech;
      return null;
    })
    .filter((pos) => pos !== null);

  return removeDuplicates(partsOfSpeech) as string[];
};

export const getDistinctCefrLevels = (word: WordWithMeanings) => {
  const cefrLevels = word.meanings
    .map((meaning) => meaning.cefrLevel)
    .filter((level) => !!level);
  return removeDuplicates(cefrLevels) as string[];
};

export const getDistinctPronunciations = (word: WordWithMeanings) => {
  const pronunciations = word.meanings
    .map((meaning) => meaning.pronunciation)
    .filter((pron) => !!pron);
  return removeDuplicates(pronunciations as string[]);
};
