"use client";
import { WordMeaning } from "@/lib/generated/prisma/client";
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

interface MeaningProps {
  meaning: WordMeaning;
  index: number;
  onRemove: (index: number) => void;
  setMeaning: (meaning: WordMeaning) => void;
}

const Meaning = ({ meaning, index, onRemove, setMeaning }: MeaningProps) => {
  const handleRemove = () => {
    onRemove(index);
  };

  return (
    <div
      className="border border-dashed rounded-lg p-4 grid gap-3"
      key={meaning.id}
    >
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
      <div className="grid gap-1">
        <Label htmlFor="definition" className="text-right">
          Definition
        </Label>
        <Textarea
          id="definition"
          name="definition"
          required
          value={meaning.definition}
          onChange={(event) => {
            setMeaning({ ...meaning, definition: event.target.value });
          }}
        />
      </div>
      <div className="grid gap-1">
        <Label htmlFor="example" className="text-right">
          Example
        </Label>
        <Textarea
          id="example"
          name="example"
          placeholder="e.g. An apple a day keeps the doctor away."
          value={meaning.exampleSentences.join("\n")}
          onChange={(event) => {
            setMeaning({
              ...meaning,
              exampleSentences: event.target.value.split("\n"),
            });
          }}
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
                  name="part-of-speech"
                  value={meaning.partOfSpeech || ""}
                  onChange={(event) => {
                    setMeaning({
                      ...meaning,
                      partOfSpeech: event.target.value,
                    });
                  }}
                />
              </div>
              <div className="grid gap-1">
                <Label htmlFor="synonyms" className="text-right">
                  Synonyms
                </Label>
                <Input
                  id="synonyms"
                  name="synonyms"
                  value={meaning.synonyms.join(", ")}
                  onChange={(event) => {
                    setMeaning({
                      ...meaning,
                      synonyms: event.target.value.split(", "),
                    });
                  }}
                />
              </div>
              <div className="grid gap-1">
                <Label htmlFor="antonyms" className="text-right">
                  Antonyms
                </Label>
                <Input
                  id="antonyms"
                  name="antonyms"
                  value={meaning.antonyms.join(", ")}
                  onChange={(event) => {
                    setMeaning({
                      ...meaning,
                      antonyms: event.target.value.split(", "),
                    });
                  }}
                />
              </div>
              <div className="grid gap-1">
                <Label htmlFor="user-notes" className="text-right">
                  User Notes
                </Label>
                <Textarea
                  id="user-notes"
                  name="user-notes"
                  value={meaning.usageNotes || ""}
                  onChange={(event) => {
                    setMeaning({
                      ...meaning,
                      usageNotes: event.target.value,
                    });
                  }}
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
