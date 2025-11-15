"use client";
import { MasteryLevel } from "@/lib/constants/enums";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PenIcon } from "lucide-react";
import React, { startTransition, useMemo, useState } from "react";
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
    switch (selectedValue) {
      case MasteryLevel.New:
        return {
          backgroundImage: "linear-gradient(to bottom, #F3623E, #A65744)",
        };
      case MasteryLevel.Learning:
        return {
          backgroundImage: "linear-gradient(to bottom, #FFB43B, #BF811D)",
        };
      case MasteryLevel.Familiar:
        return {
          backgroundImage: "linear-gradient(to bottom, #FEDA49, #C8A61F)",
        };
      case MasteryLevel.Mastered:
        return {
          backgroundImage: "linear-gradient(to bottom, #37F5A3, #109A5F)",
        };
    }
  }, [selectedValue]);

  const handleChange = (value: MasteryLevel) => {
    setSelectedValue(value);

    startTransition(() => {
      updateWord(wordId, { masteryLevel: value });
    });
  };

  return (
    <div className="flex gap-1 items-center">
      <div className="w-4 h-4 rounded-[3px]" style={demonstratorStyle}></div>
      <p className="leanding-none">{selectedValue}</p>

      <Popover>
        <PopoverTrigger asChild>
          <button className="hover:bg-gray-200 rounded-[3px] w-4 h-4 cursor-pointer p-0.5 flex justify-center items-center">
            <PenIcon stroke="#4a5566" fill="#99a1af" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <Select
            value={selectedValue}
            onValueChange={handleChange}
            name="masteryLevel"
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a fruit" />
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
    </div>
  );
};

export default WordMasteryLevel;
