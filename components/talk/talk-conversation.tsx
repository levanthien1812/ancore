"use client";
import React from "react";
import Image from "next/image";
import {
  Loader2,
  Sparkles,
  Info,
  Trophy,
  Save,
  Plus,
  Volume2,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Message } from "@/lib/type"; // Import Message type from shared file
import Chatbot from "@/public/images/chatbot.png";
import User from "@/public/images/user.png";
import { format } from "date-fns";
import IconDisplay from "../shared/icon-display";

const TalkConversation = ({
  messages,
  isAiThinking,
  onSave,
  isSaving,
  activeNudge,
  onNewSession,
  onPlayAudio,
  onRegenerate,
}: {
  messages: Message[];
  isAiThinking: boolean;
  onSave?: () => void;
  isSaving?: boolean;
  activeNudge?: string | null;
  onNewSession?: () => void;
  onPlayAudio?: (text: string) => void;
  onRegenerate?: () => void;
}) => {
  const lastMessage = messages[messages.length - 1];
  const canRegenerate = lastMessage?.role === "user" && !isAiThinking;

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
            <div className="flex items-start gap-2 group max-w-full">
              {msg.role === "assistant" && (
                <div className="hidden sm:block w-8 sm:h-8 rounded-full overflow-hidden shrink-0 mt-0.5 p-1 bg-gray-50 shadow">
                  <Image
                    src={Chatbot}
                    alt="AI"
                    width={32}
                    height={32}
                    className="object-cover"
                    title="AI"
                  />
                </div>
              )}
              {msg.role === "user" && onPlayAudio && (
                <button
                  onClick={() => onPlayAudio(msg.content)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full hover:bg-muted shrink-0"
                  title="Play audio"
                >
                  <Volume2 size={14} className="text-muted-foreground" />
                </button>
              )}
              <div
                className={`flex flex-col gap-1 ${msg.role === "user" ? "items-end" : "items-start"}`}
              >
                <p className={"block sm:hidden text-xs text-muted-foreground"}>
                  {msg.role === "user" ? "You" : "AI"}
                </p>
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
                <div className={`text-[10px] text-muted-foreground`}>
                  {format(msg.createdAt, "h:mm a")}
                </div>

                {msg.refinement && (
                  <div className="flex items-center gap-2 px-3 py-1 bg-green-50 border border-green-200 rounded-lg animate-in fade-in slide-in-from-top-1 w-full">
                    <IconDisplay
                      icon={Sparkles}
                      iconColor="text-green-600"
                      bgClass="bg-green-100"
                    />
                    <div>
                      <p className="text-green-600 font-bold text-[13px]">
                        Better
                      </p>
                      <p className="mt-0.5 text-xs text-gray-700">
                        {msg.refinement}
                      </p>
                    </div>
                  </div>
                )}
                {msg.explanation && (
                  <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-200 rounded-lg animate-in fade-in slide-in-from-top-1 w-full">
                    <IconDisplay
                      icon={Info}
                      iconColor="text-blue-600"
                      bgClass="bg-blue-100"
                    />
                    <div>
                      <p className="text-blue-600 font-bold text-[13px]">
                        Explanation
                      </p>
                      <p className="mt-0.5 text-xs text-gray-700">
                        {msg.explanation}
                      </p>
                    </div>
                  </div>
                )}
                {msg.evaluation && (
                  <div className="flex items-center gap-2 px-3 py-1 bg-yellow-50 border border-yellow-200 rounded-lg animate-in fade-in slide-in-from-top-1 w-full">
                    <IconDisplay
                      icon={Trophy}
                      iconColor="text-yellow-600"
                      bgClass="bg-yellow-100"
                    />
                    <div>
                      <p className="text-yellow-600 font-bold text-[13px]">
                        Evaluation
                      </p>
                      <p className="mt-0.5 text-xs text-gray-700">
                        {msg.evaluation}
                      </p>
                    </div>
                  </div>
                )}
                {msg.speakingSuggestions &&
                  msg.speakingSuggestions.length > 0 && (
                    <div className="flex items-center gap-2 px-3 py-1 bg-purple-50 border border-purple-200 rounded-lg animate-in fade-in slide-in-from-top-1 w-full">
                      <IconDisplay
                        icon={Sparkles}
                        iconColor="text-purple-600"
                        bgClass="bg-purple-100"
                      />
                      <div>
                        <p className="text-purple-600 font-bold text-[13px]">
                          Speaking Suggestions
                        </p>
                        <div className="mt-0.5 text-xs text-gray-700 space-y-1">
                          {msg.speakingSuggestions.map((s) => (
                            <p key={s}>{s}</p>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
              </div>
              {msg.role === "assistant" && onPlayAudio && (
                <button
                  onClick={() => onPlayAudio(msg.content)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full hover:bg-muted shrink-0"
                  title="Play audio"
                >
                  <Volume2 size={14} className="text-muted-foreground" />
                </button>
              )}
              {msg.role === "user" && (
                <div className="hidden sm:block w-8 sm:h-8 rounded-full overflow-hidden bg-gray-50 shadow p-1 shrink-0 mt-0.5">
                  <Image
                    src={User}
                    alt="Me"
                    width={32}
                    height={32}
                    className="object-cover"
                    title="Me"
                  />
                </div>
              )}
            </div>
          </div>
        ))}

        {activeNudge && (
          <div className="flex flex-col max-w-[85%] gap-1 items-start me-auto animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex items-start gap-2 group max-w-full">
              <div className="w-8 h-8 rounded-full overflow-hidden border bg-white shrink-0 mt-0.5">
                <Image
                  src={Chatbot}
                  alt="AI"
                  width={32}
                  height={32}
                  className="object-cover"
                />
              </div>
              <div className="px-4 py-2 rounded-2xl text-sm bg-muted border rounded-tl-none border-dashed border-primary/30">
                <div className="flex items-center gap-1.5 mb-1 text-[10px] text-primary font-bold uppercase tracking-wider">
                  <Sparkles size={10} />
                  Tutor Hint
                </div>
                {activeNudge}
              </div>
            </div>
          </div>
        )}

        {isAiThinking && (
          <div className="flex items-center gap-2 text-muted-foreground text-xs italic me-auto">
            <div className="w-8 h-8 rounded-full overflow-hidden border bg-white shrink-0">
              <Image
                src={Chatbot}
                alt="AI"
                width={32}
                height={32}
                className="object-cover"
              />
            </div>
            <Loader2 className="h-3 w-3 animate-spin" />
            AI is thinking...
          </div>
        )}

        {canRegenerate && onRegenerate && (
          <div className="flex justify-center py-2 animate-in fade-in slide-in-from-bottom-1">
            <button
              onClick={onRegenerate}
              disabled={isAiThinking}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold bg-white border border-primary/20 text-primary shadow-sm hover:bg-primary/5 transition-all"
            >
              <RefreshCw size={14} />
              Regenerate Response
            </button>
          </div>
        )}
      </div>

      <div className="pt-2 border-t flex items-center justify-between">
        <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
          Practice Session
        </p>
        <div className="flex items-center gap-2">
          {onNewSession && (
            <button
              onClick={onNewSession}
              disabled={isAiThinking || isSaving || messages.length === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors disabled:opacity-50"
            >
              <Plus size={12} />
              New Session
            </button>
          )}
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
    </div>
  );
};

export default TalkConversation;
