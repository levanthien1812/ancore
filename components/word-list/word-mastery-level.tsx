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
import { useLayout } from "../layout/layout-context";

const WordMasteryLevel = ({
  wordId,
  level,
}: {
  wordId: string;
  level: MasteryLevel;
}) => {
  const [selectedValue, setSelectedValue] = useState<MasteryLevel>(level);
  const { mode } = useLayout();

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
    <Popover>
      <PopoverTrigger asChild>
        {/* <button className="hover:bg-gray-200 rounded-[3px] w-4 h-4 cursor-pointer p-0.5 justify-center items-center group-hover:flex hidden">
            <PenIcon stroke="#4a5566" fill="#99a1af" />
          </button> */}
        <div
          className="cursor-pointer flex gap-1 items-center"
          title="Click to change"
        >
          <div
            className={`${mode === "list" ? "w-4 h-4" : "min-w-8 min-h-2 px-2 py-0"} rounded-md`}
            style={demonstratorStyle}
          >
            {mode === "grid" && (
              <p
                className={`leanding-none text-md group-hover:block hidden text-sm text-white`}
              >
                {selectedValue}
              </p>
            )}
            {mode === "list" && (
              <p className={`leanding-none text-black text-md`}>
                {selectedValue}
              </p>
            )}
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
