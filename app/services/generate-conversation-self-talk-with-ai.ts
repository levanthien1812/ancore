import openai from "@/lib/openai";

export interface ConversationOrSelfTalkOutput {
  title: string;
  conversation: Array<Record<string, string>> | null;
  selfTalk: string[] | null;
  words: Array<{
    word: string;
    meaning: string;
  }>;
}

export const generateConversationOrSelfTalk = async (
  prompt: string,
): Promise<ConversationOrSelfTalkOutput | null> => {
  try {
    if (!prompt) return null;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-2024-08-06",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    const result = completion.choices[0].message.content;
    return result ? JSON.parse(result) : null;
  } catch (error) {
    console.error(
      "Failed to generate conversation or self-talk with AI:",
      error,
    );
    return null;
  }
};
