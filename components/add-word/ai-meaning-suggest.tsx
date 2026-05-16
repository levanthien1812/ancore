"use client";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { PARTS_OF_SPEECH } from "@/lib/constants/enums";
import { useMutation } from "@tanstack/react-query";
import { fillWithAI } from "@/lib/actions/word.actions";
import { toast } from "sonner";
import { WordDefinitionOutput } from "@/app/services/fill-word-with-ai";

interface AiMeaningSuggestProps {
  enteredWord: string;
  existingMeanings: { definition: string }[];
  onSuccess: (data: WordDefinitionOutput, mode: "append" | "replace") => void;
}

const AiMeaningSuggest = ({
  enteredWord,
  existingMeanings,
  onSuccess,
}: AiMeaningSuggestProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [relatedTo, setRelatedTo] = useState("");
  const [selectedPos, setSelectedPos] = useState<string | undefined>(undefined);
  const [integrationMode, setIntegrationMode] = useState<"append" | "replace">(
    "replace",
  );

  const { mutate: addMeaningWithAIMutate, isPending } = useMutation({
    mutationKey: ["addMeaningWithAI", enteredWord],
    mutationFn: async (pos?: string) => {
      const currentDefinitions = existingMeanings
        .map((m) => m.definition)
        .filter(Boolean);
      return await fillWithAI(enteredWord, pos, currentDefinitions, relatedTo);
    },
    onSuccess: (data) => {
      if (data && data.meanings && data.meanings.length > 0) {
        onSuccess(data, integrationMode);
        setIsOpen(false);
      } else {
        toast.error(
          "Could not generate new meanings. Try a different part of speech.",
        );
      }
    },
  });

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant={"link"}
          className="italic"
          disabled={enteredWord.length === 0}
        >
          Want specific meanings?
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Suggest suitable meanings with AI</DialogTitle>
        </DialogHeader>
        {existingMeanings.filter((m) => m.definition.length > 0).length > 0 && (
          <div>
            <p className="text-sm text-gray-600 italic">
              Avoid generating meanings that are identical or very similar to
              these existing definitions:{" "}
            </p>
            <ul className="list-inside list-disc mt-1">
              {existingMeanings
                .filter((m) => m.definition.length > 0)
                .map((meaning, index) => (
                  <li key={index} className="text-sm text-primary italic">
                    {meaning.definition}
                  </li>
                ))}
            </ul>
          </div>
        )}
        <div className="space-y-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="relatedTo">Related to (Optional)</Label>
            <Input
              id="relatedTo"
              placeholder="e.g., technology, business, travel"
              value={relatedTo}
              onChange={(e) => setRelatedTo(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="pos">Part of Speech (Optional)</Label>
            <Select value={selectedPos} onValueChange={setSelectedPos}>
              <SelectTrigger className="w-full whitespace-nowrap" name="pos">
                <SelectValue placeholder="Select Part of Speech" />
              </SelectTrigger>
              <SelectContent>
                {PARTS_OF_SPEECH.map((pos) => (
                  <SelectItem key={pos} value={pos}>
                    {pos}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="mode">Integration method</Label>
            <Select
              value={integrationMode}
              onValueChange={(val) =>
                setIntegrationMode(val as "append" | "replace")
              }
            >
              <SelectTrigger className="w-full" name="mode">
                <SelectValue placeholder="Select method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="replace">Replace existing</SelectItem>
                <SelectItem value="append">Append to existing</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button
            onClick={() => addMeaningWithAIMutate(selectedPos)}
            disabled={isPending}
            isLoading={isPending}
          >
            {integrationMode === "replace"
              ? "Generate & Replace"
              : "Generate & Append"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AiMeaningSuggest;
