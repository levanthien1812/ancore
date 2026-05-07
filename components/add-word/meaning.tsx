"use client";
import React, { useMemo, useState, memo } from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import {
  Control,
  Controller,
  UseFormGetValues,
  UseFormRegister,
  UseFormSetValue,
  useWatch,
} from "react-hook-form";
import FieldError from "../shared/field-error";
import {
  CEFR_LEVELS,
  PartOfSpeech,
  PARTS_OF_SPEECH,
} from "@/lib/constants/enums";
import { Badge } from "../ui/badge";
import { WordWithMeanings } from "./add-word-form";
import { ClipboardEventHandler } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { DifficultyLevel } from "@prisma/client";
import { ChevronUp, Plus, Trash, Volume2Icon, X } from "lucide-react";
import { handlePlayAudio } from "@/lib/utils/handlePlayAudio";
import IconDisplay from "../shared/icon-display";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";

interface MeaningProps {
  index: number;
  onRemove: (index: number) => void;
  register: UseFormRegister<WordWithMeanings>;
  setValue: UseFormSetValue<WordWithMeanings>;
  getValues: UseFormGetValues<WordWithMeanings>;
  control: Control<WordWithMeanings>;
  errors: string[] | undefined;
  entryType: "word" | "phrase";
  count: number;
}

