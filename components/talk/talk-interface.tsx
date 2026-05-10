"use client";
import React, { useState, useTransition, useEffect, useCallback } from "react";
import Recording from "@/components/talk/recording";
import TalkConversation from "@/components/talk/talk-conversation";
import { getChatResponse, saveTalkSession } from "@/lib/actions/ai.actions";
import { useQueryClient } from "@tanstack/react-query";
import { Message } from "@/lib/type"; // Import Message type from shared file
import { AI_GREETINGS } from "@/lib/constants/constant";

const TalkInterface = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isPending, startTransition] = useTransition();
  const [isSaving, startSaveTransition] = useTransition();
  const queryClient = useQueryClient();

  // Pick a random greeting only after the component has mounted on the client
  useEffect(() => {
    // Using a timeout breaks the synchronous setState call within the effect,
    // resolving the "cascading renders" error while still preventing hydration mismatch.
    const timer = setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * AI_GREETINGS.length);
      setMessages([{ role: "assistant", content: AI_GREETINGS[randomIndex] }]);
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  const handleSendMessage = useCallback(
    (text: string) => {
      const userMsg: Message = { role: "user", content: text };
      const newMessages = [...messages, userMsg];

      setMessages(newMessages);

      startTransition(async () => {
        // Prepare history for API (clean version without refinements)
        const apiHistory = newMessages.map(({ role, content }) => ({
          role,
          content,
        }));

        const result = await getChatResponse(apiHistory);

        console.log(result);

        if (result.success && result.data) {
          const aiMessage: Message = {
            role: "assistant",
            content: result.data.reply,
          };

          setMessages((prev) => {
            const updated = [...prev];
            // Apply the refinement to the user message we just sent
            const lastUserIndex = updated.findLastIndex(
              (m) => m.role === "user",
            );
            if (lastUserIndex !== -1) {
              updated[lastUserIndex].refinement = result.data.refinement;
            }
            return [...updated, aiMessage];
          });
        }
      });
    },
    [messages],
  );

  const handleSave = useCallback(() => {
    startSaveTransition(async () => {
      const result = await saveTalkSession(messages);
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ["talkSessions"] });
        alert("Conversation saved to your history!");
      } else {
        alert(result.message);
      }
    });
  }, [messages, queryClient]);

  return (
    <>
      <div className="flex-1 min-h-0 border rounded-md overflow-hidden bg-white">
        <TalkConversation
          messages={messages}
          isAiThinking={isPending}
          onSave={handleSave}
          isSaving={isSaving}
        />
      </div>
      <div className="h-fit">
        <Recording
          onTranscriptionComplete={handleSendMessage}
          isProcessing={isPending}
        />
      </div>
    </>
  );
};

export default TalkInterface;
