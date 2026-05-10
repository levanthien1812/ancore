"use client";
import React, { useState, useTransition, useEffect, useCallback } from "react";
import Recording from "@/components/talk/recording";
import TalkConversation from "@/components/talk/talk-conversation";
import { getChatResponse, saveTalkSession } from "@/lib/actions/ai.actions";
import { useQueryClient } from "@tanstack/react-query";
import { Message } from "@/lib/type"; // Import Message type from shared file
import {
  AI_GREETINGS,
  MAXIMUM_MESSAGES_IN_CHAT,
} from "@/lib/constants/constant";
import { toast } from "sonner";

const TalkInterface = ({
  initialMessages,
  sessionId,
}: {
  initialMessages?: Message[];
  sessionId?: string;
}) => {
  const [messages, setMessages] = useState<Message[]>(() => {
    // If initialMessages are provided, ensure they don't exceed the maximum limit.
    if (initialMessages && initialMessages.length > MAXIMUM_MESSAGES_IN_CHAT) {
      // Keep only the latest MAXIMUM_MESSAGES_IN_CHAT messages
      return initialMessages.slice(-MAXIMUM_MESSAGES_IN_CHAT);
    }
    return initialMessages || [];
  });
  const [isPending, startTransition] = useTransition();
  const [isSaving, startSaveTransition] = useTransition();
  const queryClient = useQueryClient();

  // Pick a random greeting only after the component has mounted on the client
  useEffect(() => {
    if (messages.length > 0) return;

    // Using a timeout breaks the synchronous setState call within the effect,
    // resolving the "cascading renders" error while still preventing hydration mismatch.
    const timer = setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * AI_GREETINGS.length);
      setMessages([{ role: "assistant", content: AI_GREETINGS[randomIndex] }]);
    }, 0);

    return () => clearTimeout(timer);
  }, [messages.length]);

  const handleSendMessage = useCallback(
    (text: string) => {
      const userMsg: Message = { role: "user", content: text };
      const updatedMessages = [...messages, userMsg];

      // Ensure the message count does not exceed the limit after adding user message
      while (updatedMessages.length > MAXIMUM_MESSAGES_IN_CHAT) {
        updatedMessages.shift(); // Remove the oldest message
      }

      setMessages(updatedMessages);

      startTransition(async () => {
        // Prepare history for API (clean version without refinements)
        const apiHistory = updatedMessages.map(({ role, content }) => ({
          role,
          content,
        }));

        const result = await getChatResponse(apiHistory);

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
          setMessages((prev) => {
            const newConversation = [...prev, aiMessage];
            // Ensure the message count does not exceed the limit after adding AI message
            while (newConversation.length > MAXIMUM_MESSAGES_IN_CHAT) {
              newConversation.shift();
            } // Remove the oldest message
            return newConversation;
          });
        }
      });
    },
    [messages],
  );

  const handleSave = useCallback(() => {
    startSaveTransition(async () => {
      const result = await saveTalkSession(messages, sessionId);
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ["talkSessions"] });
        toast.success("Conversation saved to your history!");
      } else {
        alert(result.message);
      }
    });
  }, [messages, queryClient, sessionId]);

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
          isLimitReached={messages.length >= MAXIMUM_MESSAGES_IN_CHAT}
        />
      </div>
    </>
  );
};

export default TalkInterface;
