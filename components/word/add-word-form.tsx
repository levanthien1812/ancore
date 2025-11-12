"use client";
import { startTransition, useActionState, useState } from "react";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { User, Word, WordMeaning } from "@/lib/generated/prisma/client";
import { buildWordAutofillPrompt } from "@/lib/ai-prompts/word-autofill";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
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

const initialState = {
  success: false,
  message: "",
  errors: {},
};

type WordWithMeanings = Word & {
  meanings: WordMeaning[];
};

const AddWordForm = () => {
  const [enteredWord, setEnteredWord] = useState("");
  const {
    register,
    setValue,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<WordWithMeanings>({ defaultValues: INITIAL_WORD });
  const session = useSession();
  const [meanings, setMeanings] = useState<WordMeaning[]>([INITIAL_MEANING]);
  const [generated, setGenerated] = useState(false);
  const [state, formAction] = useActionState(saveWord, initialState);

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
      console.log(result);

      setValue("word", result.word);
      setValue("pronunciation", result.pronunciation);
      setValue("cefrLevel", result.cefrLevel);
      setMeanings(result.meanings);
      setGenerated(true);
    }
  };

  const handleClickAddMeaning = () => {
    setMeanings([...meanings, INITIAL_MEANING]);
  };

  const handleRemoveMeaning = (index: number) => {
    const newMeanings = [...meanings];
    newMeanings.splice(index, 1);
    setMeanings(newMeanings);
  };

  const handleChangeMeaning = (index: number, meaning: WordMeaning) => {
    const newMeanings = [...meanings];
    newMeanings[index] = meaning;
    setMeanings(newMeanings);
  };

  const handleWordChange = (value: string) => {
    setEnteredWord(value);
    if (value.trim().length === 0) {
      reset();
      setMeanings([INITIAL_MEANING]);
      setGenerated(false);
    }
  };

  // if (state.success) {
  //   reset();
  //   setMeanings([INITIAL_MEANING]);
  //   setGenerated(false);
  // }

  const handleSubmitForm = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(() => {
      formAction(formData);
    });
  };

  return (
    <form onSubmit={handleSubmitForm}>
      <div className="grid gap-3 py-4 max-h-[600px] overflow-y-scroll">
        <WordSuggest
          enteredWord={enteredWord}
          setEnteredWord={handleWordChange}
        />
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
          >
            {generated ? `Regenerate` : `Fill with AI`}
          </Button>
        </div>
        <div className="grid gap-1">
          <Label htmlFor="pronunciation" className="text-right">
            Pronunciation
          </Label>
          <Input id="pronunciation" {...register("pronunciation")} />
        </div>
        <div className="grid gap-1">
          <Label htmlFor="cefrLevel" className="text-right">
            CEFR Level
          </Label>
          <Select {...register("cefrLevel")}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select CEFR level" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="A1">A1</SelectItem>
                <SelectItem value="A2">A2</SelectItem>
                <SelectItem value="B1">B1</SelectItem>
                <SelectItem value="B2">B2</SelectItem>
                <SelectItem value="C1">C1</SelectItem>
                <SelectItem value="C2">C2</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        {meanings.map((meaning, index) => (
          <Meaning
            key={index}
            meaning={meaning}
            index={index}
            onRemove={handleRemoveMeaning}
            setMeaning={(m) => handleChangeMeaning(index, m)}
          />
        ))}
        <div className="flex justify-end">
          <Button
            variant={"link"}
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
        </div>
        <input
          type="hidden"
          {...register("meanings")}
          value={JSON.stringify(meanings)}
        />
      </div>
      <div className="flex gap-2 justify-end mt-2">
        <Button>Cancel</Button>
        <Button type="submit">Add</Button>
      </div>
    </form>
  );
};

export default AddWordForm;
