"use client";
import React, { useState, useCallback } from "react";
import Recording from "@/components/talk/recording";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MessageSquare, Mic, Send } from "lucide-react";

interface TalkInputProps {
  onSendMessage: (text: string) => void;
  isProcessing: boolean;
  isLimitReached: boolean;
}

const TalkInput = ({
  onSendMessage,
  isProcessing,
  isLimitReached,
}: TalkInputProps) => {
  const [inputMode, setInputMode] = useState<"recording" | "text">("recording");
  const [textInput, setTextInput] = useState("");
  const isDev = process.env.NODE_ENV === "development";

  const handleTextSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (textInput.trim()) {
        onSendMessage(textInput.trim());
        setTextInput("");
      }
    },
    [textInput, onSendMessage],
  );

  return (
    <div className="h-fit">
      {isDev && (
        <div className="flex justify-end mb-2">
          <button
            type="button"
            onClick={() =>
              setInputMode((prev) =>
                prev === "recording" ? "text" : "recording",
              )
            }
            className="text-[10px] uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 font-bold cursor-pointer"
          >
            {inputMode === "recording" ? (
              <>
                <MessageSquare size={10} /> Text Mode (Dev)
              </>
            ) : (
              <>
                <Mic size={10} /> Voice Mode (Dev)
              </>
            )}
          </button>
        </div>
      )}

      {inputMode === "recording" ? (
        <Recording
          onTranscriptionComplete={onSendMessage}
          isProcessing={isProcessing}
          isLimitReached={isLimitReached}
        />
      ) : (
        <form
          onSubmit={handleTextSubmit}
          className="flex items-center gap-2 p-4 border rounded-md bg-muted/30"
        >
          <Input
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="Type your message..."
            className="bg-white"
            disabled={isProcessing || isLimitReached}
          />
          <Button
            type="submit"
            size="icon"
            disabled={isProcessing || !textInput.trim() || isLimitReached}
          >
            <Send size={18} />
          </Button>
        </form>
      )}
    </div>
  );
};

export default TalkInput;
