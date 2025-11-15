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
import { UseFormRegister } from "react-hook-form";
import { WordWithMeanings } from "./add-word-form";
import FieldError from "../shared/field-error";
interface MeaningProps {
  index: number;
  onRemove: (index: number) => void;
  register: UseFormRegister<WordWithMeanings>;
  errors: string[] | undefined;
}

const Meaning = ({ index, onRemove, register, errors }: MeaningProps) => {
  const handleRemove = () => {
    onRemove(index);
  };

  return (
    <div className="border border-border-2 border-dashed rounded-lg p-4 grid gap-3">
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
        <Label htmlFor="example" className="text-right">
          Example
        </Label>
        <Textarea
          id="example"
          placeholder="e.g. An apple a day keeps the doctor away."
          {...register(`meanings.${index}.exampleSentences`)}
        />
      </div>
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="item-1">
          <AccordionTrigger className="text-sm">
            Additional Information
          </AccordionTrigger>
          <AccordionContent className="mt-2">
            <div className="grid gap-3">
              <div className="grid gap-1">
                <Label htmlFor="part-of-speech" className="text-right">
                  Part of Speech
                </Label>
                <Input
                  id="part-of-speech"
                  {...register(`meanings.${index}.partOfSpeech`)}
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
                <Label htmlFor="user-notes" className="text-right">
                  User Notes
                </Label>
                <Textarea
                  id="user-notes"
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