const Meaning = memo(function Meaning({
  index,
  onRemove,
  register,
  setValue,
  getValues,
  control,
  errors,
  entryType,
  count,
}: MeaningProps) {
  const [isOpen, setIsOpen] = useState(true);

  const watchedExamples =
    useWatch({
      control,
      name: `meanings.${index}.exampleSentences`,
    }) || "";

  const examples = useMemo(() => watchedExamples.split("|"), [watchedExamples]);

  const handleRemove = () => {
    onRemove(index);
  };

  const handlePaste: ClipboardEventHandler<
    HTMLTextAreaElement | HTMLInputElement
  > = (event) => {
    event.preventDefault();
    const existingText = getValues(`meanings.${index}.exampleSentences`) || "";
    if (existingText) {
      return;
    }

    const clipboardData = event.clipboardData;
    const pastedText = clipboardData?.getData("text/plain");

    if (pastedText) {
      setValue(
        `meanings.${index}.exampleSentences`,
        pastedText.replace(/\n/g, "|"),
      );
    }
  };

  const updateExamples = (newList: string[]) => {
    setValue(`meanings.${index}.exampleSentences`, newList.join("|"));
  };

  const handleExampleChange = (idx: number, value: string) => {
    const newList = [...examples];
    newList[idx] = value.replace(/\|/g, ""); // Prevent manual pipe characters
    updateExamples(newList);
  };

  const addExample = () => {
    updateExamples([...examples, ""]);
  };

  const removeExample = (idx: number) => {
    if (examples.length <= 1) {
      updateExamples([""]);
      return;
    }
    const newList = examples.filter((_, i) => i !== idx);
    updateExamples(newList);
  };

  return (
    <div className="px-2 sm:px-4 py-3 first:border-t-0 border-t border-gray-200">
      <div className="flex items-center gap-2">
        {count > 1 && (
          <div className="flex justify-center items-center h-6 w-6 rounded-full bg-blue-600 text-white text-base">
            {index + 1}
          </div>
        )}
        <Controller
          control={control}
          name={`meanings.${index}.partOfSpeech`}
          render={({ field }) => (
            <Select
              onValueChange={field.onChange}
              value={field.value as PartOfSpeech}
            >
              <SelectTrigger className="w-fit" size="sm">
                <SelectValue placeholder="Part of Speech" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {PARTS_OF_SPEECH.map((part) => (
                    <SelectItem key={part} value={part}>
                      {part}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          )}
        />
        {!isOpen && getValues(`meanings.${index}.definition`).length > 0 && (
          <p className="text-sm">{getValues(`meanings.${index}.definition`)}</p>
        )}
        <div className="ms-auto"></div>
        {index === 0 && (
          <span className="text-sm px-3 py-0.5 rounded-md text-green-600 bg-green-100 shadow flex items-center justify-center">
            Primary
          </span>
        )}
        <IconDisplay
          icon={ChevronUp}
          asButton
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          iconColor="text-gray-600"
          additionalClasses={cn(
            "transition-transform duration-200",
            !isOpen && "rotate-180",
          )}
        />
        <IconDisplay
          icon={Trash}
          asButton
          size="sm"
          onClick={handleRemove}
          iconColor="text-red-600"
        />
      </div>
      {isOpen && (
        <div className="border rounded-md p-2 sm:p-4 grid grid-cols-1 md:grid-cols-12 mt-2">
          <div className="col-span-7 pe-0 border-e-0 md:pe-4 md:border-e space-y-3">
            {errors && <FieldError error={errors.join("\n")} />}
            <div className="grid gap-1">
              <Label htmlFor="definition" className="text-right">
                Definition
              </Label>
              <Textarea
                id="definition"
                required
                {...register(`meanings.${index}.definition`)}
              />
            </div>
            <div className="grid gap-1">
              <Label htmlFor="pronunciation" className="text-right">
                Pronunciation
              </Label>
              <div className="flex gap-1">
                <Input
                  id="pronunciation"
                  {...register(`meanings.${index}.pronunciation`)}
                />
                <Button
                  onClick={() => handlePlayAudio(getValues("word"))}
                  variant="ghost"
                  disabled={!getValues("word")}
                >
                  <Volume2Icon
                    width={14}
                    height={14}
                    className="text-gray-600"
                  />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground"></p>
            </div>
            <div className="grid gap-1">
              <Label className="text-right">
                Examples{" "}
                <span className="text-sm text-gray-500">
                  ({examples.length}/10)
                </span>
              </Label>
              <div className="space-y-1">
                {examples.map((ex, exIdx) => (
                  <div key={exIdx} className="flex gap-1">
                    <Input
                      value={ex}
                      onChange={(e) =>
                        handleExampleChange(exIdx, e.target.value)
                      }
                      onPaste={handlePaste}
                    />
                    <Button
                      onClick={() => removeExample(exIdx)}
                      variant="ghost"
                    >
                      <Trash width={14} height={14} className="text-red-600" />
                    </Button>
                  </div>
                ))}
              </div>
              <div className="flex justify-end items-end mt-1 gap-2">
                <Button
                  variant={"outline"}
                  type="button"
                  onClick={addExample}
                  size={"sm"}
                  className="h-7"
                >
                  <Plus width={14} height={14} className="text-blue-600" />
                  Add example
                </Button>
              </div>
            </div>
          </div>
          <div className="col-span-5  mt-3 md:mt-0 ps-0 md:ps-4 space-y-3">
            <div className="grid gap-1">
              <Label htmlFor="cefrLevel" className="text-right">
                CEFR Level
              </Label>
              <Controller
                control={control}
                name={`meanings.${index}.cefrLevel`}
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    value={field.value as DifficultyLevel}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select CEFR level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {CEFR_LEVELS.map((level) => (
                          <SelectItem key={level} value={level}>
                            {level}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="grid gap-1">
              <Label htmlFor="synonyms" className="text-right">
                Synonyms
              </Label>
              <Input
                id="synonyms"
                {...register(`meanings.${index}.synonyms`)}
              />
              <p className="text-xs text-muted-foreground">
                Seperate with commas
              </p>
            </div>
            <div className="grid gap-1">
              <Label htmlFor="antonyms" className="text-right">
                Antonyms
              </Label>
              <Input
                id="antonyms"
                {...register(`meanings.${index}.antonyms`)}
              />
              <p className="text-xs text-muted-foreground">
                Seperate with commas
              </p>
            </div>
            <div className="grid gap-1">
              <Label htmlFor="usage-notes" className="text-right">
                Usage Notes
              </Label>
              <Textarea
                id="usage-notes"
                {...register(`meanings.${index}.usageNotes`)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

export default Meaning;
