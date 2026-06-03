"use client";
import { useState, memo } from "react";
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
  CEFRLevel,
  PARTS_OF_SPEECH,
  PARTS_OF_SPEECH_PHRASES,
} from "@/lib/constants/enums";
import { WordWithMeanings } from "./add-word-form";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { ChevronUp, Ellipsis, Plus, Trash, Volume2Icon } from "lucide-react";
import { handlePlayAudio } from "@/lib/utils/handlePlayAudio";
import { formatPronunciation } from "@/lib/utils/pronunciation";
import { parseWordFromCambridge } from "@/lib/utils/word-parser-from-cambridge";
import { INITIAL_MEANING } from "@/lib/constants/initial-values";
import IconDisplay from "../shared/icon-display";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { MAXIMUM_EXAMPLES } from "@/lib/constants/constant";
import { toast } from "sonner";

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
  count,
  entryType,
}: MeaningProps) {
  const [isOpen, setIsOpen] = useState(true);

  const examples =
    useWatch({
      control,
      name: `meanings.${index}.examples`,
    }) || [];

  const handleRemove = () => {
    onRemove(index);
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const htmlData = e.clipboardData.getData("text/html");
    console.log(htmlData);
    let newItems: string[] = [];

    if (htmlData) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlData, "text/html");
      // Detect Cambridge Dictionary example elements
      const elements = doc.querySelectorAll(".eg.deg");
      if (elements.length > 0) {
        newItems = Array.from(elements)
          .map((el) => el.textContent?.trim())
          .filter((t): t is string => !!t);
      }
    }

    // Fallback to splitting by newline if no structured HTML examples were found
    if (newItems.length === 0) {
      const textData = e.clipboardData.getData("text/plain");
      if (textData && textData.includes("\n")) {
        newItems = textData
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean);
      }
    }

    if (newItems.length > 0) {
      e.preventDefault();
      const current = examples.filter((ex) => ex.trim() !== "");
      const combined = [...current, ...newItems].slice(0, MAXIMUM_EXAMPLES);
      updateExamples(combined.length > 0 ? combined : [""]);
      toast.success(`Imported ${newItems.length} example(s) from clipboard`);
    }
  };

  const updateExamples = (newList: string[]) => {
    setValue(`meanings.${index}.examples`, newList);
  };

  const handleExampleChange = (idx: number, value: string) => {
    const newList = [...examples];
    newList[idx] = value;
    updateExamples(newList);
  };

  const addExample = () => {
    if (examples.length >= MAXIMUM_EXAMPLES) {
      return;
    }
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

  const handlePasteDefinition = (
    e: React.ClipboardEvent<HTMLTextAreaElement>,
  ) => {
    const currentDef = getValues(`meanings.${index}.definition`);
    if (currentDef && currentDef.trim() !== "") {
      return;
    }
    const htmlData = e.clipboardData.getData("text/html");
    const parsed = parseWordFromCambridge(htmlData, true);

    if (parsed) {
      e.preventDefault();
      const newMeaning = {
        ...INITIAL_MEANING,
        id: "temp-" + Math.random(),
        definition: parsed.definition,
        pronunciation: parsed.pronunciation || null,
        partOfSpeech: parsed.pos || null,
        cefrLevel:
          parsed.cefr && CEFR_LEVELS.includes(parsed.cefr as CEFRLevel)
            ? (parsed.cefr as CEFRLevel)
            : null,
        examples: parsed.examples.length > 0 ? parsed.examples : [""],
        synonyms: parsed.synonyms || null,
        antonyms: parsed.antonyms || null,
      };

      setValue(`meanings.${index}.definition`, newMeaning.definition);
      setValue(`meanings.${index}.pronunciation`, newMeaning.pronunciation);
      setValue(`meanings.${index}.partOfSpeech`, newMeaning.partOfSpeech);
      setValue(`meanings.${index}.cefrLevel`, newMeaning.cefrLevel);
      setValue(`meanings.${index}.examples`, newMeaning.examples);
      setValue(`meanings.${index}.synonyms`, newMeaning.synonyms);
      setValue(`meanings.${index}.antonyms`, newMeaning.antonyms);

      toast.success("Populated current meaning block");
      return;
    }

    const text = e.clipboardData.getData("text/plain");
    if (text) {
      e.preventDefault();
      let cleaned = text.trim();
      if (cleaned.endsWith(":")) {
        cleaned = cleaned.slice(0, -1).trim();
      }
      setValue(`meanings.${index}.definition`, cleaned);
    }
  };

  const handlePastePronunciation = (
    e: React.ClipboardEvent<HTMLInputElement>,
  ) => {
    const text = e.clipboardData.getData("text/plain");
    if (text) {
      e.preventDefault();
      const cleaned = formatPronunciation(text.trim());
      setValue(`meanings.${index}.pronunciation`, cleaned);
    }
  };

  const handleSetAsPrimary = () => {
    // move primary meaning to the begining
    const meanings = getValues("meanings");
    setValue("meanings", [meanings[index], ...meanings.slice(0, index)]);
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
              value={field.value || undefined}
            >
              <SelectTrigger className="w-fit" size="sm">
                <SelectValue placeholder="Part of Speech" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {(entryType === "word"
                    ? PARTS_OF_SPEECH
                    : PARTS_OF_SPEECH_PHRASES
                  ).map((part) => (
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
        <Popover>
          <PopoverTrigger asChild>
            <IconDisplay icon={Ellipsis} iconColor="text-primary" asButton />
          </PopoverTrigger>
          <PopoverContent className="w-fit p-0">
            {index !== 0 && (
              <div className="">
                <Button variant={"link"} onClick={handleSetAsPrimary}>
                  Set as primary
                </Button>
              </div>
            )}
            <div className="border-t">
              <Button
                variant={"link"}
                className="text-red-600"
                onClick={handleRemove}
              >
                Delete
              </Button>
            </div>
          </PopoverContent>
        </Popover>
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
                onPaste={handlePasteDefinition}
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
                  onPaste={handlePastePronunciation}
                />
                <Button
                  type="button"
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
              <div className="space-y-1" onPaste={handlePaste}>
                {examples.map((ex, exIdx) => (
                  <div key={exIdx} className="flex gap-1">
                    <Input
                      value={ex}
                      onChange={(e) =>
                        handleExampleChange(exIdx, e.target.value)
                      }
                    />
                    <Button
                      type="button"
                      onClick={() => removeExample(exIdx)}
                      variant="ghost"
                    >
                      <Trash width={14} height={14} className="text-red-600" />
                    </Button>
                  </div>
                ))}
              </div>
              {examples.length < MAXIMUM_EXAMPLES && (
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
              )}
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
                    value={field.value || undefined}
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
