"use client";
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getTalkSessions } from "@/lib/actions/ai.actions";
import { format } from "date-fns";
import { isToday, isYesterday } from "date-fns";
import {
  MessageCircle,
  Calendar as CalendarIcon,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Play,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "../ui/card";
import { cn } from "@/lib/utils";
import { TalkSessionWithMessages, Message } from "@/lib/type";

const TalkHistory = ({
  onContinue,
}: {
  onContinue: (sessionId: string, messages: Message[]) => void;
}) => {
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(
    null,
  );

  const { data: sessions, isLoading } = useQuery<TalkSessionWithMessages[]>({
    queryKey: ["talkSessions"],
    queryFn: () => getTalkSessions(),
  });

  // Group sessions by date
  const groupedSessions: { [key: string]: TalkSessionWithMessages[] } = {};
  sessions?.forEach((session) => {
    const dateKey = format(new Date(session.createdAt), "yyyy-MM-dd");
    if (!groupedSessions[dateKey]) {
      groupedSessions[dateKey] = [];
    }
    groupedSessions[dateKey].push(session);
  });

  // Function to display date for headers
  const getDisplayDate = (dateString: string) => {
    const date = new Date(dateString);
    if (isToday(date)) {
      return "Today";
    }
    if (isYesterday(date)) {
      return "Yesterday";
    }
    return format(date, "EEEE, MMMM d, yyyy");
  };

  if (isLoading) {
    return (
      <div className="text-center py-10 text-muted-foreground italic">
        Loading history...
      </div>
    );
  }

  if (!sessions || sessions.length === 0) {
    return (
      <div className="text-center py-10 text-muted-foreground border rounded-lg border-dashed">
        No talk history found. Start a conversation to see it here!
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 h-full custom-scrollbar-y pb-10">
      {Object.keys(groupedSessions)
        .sort((a, b) => new Date(b).getTime() - new Date(a).getTime()) // Sort dates in descending order
        .map((dateKey) => (
          <div key={dateKey}>
            <h3 className="text-sm font-semibold text-muted-foreground px-2 py-1 sticky top-0 bg-white z-10">
              {getDisplayDate(dateKey)}
            </h3>
            {groupedSessions[dateKey].map((session) => {
              const isExpanded = expandedSessionId === session.id;

              return (
                <Card key={session.id} className="py-0 gap-0 mt-2">
                  <CardHeader
                    className="p-4 cursor-pointer hover:bg-muted/30 transition-colors gap-0"
                    onClick={() =>
                      setExpandedSessionId(isExpanded ? null : session.id)
                    }
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col gap-1">
                        <p className="font-semibold text-sm line-clamp-1">
                          {session.title || "Untitled Session"}
                        </p>
                        <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <CalendarIcon size={12} />
                            {format(new Date(session.createdAt), "MMM d, yyyy")}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageCircle size={12} />
                            {session.messages.length} messages
                          </span>
                        </div>
                      </div>
                      {isExpanded ? (
                        <ChevronUp size={18} />
                      ) : (
                        <ChevronDown size={18} />
                      )}
                    </div>
                  </CardHeader>
                  {isExpanded && (
                    <CardContent className="p-0 border-t bg-muted/5">
                      <div className="flex items-center justify-between p-3 bg-muted/10 border-b">
                        <span className="text-[10px] text-muted-foreground uppercase font-medium">
                          Session Review
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onContinue(
                              session.id,
                              session.messages.map((m) => ({
                                role: m.role as "user" | "assistant",
                                content: m.content,
                                refinement: m.refinement,
                                explanation: m.explanation,
                                evaluation: m.evaluation,
                                speakingSuggestions: m.speakingSuggestions,
                              })),
                            );
                          }}
                          className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary text-white text-[10px] font-bold hover:opacity-90 transition-opacity"
                        >
                          <Play size={10} fill="currentColor" />
                          Continue
                        </button>
                      </div>
                      <div className="space-y-4 p-4 max-h-[400px] custom-scrollbar-y">
                        {session.messages.map((msg) => (
                          <div
                            key={msg.id}
                            className={cn(
                              "flex flex-col max-w-[90%] gap-1",
                              msg.role === "user"
                                ? "ms-auto items-end"
                                : "me-auto items-start",
                            )}
                          >
                            <div
                              className={cn(
                                "px-3 py-1.5 rounded-xl text-xs",
                                msg.role === "user"
                                  ? "bg-primary text-white rounded-tr-none"
                                  : "bg-muted border rounded-tl-none",
                              )}
                            >
                              {msg.content}
                            </div>
                            {msg.refinement && (
                              <div className="flex items-center gap-1.5 px-2 py-1 bg-green-50 border border-green-200 rounded-lg text-[10px] text-green-700 italic">
                                <Sparkles size={10} className="shrink-0" />
                                <span>Better: {msg.refinement}</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        ))}
    </div>
  );
};

export default TalkHistory;
