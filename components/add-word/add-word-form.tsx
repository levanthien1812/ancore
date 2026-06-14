"use client";
import {
  startTransition,
  useActionState,
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
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
  INITIAL_ACTION_STATE,
} from "@/lib/constants/initial-values";
import Meaning from "./meaning";
import WordSuggest from "./word-suggest";
import AiMeaningSuggest from "./ai-meaning-suggest";
import {
  checkWordExists,
  fillWithAI,
  getWordsAddedToday,
  saveWord,
} from "@/lib/actions/word.actions";
import { debounce } from "@/lib/utils/debounce";
import {
  CEFR_LEVELS,
  CEFRLevel,
  MASTERY_LEVELS,
  NotificationType,
} from "@/lib/constants/enums";
import FieldError from "../shared/field-error";
import { WordOfTheDay } from "../home/word-of-the-day";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Checkbox } from "../ui/checkbox";
import { QUERY_KEY } from "@/lib/constants/queryKey";
import { BookOpen, Info, Layers2, Plus, Sparkles, X } from "lucide-react";
import { Badge } from "../ui/badge";
import { toast } from "sonner";
import { WordDefinitionOutput } from "@/app/services/fill-word-with-ai";
import { parseWordFromCambridge } from "@/lib/utils/word-parser-from-cambridge";
import PasteWordTips from "./paste-word-tips";
import { useLayout } from "../layout/layout-context";
import { createNotification } from "@/lib/actions/notification.actions";

export type WordWithMeanings = Word & {
  meanings: WordMeaning[];
};

interface AddOrEditWordFormProps {
  word?: WordWithMeanings;
  onClose: () => void;
  wordOfTheDay?: WordOfTheDay;
  initialWord?: string;
}

