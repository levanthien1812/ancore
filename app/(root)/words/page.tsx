import WordList from "@/components/word-list/word-list";
import { getWordListByFilter } from "@/lib/actions/word.actions";

const WordsPage = async () => {
  const wordList = await getWordListByFilter({
    page: 1,
    limit: 50,
  });

  const handleLoadMore = async (page: number) => {
    "use server";
    return await getWordListByFilter({
      page,
      limit: 50,
    });
  };

  return (
    <div className="container mx-auto space-y-2">
      <h2 className="text-3xl">Word list</h2>
      <WordList words={wordList} onLoadMore={handleLoadMore} />
    </div>
  );
};

export default WordsPage;
