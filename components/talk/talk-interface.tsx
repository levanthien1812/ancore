"use client";
import React, { useState, useTransition, useEffect, useCallback } from "react";
import TalkInput from "@/components/talk/talk-input"; // Import the new component
import TalkConversation from "@/components/talk/talk-conversation";
import { getChatResponse, saveTalkSession } from "@/lib/actions/ai.actions";
import { useQueryClient } from "@tanstack/react-query";
import { Message } from "@/lib/type"; // Import Message type from shared file
import {
  AI_GREETINGS,
  AI_NUDGES,
  MAXIMUM_MESSAGES_IN_CHAT,
  SHOW_NUDGE_IN,
} from "@/lib/constants/constant";
import { toast } from "sonner";
import { INITIAL_MESSAGE } from "@/lib/constants/initial-values";

const TalkInterface = ({
  initialMessages,
  sessionId,
  onNewSession,
}: {
  initialMessages?: Message[];
  sessionId?: string;
  onNewSession?: () => void;
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
  const [activeNudge, setActiveNudge] = useState<string | null>(null);
  const queryClient = useQueryClient(); // Keep queryClient here as it's used for saving

  // Function to speak text using Web Speech API
  const speakText = useCallback((text: string) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      // Cancel any ongoing speech to prevent overlapping
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US"; // Set language
      utterance.pitch = 1; // Default pitch
      utterance.rate = 1; // Default rate
      window.speechSynthesis.speak(utterance);
    }
  }, []);

  useEffect(() => {
    if (messages.length > 0) return;

    // Using a timeout breaks the synchronous setState call within the effect,
    // resolving the "cascading renders" error while still preventing hydration mismatch.
    const timer = setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * AI_GREETINGS.length);
      const greeting = AI_GREETINGS[randomIndex];
      setMessages([
        { ...INITIAL_MESSAGE, role: "assistant", content: greeting },
      ]);

      // Speak the greeting
      speakText(greeting);
    }, 0);

    return () => clearTimeout(timer);
  }, [messages.length]);

  // Proactive Nudge Logic: Encourage the user if they take too long to think
  useEffect(() => {
    // Only nudge if the last message was from the assistant (it's the user's turn)
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || lastMessage.role !== "assistant" || isPending) return;

    // Cancel any ongoing speech before starting the nudge timer
    speakText(""); // Cancel any ongoing speech (e.g., previous AI response)

    const nudgeTimer = setTimeout(() => {
      const randomNudge =
        AI_NUDGES[Math.floor(Math.random() * AI_NUDGES.length)];

      setActiveNudge(randomNudge);
      // Optionally, you could speak the nudge too:
      // speakText(randomNudge);
    }, SHOW_NUDGE_IN);

    return () => {
      clearTimeout(nudgeTimer);
      speakText(""); // Cancel nudge speech if user interacts
    };
  }, [messages, isPending, speakText]);

  const triggerAiResponse = useCallback(
    (updatedMessages: Message[]) => {
      startTransition(async () => {
        // Prepare history for API (clean version without refinements)
        const apiHistory = updatedMessages.map(({ role, content }) => ({
          role: role as "user" | "assistant",
          content,
        }));

        const result = await getChatResponse(apiHistory);

        if (result && result.success && result.data) {
          const aiMessage: Message = {
            ...INITIAL_MESSAGE,
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
              if (result.data.refinement === "null") {
                result.data.refinement = null;
              }
              if (result.data.explanation === "null") {
                result.data.explanation = null;
              }
              updated[lastUserIndex].refinement = result.data.refinement;
              updated[lastUserIndex].explanation = result.data.explanation;
              updated[lastUserIndex].evaluation = result.data.evaluation;
              updated[lastUserIndex].speakingSuggestions =
                result.data.speakingSuggestions;
            }
            return [...updated, aiMessage]; // Ensure aiMessage is added before speaking
          });

          // Speak the AI message after it's rendered
          speakText(aiMessage.content);
        } else {
          toast.error("Failed to get AI response.");
        }
      });
    },
    [speakText],
  );

  const handleSendMessage = useCallback(
    (text: string) => {
      speakText(""); // Cancel any ongoing speech when user sends a message
      setActiveNudge(null);
      const userMsg: Message = {
        ...INITIAL_MESSAGE,
        role: "user",
        content: text,
      };
      const updatedMessages = [...messages, userMsg];

      // Ensure the message count does not exceed the limit after adding user message
      while (updatedMessages.length > MAXIMUM_MESSAGES_IN_CHAT) {
        updatedMessages.shift(); // Remove the oldest message
      }

      setMessages(updatedMessages);

      triggerAiResponse(updatedMessages);
    },
    [messages, triggerAiResponse, speakText],
  );

  const handleRegenerate = useCallback(() => {
    if (messages.length === 0) return;
    const lastMessage = messages[messages.length - 1];
    if (lastMessage.role !== "user") return;

    triggerAiResponse(messages);
  }, [messages, triggerAiResponse]);

  const handleSave = useCallback(() => {
    startSaveTransition(async () => {
      const result = await saveTalkSession(messages, sessionId);
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ["talkSessions"] });
        toast.success("Conversation saved to your history!");
      } else {
        toast.error("Failed to save conversation.");
      }
    });
  }, [messages, queryClient, sessionId]);

  const handleNewSession = useCallback(() => {
    speakText("");
    setActiveNudge(null);
    onNewSession?.();
  }, [onNewSession, speakText]);

  return (
    <>
      <div className="flex-1 min-h-0 border rounded-md overflow-hidden bg-white">
        <TalkConversation
          messages={messages}
          isAiThinking={isPending}
          onSave={handleSave}
          isSaving={isSaving}
          activeNudge={activeNudge}
          onNewSession={handleNewSession}
          onPlayAudio={speakText}
          onRegenerate={handleRegenerate}
        />
      </div>
      <TalkInput
        onSendMessage={handleSendMessage}
        isProcessing={isPending}
        isLimitReached={messages.length >= MAXIMUM_MESSAGES_IN_CHAT}
      />
    </>
  );
};

export default TalkInterface;
