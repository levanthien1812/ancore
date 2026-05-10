"use client";
import React from "react";
import { Loader2, Sparkles, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import { Message } from "@/lib/type"; // Import Message type from shared file

const TalkConversation = ({
  messages,
  isAiThinking,
  onSave,
  isSaving,
}: {
  messages: Message[];
  isAiThinking: boolean;
  onSave?: () => void;
  isSaving?: boolean;
}) => {
  return (
    <div className="flex flex-col h-full gap-4 p-4">
      <div className="flex-1 overflow-y-auto space-y-4 no-scrollbar">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={cn(
              "flex flex-col max-w-[85%] gap-1",
              msg.role === "user" ? "ms-auto items-end" : "me-auto items-start",
            )}
          >
            <div
              className={cn(
                "px-4 py-2 rounded-2xl text-sm",
                msg.role === "user"
                  ? "bg-primary text-white rounded-tr-none"
                  : "bg-muted border rounded-tl-none",
              )}
            >
              {msg.content}
            </div>

            {msg.refinement && (
              <div className="flex items-center gap-1.5 px-3 py-1 bg-green-50 border border-green-200 rounded-lg text-[11px] text-green-700 animate-in fade-in slide-in-from-top-1">
                <Sparkles size={12} className="shrink-0" />
                <span className="font-medium italic">
                  Better: {msg.refinement}
                </span>
              </div>
            )}
          </div>
        ))}

        {isAiThinking && (
          <div className="flex items-center gap-2 text-muted-foreground text-xs italic">
            <Loader2 className="h-3 w-3 animate-spin" />
            AI is thinking...
          </div>
        )}
      </div>

      <div className="pt-2 border-t flex items-center justify-between">
        <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
          Practice Session
        </p>
        {onSave && (
          <button
            onClick={onSave}
            disabled={isSaving || messages.length <= 1}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors disabled:opacity-50"
          >
            {isSaving ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <Save size={12} />
            )}
            {isSaving ? "Saving..." : "Save Session"}
          </button>
        )}
      </div>
    </div>
  );
};

export default TalkConversation;
