import WordDialog from "@/components/word-card/word-dialog";
import WordList from "@/components/word-list/word-list";
import { getWordListByFilter } from "@/lib/actions/word.actions";
import React from "react";

const WordsPage = async () => {
  const wordList = await getWordListByFilter({
    page: 1,
    limit: 50,
  });

  return (
    <div className="container mx-auto space-y-2">
      <h2 className="text-3xl">Word list</h2>
      <WordList words={wordList} />
      {/* Pagination */}
    </div>
  );
};

export default WordsPage;
