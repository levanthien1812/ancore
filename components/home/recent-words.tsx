"use client";
import { getRecentWords } from "@/lib/actions/word.actions";
import React, { useEffect } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHeader,
  TableHead,
  TableRow,
} from "../ui/table";
import WordMasteryLevel from "../word-list/word-mastery-level";
import { format } from "date-fns";
import { MasteryLevel } from "@/lib/constants/enums";
import { Button } from "../ui/button";
import { Dialog, DialogContent } from "../ui/dialog";
import { WordWithMeanings } from "../add-word/add-word-form";
import WordDialog from "../word-card/word-dialog";
import WordOfTheDay from "./word-of-the-day";

const RecentWords = () => {
  const [words, setWords] = React.useState<WordWithMeanings[]>([]);
  const [selectedIndex, setSelectedIndex] = React.useState<number | null>(null);

  useEffect(() => {
    (async () => {
      const words = await getRecentWords();
      setWords(words);
    })();
  }, []);

  return (
    <div className=" flex flex-col bg-background-2 p-8 rounded-2xl">
      <p className="text-[40px] font-bold text-primary">📋 Recent words!</p>
      <div className="border border-primary">
        <Table>
          {/* <TableCaption>A list of your recent words.</TableCaption> */}
          <TableHeader>
            <TableRow className="border-b border-primary">
              <TableHead className="w-[200px] px-4">Word</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last review</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {words.map((word, index) => (
              <TableRow key={word.word} className="border-b border-primary">
                <TableCell
                  className={`font-bold text-xl px-4 ${
                    index % 2 === 0 ? "text-primary-2" : "text-primary"
                  }`}
                >
                  {word.word}
                </TableCell>
                <TableCell>
                  <WordMasteryLevel
                    level={word.masteryLevel as MasteryLevel}
                    wordId={word.id}
                  />
                </TableCell>
                <TableCell>{format(word.createdAt, "dd/MM/yyyy")}</TableCell>
                <TableCell>
                  <Button
                    size={"sm"}
                    variant={"secondary"}
                    onClick={() => setSelectedIndex(index)}
                  >
                    Detail
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <Dialog
        open={selectedIndex !== null}
        onOpenChange={() => setSelectedIndex(null)}
      >
        <DialogContent>
          <WordDialog
            word={selectedIndex !== null ? words[selectedIndex] : null}
            selectedIndex={selectedIndex}
            setSelectedIndex={setSelectedIndex}
            totalWord={words.length}
          />
        </DialogContent>
      </Dialog>

      <WordOfTheDay />
    </div>
  );
};

export default RecentWords;
