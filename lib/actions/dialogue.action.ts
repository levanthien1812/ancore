import { buildConversationOrSelfTalkGenerationPrompt } from "../ai-prompts/conversation-generation";
import { generateConversationOrSelfTalk } from "@/app/services/generate-conversation-self-talk-with-ai";
import { authenticationAction } from "./_helpers";
import { prisma } from "@/db/prisma";

export const generateConversation = async (
  topic: string,
  subTopic: string,
  type: "dialogue" | "self-talk",
) =>
  authenticationAction(async (userId) => {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return null;

    const prompt = buildConversationOrSelfTalkGenerationPrompt(
      topic,
      subTopic,
      type,
      user.level,
    );

    const data = await generateConversationOrSelfTalk(prompt);

    return data;
  });

export const savePracticeContent = async (params: {
  title: string;
  type: "dialogue" | "self-talk";
  topic: string;
  subTopic: string;
  content: any;
  words: any;
}) =>
  authenticationAction(async (userId) => {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return { success: false, message: "User not found" };

    await prisma.practiceContent.create({
      data: {
        userId,
        title: params.title,
        type: params.type === "dialogue" ? "Dialogue" : "SelfTalk",
        topic: params.topic,
        subTopic: params.subTopic,
        level: user.level,
        content: params.content,
        words: params.words,
      },
    });

    return { success: true, message: "Saved to history" };
  });
