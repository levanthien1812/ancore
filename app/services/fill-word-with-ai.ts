import openai from "@/lib/openai";

export const fillWordWithAi = async (prompt: string) => {
  try {
    if (!prompt) return null;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1000,
    });

    const result = completion.choices[0].message.content;
    return result;
  } catch (error) {
    throw error;
  }
};
