"use server";
import openai from "../openai";
import { prisma } from "@/db/prisma";
import { buildGetAiResponsePrompt } from "../ai-prompts/get-ai-response";
import {
  DEFAULT_DAILY_AI_REQUEST,
  DEFAULT_MONTHLY_AI_REQUEST,
  MAXIMUM_TOKENS_IN_AI_RESPONSE,
} from "../constants/constant";
import { authenticationAction } from "./_helpers";

export const transcribeAudio = async (formData: FormData) => {
  const file = formData.get("file") as File;

  if (!file) {
    return { success: false, message: "No audio file provided.", text: null };
  }

  const result = await checkAIRequestLimit();
  if (!result.success) {
    return { success: false, message: result.message, text: null };
  }

  try {
    const transcription = await openai.audio.transcriptions.create({
      file: file,
      model: "whisper-1",
      language: "en",
    });

    await updateAIUsage(1);

    return { success: true, text: transcription.text };
  } catch (error) {
    console.error("Transcription error:", error);
    return {
      success: false,
      message: "Failed to transcribe audio.",
      text: null,
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
) =>
  authenticationAction(async (userId) => {
    const result = await checkAIRequestLimit();
    if (!result.success) {
      return { success: false, message: result.message, data: null };
    }

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

    await updateAIUsage(1);

    const content = response.choices[0].message.content;
    if (!content) throw new Error("No response from AI");

    return { success: true, data: JSON.parse(content) };
  }, null);

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

export const updateAIUsage = async (amount: number) =>
  authenticationAction(async (userId) => {
    const aiQuota = await prisma.aiQuota.findFirst({
      where: { userId },
    });
    if (!aiQuota) {
      await prisma.aiQuota.create({
        data: {
          userId,
          dailyUsed: amount,
          monthlyUsed: amount,
          dailyLimit: DEFAULT_DAILY_AI_REQUEST,
          monthlyLimit: DEFAULT_MONTHLY_AI_REQUEST,
          dailyResetAt: new Date(),
          monthlyResetAt: new Date(),
        },
      });
    } else {
      const resetDate = new Date();
      resetDate.setDate(resetDate.getDate() - 1);
      if (aiQuota.dailyResetAt < resetDate) {
        aiQuota.dailyUsed = 0;
        aiQuota.dailyResetAt = new Date();
      }
      if (aiQuota.monthlyResetAt < resetDate) {
        aiQuota.monthlyUsed = 0;
        aiQuota.monthlyResetAt = new Date();
      }

      await prisma.aiQuota.update({
        where: { userId },
        data: {
          dailyUsed: aiQuota.dailyUsed + amount,
          monthlyUsed: aiQuota.monthlyUsed + amount,
        },
      });
    }
    return { success: true };
  }, null);

export const checkAIRequestLimit = async () =>
  authenticationAction(
    async (userId) => {
      const aiQuota = await prisma.aiQuota.findUnique({
        where: { userId },
      });
      if (!aiQuota) {
        return { success: true };
      }
      if (
        aiQuota.dailyUsed >= aiQuota.dailyLimit ||
        aiQuota.monthlyUsed >= aiQuota.monthlyLimit
      ) {
        return {
          success: false,
          message: "Daily or monthly AI request limit reached.",
        };
      }
      return { success: true };
    },
    { success: false, message: "Daily or monthly AI request limit reached." },
  );
