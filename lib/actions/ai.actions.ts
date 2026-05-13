"use server";
import openai from "../openai";
import { auth } from "@/auth";
import { prisma } from "@/db/prisma";
import { buildGetAiResponsePrompt } from "../ai-prompts/get-ai-response";
import { MAXIMUM_TOKENS_IN_AI_RESPONSE } from "../constants/constant";

export async function transcribeAudio(formData: FormData) {
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
}

export async function saveTalkSession(
  messages: {
    role: string;
    content: string;
    refinement?: string | null;
    explanation?: string | null;
    evaluation?: string | null;
    speakingSuggestions?: string[];
  }[],
  sessionId?: string,
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return {
        success: false,
        message: "You must be logged in to save conversations.",
      };
    }

    if (sessionId) {
      await prisma.talkSession.update({
        where: { id: sessionId, userId: session.user.id },
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
          userId: session.user.id,
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
  } catch (error) {
    console.error("Error saving conversation:", error);
    return {
      success: false,
      message: "Failed to save conversation.",
    };
  }
}

export async function getChatResponse(
  messages: { role: "user" | "assistant"; content: string }[],
) {
  try {
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
  } catch (error) {
    console.error("Error getting AI response:", error);
    return {
      success: false,
      message: "Failed to get AI response.",
    };
  }
}

export async function getTalkSessions() {
  try {
    const session = await auth();
    if (!session?.user?.id) return [];

    return await prisma.talkSession.findMany({
      where: { userId: session.user.id },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Error fetching talk sessions:", error);
    return [];
  }
}