const AddOrEditWordForm = ({
  word,
  onClose,
  wordOfTheDay,
  initialWord,
}: AddOrEditWordFormProps) => {
  const { settings } = useLayout();
  const processedSuccessRef = useRef(false);
  const { refetch: refetchTodayCount } = useQuery({
    queryKey: ["wordsAddedToday"],
    queryFn: () => getWordsAddedToday(),
  });
  const [enteredWord, setEnteredWord] = useState(
    word?.word || wordOfTheDay?.word || initialWord || "",
  );
  const queryClient = useQueryClient();
  const [entryType, setEntryType] = useState<"word" | "phrase">(
    word?.type === "Phrase" ? "phrase" : "word",
  );
  const [wordExistsError, setWordExistsError] = useState<string | null>(null);
  const session = useSession();
  const [generated, setGenerated] = useState(word?.isOriginal || false);
  const [state, formAction, isLoading] = useActionState(
    saveWord,
    INITIAL_ACTION_STATE,
  );

  const defaultValues = (): WordWithMeanings => {
    const existingWord = word || wordOfTheDay;
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

  // Memoize default values to prevent re-calculation on every keystroke
  const initialValues = useMemo(() => defaultValues(), [word, wordOfTheDay]);

  const { register, getValues, setValue, handleSubmit, reset, control, watch } =
    useForm<WordWithMeanings>({
      defaultValues: initialValues,
    });
  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: "meanings",
  });

  const highlighted = watch("highlighted");
  const watchedTags = watch("tags"); // Watch the tags field from react-hook-form
  const meanings = watch("meanings"); // Watch the tags field from react-hook-form
  const [currentTagInput, setCurrentTagInput] = useState(""); // Local state for the tag input field

  const parsedTags = useMemo(() => {
    if (!watchedTags) return [];
    return watchedTags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
  }, [watchedTags]);

  const { mutate: checkWordExistsMutate } = useMutation({
    mutationKey: ["checkWordExists"],
    mutationFn: async (wordToCheck: string) => {
      const exists = await checkWordExists(wordToCheck);
      return exists;
    },
    onSuccess: (exists) => {
      if (exists) {
        setWordExistsError(
          `The word "${enteredWord}" already exists in your vocabulary.`,
        );
      } else {
        setWordExistsError(null);
      }
    },
  });

  const checkWord = useCallback(
    async (wordToCheck: string) => {
      // Don't check if we are editing the same word
      if (word && word.word.toLowerCase() === wordToCheck.toLowerCase()) {
        setWordExistsError(null);
        return;
      }
      checkWordExistsMutate(wordToCheck);
    },
    [word, checkWordExistsMutate],
  );

  const debouncedCheckWord = useMemo(
    () => debounce(checkWord, 500),
    [checkWord],
  );

  const handleAiSuccess = useCallback(
    (data: WordDefinitionOutput, mode: "append" | "replace") => {
      setValue("word", data.word.toLowerCase());

      const mappedMeanings = data.meanings.map((meaning) => ({
        ...INITIAL_MEANING,
        id: "temp-" + Math.random(),
        wordId: word?.id ?? "",
        definition: meaning.definition,
        pronunciation: meaning.pronunciation ?? null,
        cefrLevel:
          meaning.cefrLevel &&
          CEFR_LEVELS.includes(meaning.cefrLevel as CEFRLevel)
            ? (meaning.cefrLevel as CEFRLevel)
            : null,
        partOfSpeech: meaning.partOfSpeech ?? null,
        examples: meaning.examples ?? [""],
        synonyms: meaning.synonyms ?? null,
        antonyms: meaning.antonyms ?? null,
        usageNotes: data.usageNotes ?? null,
      }));

      if (mode === "replace") {
        setGenerated(true);
        replace(mappedMeanings);
        toast.success("Meanings replaced by AI suggestion");
      } else {
        setGenerated(false);
        append(mappedMeanings);
        toast.success("New meanings added to existing list");
      }
    },
    [setValue, word?.id, replace, append],
  );

  const { mutate: fillWithAIMutate, isPending: isFillingWithAi } = useMutation({
    mutationKey: ["fillWithAI"], // Stabilize mutation key to avoid overhead during typing
    mutationFn: async () => {
      const responseData = await fillWithAI(enteredWord);
      return responseData;
    },
    onSuccess: (data) => {
      if (!data) {
        setWordExistsError(`Could not find information for "${enteredWord}".`);
        return;
      }

      setValue("word", data.word.toLowerCase());

      const mappedMeanings = data.meanings.map((meaning, index) => ({
        id: `${index}`,
        wordId: word?.id ?? "",
        definition: meaning.definition,
        guideWord: meaning.guideWord?.toLowerCase() || null,
        pronunciation: meaning.pronunciation ?? null,
        cefrLevel:
          meaning.cefrLevel &&
          CEFR_LEVELS.includes(meaning.cefrLevel as CEFRLevel)
            ? (meaning.cefrLevel as CEFRLevel)
            : null,
        partOfSpeech: meaning.partOfSpeech ?? null,
        examples: meaning.examples ?? [""],
        synonyms: meaning.synonyms ?? null,
        antonyms: meaning.antonyms ?? null,
        usageNotes: data.usageNotes ?? null,
      }));

      setGenerated(true);
      replace(mappedMeanings);
    },
  });

  const handleClickFillWithAi = async () => {
    if (enteredWord.trim().length === 0 || !session.data) return;
    fillWithAIMutate();
  };

  const handleClickAddMeaning = () => {
    setGenerated(false);
    append(INITIAL_MEANING);
  };

  const handleRemoveMeaning = (index: number) => {
    setGenerated(false);
    remove(index);
  };

  const handleWordChange = useCallback(
    (value: string) => {
      const trimmedValue = value.trim();
      setEnteredWord(value);
      setValue("word", value);
      if (trimmedValue.length > 0) {
        debouncedCheckWord(trimmedValue);
      } else {
        if (word) {
          reset({ ...INITIAL_WORD, id: word.id, meanings: [INITIAL_MEANING] });
        } else {
          reset({ ...INITIAL_WORD, meanings: [INITIAL_MEANING] });
        }
        setGenerated(false);
        setWordExistsError(null);
      }
    },
    [debouncedCheckWord, reset, setValue, setEnteredWord, word],
  );

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
    formData.append("isOriginal", String(generated));

    startTransition(() => {
      formAction(formData);
    });
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && currentTagInput.trim()) {
      e.preventDefault();
      const newTag = currentTagInput.trim();
      if (!parsedTags.includes(newTag)) {
        const updatedTags = [...parsedTags, newTag];
        setValue("tags", updatedTags.join(", "));
      }
      setCurrentTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const updatedTags = parsedTags.filter((tag) => tag !== tagToRemove);
    setValue("tags", updatedTags.join(", "));
  };

  const handlePasteWord = (e: React.ClipboardEvent) => {
    e.preventDefault();
    if (enteredWord.trim().length > 0) {
      toast.info("Please clear the word input before pasting new content");
      return;
    }
    const parsedContent = parseWordFromCambridge(
      e.clipboardData.getData("text/html"),
    );

    if (!parsedContent) {
      return;
    }

    const {
      word: parsedWord,
      definition,
      pronunciation,
      pos,
      cefr,
      examples,
      synonyms,
      antonyms,
      guideWord,
    } = parsedContent;

    handleWordChange(parsedWord);
    replace([
      {
        ...INITIAL_MEANING,
        id: "temp-" + Math.random(),
        definition,
        guideWord: guideWord ?? null,
        pronunciation: pronunciation || null,
        partOfSpeech: pos || null,
        cefrLevel:
          cefr && CEFR_LEVELS.includes(cefr as CEFRLevel)
            ? (cefr as CEFRLevel)
            : null,
        examples: examples.length > 0 ? examples : [""],
        synonyms: synonyms || null,
        antonyms: antonyms || null,
      },
    ]);
    toast.success("Imported details from Cambridge Dictionary");
  };

  useEffect(() => {
    if (initialWord && !word && !wordOfTheDay) {
      checkWord(initialWord);
    }
  }, [initialWord, word, wordOfTheDay, checkWord]);

  useEffect(() => {
    if (state && state.success && !processedSuccessRef.current) {
      processedSuccessRef.current = true;
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY.GET_WORDS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY.GET_RECENT_WORDS] });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEY.GET_WORDS_COUNT_BY_PERIOD],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEY.GET_WORDS_COUNT_BY_MASTERY_LEVEL],
      });
      queryClient.invalidateQueries({ queryKey: ["wordsAddedToday"] });

      if (!word) {
        const goal = settings?.dailyNewWordsGoal ?? 5;
        refetchTodayCount().then((result) => {
          if (result.data && result.data === goal) {
            createNotification({
              type: NotificationType.DailyNewWordsGoal,
              title: "Daily Goal Reached!",
              message: `Congratulations! You've reached your daily goal of ${goal} words! 🎊`,
              actionUrl: "/words",
            });
          }
        });
      }

      if (word?.id) {
        queryClient.invalidateQueries({
          queryKey: ["review-info", word.id],
        });
      }

      onClose();
    }
  }, [state, onClose, queryClient, word, settings, refetchTodayCount]);

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="max-h-[70vh] no-scrollbar overflow-y-auto"
    >
      {/* Add a hidden input for the word ID if it exists */}
      {word?.id && <input type="hidden" {...register("id")} value={word.id} />}
      <div className="rounded-lg border border-gray-200">
        <div className="w-full px-2 sm:px-4 py-2 flex items-center justify-between gap-2 bg-gray-50 rounded-t-lg">
          <div className="flex gap-2">
            <Info
              width={20}
              height={20}
              className="text-blue-600 my-auto hidden md:block"
            />
            <div>
              <p className="text-lg font-bold">1. Basic information</p>
              <p className="text-xs text-muted-foreground">
                Core details about this word
              </p>
            </div>
          </div>
          <div className="flex gap-1">
            <Button
              type="button"
              variant={entryType === "word" ? "default" : "outline"}
              className="py-1 px-2 sm:px-4 rounded-full h-fit"
              onClick={() => setEntryType("word")}
            >
              Word
            </Button>
            <Button
              type="button"
              variant={entryType === "phrase" ? "default" : "outline"}
              className="py-1 px-2 sm:px-4 rounded-full h-fit"
              onClick={() => setEntryType("phrase")}
            >
              Phrase
            </Button>
          </div>
        </div>
        <div className="w-full border-t border-gray-200 p-2 sm:p-4">
          <div className="grid grid-cols-1 md:grid-cols-12">
            <div className="col-span-7 pe-0 border-e-0 md:pe-4 md:border-e">
              <div className="flex gap-2 items-end">
                <WordSuggest
                  enteredWord={enteredWord}
                  setEnteredWord={handleWordChange}
                  existingWord={word?.word || wordOfTheDay?.word}
                  entryType={entryType}
                  onPaste={handlePasteWord}
                />
                <Button
                  variant={"outline"}
                  type="button"
                  onClick={handleClickFillWithAi}
                  disabled={enteredWord.trim().length === 0 || isFillingWithAi}
                >
                  <Sparkles width={14} height={14} className="text-blue-600" />
                  {isFillingWithAi
                    ? "Generating..."
                    : generated
                      ? `Regenerate`
                      : `Auto-fill details`}
                </Button>
              </div>
            </div>
            <div className="col-span-5 flex gap-2 ps-0 mt-3 md:ps-4 md:mt-0">
              <div className="grid gap-1 w-full">
                <Label htmlFor="masteryLevel" className="text-right">
                  Mastery Level
                </Label>
                <Controller
                  control={control}
                  name="masteryLevel"
                  render={({ field }) => (
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || undefined}
                    >
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
              </div>
            </div>
            <FieldError error={state?.errors?.masteryLevel?.join(", ")} />
          </div>
          {(wordExistsError || !state?.success) && (
            <FieldError error={wordExistsError || state?.message} />
          )}
          <div className="flex justify-between gap-2 items-end">
            <div className="flex gap-2 mt-4">
              <Checkbox
                id="highlighted"
                {...register("highlighted")}
                checked={highlighted}
                onCheckedChange={(value) => setValue("highlighted", !!value)}
              />
              <div>
                <Label htmlFor="highlighted" className="text-right">
                  Highlighed
                </Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Mark this word as highlighted in your content
                </p>
              </div>
            </div>
            <PasteWordTips />
          </div>
        </div>
      </div>
      <div className="rounded-lg border border-gray-200 overflow-hidden mt-2">
        <div className="w-full px-2 sm:px-4 py-2 flex items-center justify-between gap-2 bg-gray-50">
          <div className="flex gap-2">
            <BookOpen
              width={20}
              height={20}
              className="text-blue-600 my-auto hidden md:block"
            />
            <div>
              <p className="text-lg font-bold">2. Meaning ({fields.length})</p>
              <p className="text-xs text-muted-foreground">
                A word can have multiple meanings. Each meaning has its own
                pronunication and CEFR level.
              </p>
            </div>
          </div>
          <div className="flex gap-1">
            <Button
              variant={"outline"}
              type="button"
              size={"sm"}
              onClick={handleClickAddMeaning}
            >
              <Plus width={14} height={14} className="text-blue-600" />
              Add meaning
            </Button>
          </div>
        </div>
        <div className="w-full border-t border-gray-200">
          <div className="flex justify-end">
            <AiMeaningSuggest
              enteredWord={enteredWord}
              existingMeanings={meanings}
              onSuccess={handleAiSuccess}
            />
          </div>
          <div>
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
          </div>
        </div>
      </div>
      <div className="rounded-lg border border-gray-200 overflow-hidden mt-2">
        <div className="w-full px-2 sm:px-4 py-2 flex items-center justify-between gap-2 bg-gray-50">
          <div className="flex gap-2">
            <Layers2
              width={20}
              height={20}
              className="text-blue-600 my-auto hidden md:block"
            />
            <div>
              <p className="text-lg font-bold">3. Additional Infomation</p>
              <p className="text-xs text-muted-foreground">
                Related tags for this words
              </p>
            </div>
          </div>
        </div>
        <div className="w-full border-t border-gray-200 p-2 sm:p-4">
          <div className="grid gap-1">
            <Label htmlFor="tags" className="text-right">
              Tags
            </Label>
            <Input
              id="tags"
              placeholder="Add tags ..."
              value={currentTagInput}
              onChange={(e) => setCurrentTagInput(e.target.value)}
              onKeyDown={handleAddTag}
            />
            <FieldError error={state?.errors?.tags?.join(", ")} />
            <p className="text-xs text-muted-foreground">
              Press Enter to add a tag
            </p>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {parsedTags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="flex items-center gap-1"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-1 text-muted-foreground hover:text-foreground"
                >
                  <X width={12} height={12} />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      </div>
      <div className="flex gap-2 mt-2 p-2 w-full rounded-md border bg-white/80 sticky bottom-0">
        {word && (
          <Button
            variant={"secondary"}
            type="button"
            onClick={onClose}
            className="text-red-600"
          >
            Delete
          </Button>
        )}
        <Button
          variant={"ghost"}
          type="button"
          onClick={onClose}
          className="ms-auto"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isLoading || !!wordExistsError}
          isLoading={isLoading}
        >
          {!isLoading ? "Save changes" : "Saving changes..."}
        </Button>
      </div>
    </form>
  );
};

export default AddOrEditWordForm;
