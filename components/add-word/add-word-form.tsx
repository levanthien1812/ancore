"use client";
import { startTransition, useActionState, useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import type { User, Word, WordMeaning } from "@prisma/client";
import { buildWordAutofillPrompt } from "@/lib/ai-prompts/word-autofill";
import { useSession } from "next-auth/react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { INITIAL_MEANING, INITIAL_WORD } from "@/lib/constants/initial-values";
import Meaning from "./meaning";
import WordSuggest from "./word-suggest";
import { saveWord } from "@/lib/actions/word.actions";
import { CEFR_LEVELS, MASTERY_LEVELS } from "@/lib/constants/enums";
import FieldError from "../shared/field-error";
import { Volume2Icon } from "lucide-react";
import { WordOfTheDay } from "../home/word-of-the-day";

const initialState = {
  success: false,
  message: "",
  errors: {},
};

export type WordWithMeanings = Word & {
  meanings: WordMeaning[];
};

interface AddWordFormProps {
  word?: WordWithMeanings;
  onClose: () => void;
  wordOfTheDay?: WordOfTheDay;
}

const AddWordForm = ({ word, onClose, wordOfTheDay }: AddWordFormProps) => {
  const [enteredWord, setEnteredWord] = useState(
    word?.word || wordOfTheDay?.word || ""
  );
  const defaultValues = (): WordWithMeanings => {
    if (word) return word;
    if (wordOfTheDay) {
      return {
        ...INITIAL_WORD,
        ...wordOfTheDay,
        meanings: wordOfTheDay.meanings.map((meaning) => ({
          ...INITIAL_MEANING,
          ...meaning,
        })),
      } as WordWithMeanings;
    }
    return { ...INITIAL_WORD, meanings: [INITIAL_MEANING] };
  };

  const { register, setValue, handleSubmit, reset, control } =
    useForm<WordWithMeanings>({
      defaultValues: defaultValues(),
    });
  const { fields, append, remove } = useFieldArray({
    control,
    name: "meanings",
  });
  const session = useSession();
  const [generated, setGenerated] = useState(false);
  const [state, formAction, isLoading] = useActionState(saveWord, initialState);

  const handleClickFillWithAi = async () => {
    if (enteredWord.trim().length === 0 || !session.data) return;

    const prompt = buildWordAutofillPrompt(
      enteredWord,
      session.data.user as User
    );

    const response = await fetch("/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt }),
    });

    if (response.ok) {
      const data = await response.json();
      const result = JSON.parse(data.result);

      setValue("word", result.word.toLowerCase());
      setValue("pronunciation", result.pronunciation);
      setValue("cefrLevel", result.cefrLevel);
      setValue("meanings", result.meanings);
      setGenerated(true);
    }
  };

  const handleClickAddMeaning = () => {
    append(INITIAL_MEANING);
  };

  const handleRemoveMeaning = (index: number) => {
    remove(index);
  };

  const handleWordChange = (value: string) => {
    setEnteredWord(value);
    setValue("word", value);
    if (value.trim().length === 0) {
      reset({ ...INITIAL_WORD, meanings: [INITIAL_MEANING] });
      setGenerated(false);
    }
  };

  // if (state.success) {
  //   reset();
  //   setMeanings([INITIAL_MEANING]);
  //   setGenerated(false);
  // }

  const onSubmit = (data: WordWithMeanings) => {
    const formData = new FormData();

    // Manually append all fields to FormData
    Object.entries(data).forEach(([key, value]) => {
      if (key === "meanings") {
        // The 'id' field from prisma is not needed for create/update of meanings
        const meaningsWithoutId = (value as WordMeaning[]).map(
          ({ id, ...rest }) => rest
        );
        formData.append(key, JSON.stringify(meaningsWithoutId));
      } else if (key === "id" && value) {
        formData.append(key, value as string);
      } else if (value !== null && value !== undefined) {
        formData.append(key, String(value));
      }
    });

    startTransition(() => {
      formAction(formData);
    });
  };

  const handlePlayAudio = () => {
    const utterance = new SpeechSynthesisUtterance(enteredWord);
    utterance.lang = "en-US";
    utterance.volume = 1;
    utterance.rate = 1;
    utterance.pitch = 1;
    speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    if (state.success) {
      onClose();
    }
  }, [state.success, onClose]);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Add a hidden input for the word ID if it exists */}
      {word?.id && <input type="hidden" {...register("id")} value={word.id} />}
      <div className="grid gap-3 py-4 max-h-[600px] custom-scrollbar-y">
        <WordSuggest
          enteredWord={enteredWord}
          setEnteredWord={handleWordChange}
          existingWord={word?.word || wordOfTheDay?.word}
        />

        {state.success === false && !state.errors && (
          <FieldError error={state.message} />
        )}
        <FieldError error={state.errors?.word?.join(", ")} />
        <Input id="word" name="word" type="hidden" value={enteredWord} />
        <div className="flex justify-end items-center">
          {enteredWord.trim().length > 0 && (
            <Button
              variant={"link"}
              type="button"
              onClick={() => handleWordChange("")}
            >
              Clear
            </Button>
          )}
          <Button
            variant={"secondary"}
            type="button"
            onClick={handleClickFillWithAi}
            disabled={enteredWord.trim().length === 0}
          >
            {generated ? `Regenerate` : `Fill with AI`}
          </Button>
        </div>
        <div className="grid gap-1">
          <Label htmlFor="pronunciation" className="text-right">
            Pronunciation
          </Label>
          <div className="flex gap-1">
            <Input id="pronunciation" {...register("pronunciation")} />
            <Button
              variant={"outline"}
              type="button"
              onClick={handlePlayAudio}
              disabled={enteredWord.trim().length === 0}
            >
              <Volume2Icon />
            </Button>
          </div>
          <FieldError error={state.errors?.pronunciation?.join(", ")} />
        </div>
        <div className="grid gap-1">
          <Label htmlFor="masteryLevel" className="text-right">
            Mastery Level
          </Label>
          <Controller
            control={control}
            name="masteryLevel"
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select mastery level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {MASTERY_LEVELS.map((level) => (
                      <SelectItem key={level} value={level}>
                        {level}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            )}
          />
          <FieldError error={state.errors?.masteryLevel?.join(", ")} />
        </div>
        {fields.map((field, index) => (
          <Meaning
            key={field.id}
            index={index}
            onRemove={handleRemoveMeaning}
            register={register}
            setValue={setValue}
            errors={state.errors?.meanings}
          />
        ))}
        <div className="flex justify-end">
          <Button
            variant={"outline"}
            type="button"
            onClick={handleClickAddMeaning}
          >
            Add meaning
          </Button>
        </div>
        <div className="grid gap-1">
          <Label htmlFor="cefrLevel" className="text-right">
            CEFR Level
          </Label>
          <Controller
            control={control}
            name="cefrLevel"
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
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
          <FieldError error={state.errors?.cefrLevel?.join(", ")} />
        </div>
        <div className="grid gap-1">
          <Label htmlFor="tags" className="text-right">
            Tags
          </Label>
          <Input
            id="tags"
            placeholder="tag 1, tag 2, tag 3, ..."
            {...register("tags")}
          />
          <FieldError error={state.errors?.tags?.join(", ")} />
        </div>
      </div>
      <div className="flex gap-2 justify-end mt-2">
        <Button variant={"outline"} type="button" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {!isLoading ? "Save" : "Saving..."}
        </Button>
      </div>
    </form>
  );
};

export default AddWordForm;
