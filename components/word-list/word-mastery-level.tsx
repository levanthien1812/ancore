"use client";
import { MasteryLevel, MasteryLevelColorCode } from "@/lib/constants/enums";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { startTransition, useMemo, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { updateWord } from "@/lib/actions/word.actions";

const WordMasteryLevel = ({
  wordId,
  level,
}: {
  wordId: string;
  level: MasteryLevel;
}) => {
  const [selectedValue, setSelectedValue] = useState<MasteryLevel>(level);

  const demonstratorStyle = useMemo(() => {
    return {
      backgroundImage: `linear-gradient(to bottom, ${MasteryLevelColorCode[selectedValue].primary}, ${MasteryLevelColorCode[selectedValue].dark})`,
    };
  }, [selectedValue]);

  const handleChange = (value: MasteryLevel) => {
    setSelectedValue(value);

    startTransition(() => {
      updateWord(wordId, { masteryLevel: value });
    });
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <div
          className="cursor-pointer flex gap-1 items-center"
          title="Click to change"
        >
          <div
            className={`py-1 px-2 text-white text-sm rounded-sm leading-none tracking-normal`}
            style={demonstratorStyle}
          >
            {selectedValue}
          </div>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <Select
          value={selectedValue}
          onValueChange={handleChange}
          name="masteryLevel"
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="New">New</SelectItem>
            <SelectItem value="Learning">Learning</SelectItem>
            <SelectItem value="Familiar">Familiar</SelectItem>
            <SelectItem value="Mastered">Mastered</SelectItem>
          </SelectContent>
        </Select>
      </PopoverContent>
    </Popover>
  );
};

export default WordMasteryLevel;
