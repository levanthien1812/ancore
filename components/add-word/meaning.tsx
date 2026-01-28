"use client";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";
import {
  Control,
  Controller,
  UseFormGetValues,
  UseFormRegister,
  UseFormSetValue,
  useWatch,
} from "react-hook-form";
import FieldError from "../shared/field-error";
import { CEFR_LEVELS, PARTS_OF_SPEECH } from "@/lib/constants/enums";
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
import TagList from "../shared/tag-list";

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

const Meaning = ({
  index,
  onRemove,
  register,
  setValue,
  getValues,
  control,
  errors,
  entryType,
  count,
}: MeaningProps) => {
  const watchedPartOfSpeech = useWatch({
    control,
    name: `meanings.${index}.partOfSpeech`,
  });

  const handleRemove = () => {
    onRemove(index);
  };

  const handlePaste: ClipboardEventHandler<HTMLTextAreaElement> = (event) => {
    event.preventDefault();

    const clipboardData = event.clipboardData;
    const pastedText = clipboardData?.getData("text/plain");

    if (pastedText) {
      setValue(
        `meanings.${index}.exampleSentences`,
        pastedText.replace(/\n/g, "|"),
      );
    }
  };

  return (
    <div className="border border-border-2 border-dashed rounded-lg p-4 grid gap-3">
      {count > 1 && (
        <div className="flex justify-between items-center">
          <p className="text-lg">Meaning {index + 1}:</p>
          <Button
            variant={"link"}
            type="button"
            onClick={handleRemove}
            className="text-sm text-gray-600"
          >
            Remove
          </Button>
        </div>
      )}
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
      {entryType === "word" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div className="grid gap-1">
            <Label htmlFor="pronunciation" className="text-right">
              Pronunciation
            </Label>
            <Input
              id="pronunciation"
              {...register(`meanings.${index}.pronunciation`)}
            />
          </div>
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
        </div>
      )}
      <div className="grid gap-1">
        <Label htmlFor="example" className="text-right">
          Example
        </Label>
        <Textarea
          id="example"
          placeholder="e.g. An apple a day keeps the doctor away."
          {...register(`meanings.${index}.exampleSentences`)}
          onPaste={handlePaste}
        />
      </div>
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="item-1">
          <AccordionTrigger className="text-sm">
            Additional Information
          </AccordionTrigger>
          <AccordionContent className="mt-2">
            <div className="grid gap-3">
              {entryType === "word" && (
                <div className="grid gap-1">
                  <Label htmlFor="part-of-speech" className="text-right">
                    Part of Speech
                  </Label>
                  <Input
                    id="part-of-speech"
                    {...register(`meanings.${index}.partOfSpeech`)}
                  />
                  <TagList
                    items={PARTS_OF_SPEECH}
                    selected={watchedPartOfSpeech ? [watchedPartOfSpeech] : []}
                    onTagClick={(tag) =>
                      setValue(`meanings.${index}.partOfSpeech`, tag)
                    }
                  />
                </div>
              )}
              <div className="grid gap-1">
                <Label htmlFor="whenToUse" className="text-right">
                  When to use
                </Label>
                <Input
                  id="whenToUse"
                  {...register(`meanings.${index}.whenToUse`)}
                />
              </div>
              <div className="grid gap-1">
                <Label htmlFor="synonyms" className="text-right">
                  Synonyms
                </Label>
                <Input
                  id="synonyms"
                  {...register(`meanings.${index}.synonyms`)}
                  placeholder="synonym 1, synonym 2, synonym 3"
                />
              </div>
              <div className="grid gap-1">
                <Label htmlFor="antonyms" className="text-right">
                  Antonyms
                </Label>
                <Input
                  id="antonyms"
                  {...register(`meanings.${index}.antonyms`)}
                  placeholder="antonym 1, antonym 2, antonym 3"
                />
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
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default Meaning;
