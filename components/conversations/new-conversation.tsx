"use client";
import { useState } from "react";
import { ENGLISH_TOPICS } from "@/lib/constants/constant";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Button } from "../ui/button";
import {
  Sparkles,
  BookmarkPlus,
  MessageSquareQuote,
  BookOpenCheck,
  Dices,
  History,
} from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import AddOrEditWord from "../add-word/add-word";
import { Card, CardContent } from "../ui/card";
import { Skeleton } from "../ui/skeleton";
import {
  generateConversation,
  savePracticeContent,
} from "@/lib/actions/dialogue.action";

const NewConversation = () => {
  const [topicId, setTopicId] = useState<string>("");
  const [subTopic, setSubTopic] = useState<string>("");
  const [type, setType] = useState<"dialogue" | "self-talk">("dialogue");

  const selectedTopic = ENGLISH_TOPICS.find((t) => t.id.toString() === topicId);

  const {
    mutate: handleGenerate,
    data,
    isPending,
  } = useMutation({
    mutationFn: async () => {
      if (!selectedTopic || !subTopic) return;
      return await generateConversation(selectedTopic.topic, subTopic, type);
    },
    onSuccess: () => {
      setIsSaved(false);
    },
    onError: () => toast.error("Failed to generate conversation. Try again."),
  });

  const [isSaved, setIsSaved] = useState(false);

  const { mutate: handleSave, isPending: isSaving } = useMutation({
    mutationFn: async () => {
      if (!data || !selectedTopic) return;
      return await savePracticeContent({
        title: data.title,
        type,
        topic: selectedTopic.topic,
        subTopic,
        content: type === "dialogue" ? data.conversation : data.selfTalk,
        words: data.words,
      });
    },
    onSuccess: () => {
      setIsSaved(true);
      toast.success("Conversation saved to history!");
    },
    onError: () => toast.error("Failed to save. Try again."),
  });

  const handleRandomize = () => {
    const randomTopic =
      ENGLISH_TOPICS[Math.floor(Math.random() * ENGLISH_TOPICS.length)];
    const randomSubTopic =
      randomTopic.subTopics[
        Math.floor(Math.random() * randomTopic.subTopics.length)
      ];
    const randomType = Math.random() > 0.5 ? "dialogue" : "self-talk";

    setTopicId(randomTopic.id.toString());
    setSubTopic(randomSubTopic);
    setType(randomType);
  };

  return (
    <div className="flex flex-col gap-6 py-4">
      <div className="space-y-4 p-4 border rounded-xl bg-gray-50/50 relative">
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 text-primary hover:bg-primary/10"
          onClick={handleRandomize}
          title="Randomize Topic & Type"
        >
          <Dices size={18} />
        </Button>
        <div className="grid gap-2">
          <Label>Step 1: Choose a Topic</Label>
          <Select
            value={topicId}
            onValueChange={(val) => {
              setTopicId(val);
              setSubTopic("");
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {ENGLISH_TOPICS.map((t) => (
                <SelectItem key={t.id} value={t.id.toString()}>
                  {t.topic}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label>Step 2: Choose a Specific Context</Label>
          <Select
            value={subTopic}
            onValueChange={setSubTopic}
            disabled={!topicId}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a sub-topic" />
            </SelectTrigger>
            <SelectContent>
              {selectedTopic?.subTopics.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label>Step 3: Generation Type</Label>
          <Select
            value={type}
            onValueChange={(val) => setType(val as "dialogue" | "self-talk")}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dialogue">Natural Dialogue</SelectItem>
              <SelectItem value="self-talk">Self-talk / Monologue</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          className="w-full"
          disabled={!subTopic || isPending}
          onClick={() => handleGenerate()}
        >
          {isPending ? "Writing dialogue..." : "Generate Conversation"}
          <Sparkles className="ml-2 h-4 w-4" />
        </Button>
      </div>

      {isPending && (
        <div className="space-y-4">
          <Skeleton className="h-40 w-full rounded-xl" />
          <Skeleton className="h-20 w-full rounded-xl" />
        </div>
      )}

      {data && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Dialogue Section */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-primary font-bold">
                <MessageSquareQuote size={20} />
                <h3>Practice Dialogue</h3>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleSave()}
                disabled={isSaved || isSaving}
                className="h-8 gap-1.5"
              >
                {isSaved ? (
                  "Saved"
                ) : (
                  <>
                    <History size={14} />
                    Save History
                  </>
                )}
              </Button>
            </div>
            <p className="text-sm font-medium text-muted-foreground">
              {data.title}
            </p>
            <Card className="border-primary/20 shadow-sm">
              <CardContent className="p-4 space-y-4">
                {data.conversation?.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex flex-col w-full ${i % 2 === 0 ? "items-start" : "items-end"}`}
                  >
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      {Object.keys(msg)[0]}
                    </span>
                    <p
                      className={`mt-1 p-3 rounded-2xl text-sm max-w-[85%] ${
                        i % 2 === 0
                          ? "bg-blue-50 text-blue-900 rounded-tl-none"
                          : "bg-gray-100 text-gray-900 rounded-tr-none"
                      }`}
                    >
                      {Object.values(msg)[0]}
                    </p>
                  </div>
                ))}

                {data.selfTalk?.map((sentence, i) => (
                  <div
                    key={i}
                    className={`flex flex-col w-full ${i % 2 === 0 ? "items-start" : "items-end"}`}
                  >
                    <p
                      className={`p-3 rounded-2xl text-sm max-w-[85%] ${
                        i % 2 === 0
                          ? "bg-purple-50 text-purple-900 rounded-tl-none border-l-2 border-purple-200"
                          : "bg-gray-100 text-gray-900 rounded-tr-none border-r-2 border-gray-200"
                      }`}
                    >
                      {sentence}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </section>

          {/* Useful Words Section */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-green-600 font-bold">
              <BookOpenCheck size={20} />
              <h3>Useful Vocabulary</h3>
            </div>
            <div className="grid gap-3">
              {data.words.map((wordData, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 border rounded-lg bg-white hover:border-primary/50 transition-colors shadow-xs"
                >
                  <div className="flex-1">
                    <div className="flex items-baseline gap-2">
                      <span className="font-bold text-lg">{wordData.word}</span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-1">
                      {wordData.meaning}
                    </p>
                  </div>
                  <AddOrEditWord
                    initialWord={wordData.word}
                    triggerButton={
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-primary"
                      >
                        <BookmarkPlus size={18} />
                      </Button>
                    }
                  />
                </div>
              ))}
            </div>
          </section>

          <div className="text-center pb-10">
            <p className="text-xs text-muted-foreground italic">
              Read the dialogue out loud to practice your pronunciation!
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewConversation;
