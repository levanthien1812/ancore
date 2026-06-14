"use server";
import openai from "../openai";
import { prisma } from "@/db/prisma";
import { buildGetAiResponsePrompt } from "../ai-prompts/get-ai-response";
import { MAXIMUM_TOKENS_IN_AI_RESPONSE } from "../constants/constant";
import { authenticationAction } from "./_helpers";

export const transcribeAudio = async (formData: FormData) => {
  const file = formData.get("file") as File;

  if (!file) {
    return { success: false, message: "No audio file provided." };
  }

  try {
    const transcription = await openai.audio.transcriptions.create({
      file: file,
      model: "whisper-1",
      language: "en",
    });

    return { success: true, text: transcription.text };
  } catch (error) {
    console.error("Transcription error:", error);
    return {
      success: false,
      message: "Failed to transcribe audio.",
    };
  }
};

export const saveTalkSession = async (
  messages: {
    role: string;
    content: string;
    refinement?: string | null;
    explanation?: string | null;
    evaluation?: string | null;
    speakingSuggestions?: string[];
  }[],
  sessionId?: string,
) =>
  authenticationAction(async (userId) => {
    if (sessionId) {
      await prisma.talkSession.update({
        where: { id: sessionId, userId },
        data: {
          messages: {
            deleteMany: {}, // Replace existing messages with the updated conversation state
            create: messages.map((m) => ({
              role: m.role,
              content: m.content,
              refinement: m.refinement,
              explanation: m.explanation,
              evaluation: m.evaluation,
              speakingSuggestions: m.speakingSuggestions,
            })),
          },
        },
      });
    } else {
      await prisma.talkSession.create({
        data: {
          userId,
          title: `Talk Session - ${new Date().toLocaleString()}`,
          messages: {
            create: messages.map((m) => ({
              role: m.role,
              content: m.content,
              refinement: m.refinement,
              explanation: m.explanation,
              evaluation: m.evaluation,
              speakingSuggestions: m.speakingSuggestions,
            })),
          },
        },
      });
    }

    return { success: true };
  });

export const getChatResponse = async (
  messages: { role: "user" | "assistant"; content: string }[],
) => {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: buildGetAiResponsePrompt(),
      },
      ...messages,
    ],
    response_format: { type: "json_object" },
    max_tokens: MAXIMUM_TOKENS_IN_AI_RESPONSE,
  });

  const content = response.choices[0].message.content;
  if (!content) throw new Error("No response from AI");

  return { success: true, data: JSON.parse(content) };
};

export const getTalkSessions = async () =>
  authenticationAction(async (userId) => {
    return await prisma.talkSession.findMany({
      where: { userId },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }, []);
