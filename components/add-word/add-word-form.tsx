"use client";
import {
  startTransition,
  useActionState,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import type { Word, WordMeaning } from "@prisma/client";
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
import {
  INITIAL_MEANING,
  INITIAL_WORD,
  initialActionState,
} from "@/lib/constants/initial-values";
import Meaning from "./meaning";
import WordSuggest from "./word-suggest";
import {
  checkWordExists,
  fillWithAI,
  saveWord,
} from "@/lib/actions/word.actions";
import { debounce } from "@/lib/utils/debounce";
import { MASTERY_LEVELS } from "@/lib/constants/enums";
import FieldError from "../shared/field-error";
import { Volume2Icon } from "lucide-react";
import { WordOfTheDay } from "../home/word-of-the-day";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Checkbox } from "../ui/checkbox";
import { QUERY_KEY } from "@/lib/constants/queryKey";

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
    word?.word || wordOfTheDay?.word || "",
  );
  const queryClient = useQueryClient();
  const [entryType, setEntryType] = useState<"word" | "phrase">(
    word?.type === "Phrase" ? "phrase" : "word",
  );
  const [wordExistsError, setWordExistsError] = useState<string | null>(null);
  const session = useSession();
  const [generated, setGenerated] = useState(false);
  const [state, formAction, isLoading] = useActionState(
    saveWord,
    initialActionState,
  );

  const defaultValues = (): WordWithMeanings => {
    const existingWord = word || wordOfTheDay;
    console.log(existingWord);
    if (existingWord) {
      return {
        ...INITIAL_WORD,
        ...existingWord,
        meanings: existingWord.meanings.map((meaning) => ({
          ...INITIAL_MEANING,
          ...meaning,
        })),
      } as WordWithMeanings;
    }
    return { ...INITIAL_WORD, meanings: [INITIAL_MEANING] };
  };

  const { register, getValues, setValue, handleSubmit, reset, control, watch } =
    useForm<WordWithMeanings>({
      defaultValues: defaultValues(),
    });
  const { fields, append, remove } = useFieldArray({
    control,
    name: "meanings",
  });

  const highlighted = watch("highlighted");

  const checkWord = useCallback(
    async (wordToCheck: string) => {
      // Don't check if we are editing the same word
      if (word && word.word.toLowerCase() === wordToCheck.toLowerCase()) {
        setWordExistsError(null);
        return;
      }
      const exists = await checkWordExists(wordToCheck);
      if (exists) {
        setWordExistsError(
          `The word "${wordToCheck}" already exists in your vocabulary.`,
        );
      } else {
        setWordExistsError(null);
      }
    },
    [word],
  );

  const debouncedCheckWord = useMemo(
    () => debounce(checkWord, 500),
    [checkWord],
  );

  const { mutate: fillWithAIMutate, isPending: isFillingWithAi } = useMutation({
    mutationKey: ["fillWithAI", enteredWord],
    mutationFn: async () => {
      const responseData = await fillWithAI(enteredWord);
      return responseData;
    },
    onSuccess: (data) => {
      if (!data) {
        setWordExistsError(`Could not find information for "${enteredWord}".`);
        return;
      }
      const result = JSON.parse(data);
      console.log(result);

      setValue("word", result.word.toLowerCase());
      setValue("meanings", result.meanings);
      setGenerated(true);
    },
  });

  const handleClickFillWithAi = async () => {
    if (enteredWord.trim().length === 0 || !session.data) return;
    fillWithAIMutate();
  };

  const handleClickAddMeaning = () => {
    append(INITIAL_MEANING);
  };

  const handleRemoveMeaning = (index: number) => {
    remove(index);
  };

  const handleWordChange = (value: string) => {
    const trimmedValue = value.trim();
    setEnteredWord(value);
    setValue("word", value);
    if (trimmedValue.length > 0) {
      debouncedCheckWord(trimmedValue);
    } else {
      reset({ ...INITIAL_WORD, meanings: [INITIAL_MEANING] });
      setGenerated(false);
      setWordExistsError(null);
    }
  };

  const onSubmit = (data: WordWithMeanings) => {
    const formData = new FormData();

    formData.append("type", entryType === "word" ? "Word" : "Phrase");

    // Manually append all fields to FormData
    Object.entries(data).forEach(([key, value]) => {
      if (key === "meanings") {
        // The 'id' field from prisma is not needed for create/update of meanings
        const meaningsWithoutId = (value as WordMeaning[]).map(
          ({ id, ...rest }) => rest,
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

  useEffect(() => {
    console.log(state);
    if (state && state.success) {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY.GET_WORDS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY.GET_RECENT_WORDS] });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEY.GET_WORDS_COUNT_BY_PERIOD],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEY.GET_WORDS_COUNT_BY_MASTERY_LEVEL],
      });

      onClose();
    }
  }, [state, onClose, queryClient]);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Add a hidden input for the word ID if it exists */}
      {word?.id && <input type="hidden" {...register("id")} value={word.id} />}
      <div className="grid gap-3 py-4 max-h-[70vh] md:max-h-[600px] custom-scrollbar-y overflow-y-auto">
        <div className="flex bg-muted p-1 rounded-lg">
          <Button
            type="button"
            variant={entryType === "word" ? "default" : "ghost"}
            className="flex-1 h-8 rounded-md"
            onClick={() => setEntryType("word")}
          >
            Word
          </Button>
          <Button
            type="button"
            variant={entryType === "phrase" ? "default" : "ghost"}
            className="flex-1 h-8 rounded-md"
            onClick={() => setEntryType("phrase")}
          >
            Phrase
          </Button>
        </div>
        <WordSuggest
          enteredWord={enteredWord}
          setEnteredWord={handleWordChange}
          existingWord={word?.word || wordOfTheDay?.word}
          entryType={entryType}
        />

        {wordExistsError && <FieldError error={wordExistsError} />}
        {state && !state.success && !state.errors && (
          <FieldError error={state.message} />
        )}
        <FieldError error={state?.errors?.word?.join(", ")} />
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
            {isFillingWithAi
              ? "Generating..."
              : generated
                ? `Regenerate`
                : `Fill with AI`}
          </Button>
        </div>
        <div className="flex items-end gap-1">
          <Checkbox
            id="highlighted"
            {...register("highlighted")}
            checked={highlighted}
            onCheckedChange={(value) => setValue("highlighted", !!value)}
          />
          <Label htmlFor="highlighted" className="text-right">
            Highlighed
          </Label>
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
          <FieldError error={state?.errors?.masteryLevel?.join(", ")} />
        </div>
        {fields.map((field, index) => (
          <Meaning
            key={field.id}
            index={index}
            onRemove={handleRemoveMeaning}
            register={register}
            setValue={setValue}
            getValues={getValues}
            control={control}
            errors={state?.errors?.meanings}
            entryType={entryType}
            count={fields.length}
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
          <Label htmlFor="tags" className="text-right">
            Tags
          </Label>
          <Input
            id="tags"
            placeholder="tag 1, tag 2, tag 3, ..."
            {...register("tags")}
          />
          <FieldError error={state?.errors?.tags?.join(", ")} />
        </div>
      </div>
      <div className="flex gap-2 justify-end mt-2">
        <Button variant={"outline"} type="button" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading || !!wordExistsError}>
          {!isLoading ? "Save" : "Saving..."}
        </Button>
      </div>
    </form>
  );
};

export default AddWordForm;
