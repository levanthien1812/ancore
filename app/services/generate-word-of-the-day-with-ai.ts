import openai from "@/lib/openai";
import { WordOfTheDay } from "@/components/home/word-of-the-day";

export const generateWordOfTheDayWithAI = async (
  prompt: string,
): Promise<WordOfTheDay | null> => {
  try {
    if (!prompt) return null;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-2024-08-06",
      messages: [{ role: "user", content: prompt }],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "WordOfTheDay",
          schema: {
            type: "object",
            properties: {
              word: { type: "string" },
              pronunciation: { type: "string" },
              cefrLevel: { type: "string" },
              meanings: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    definition: { type: "string" },
                    partOfSpeech: { type: "string" },
                    exampleSentences: { type: "string" },
                  },
                  required: ["definition", "partOfSpeech", "exampleSentences"],
                },
              },
            },
            required: ["word", "pronunciation", "cefrLevel", "meanings"],
            additionalProperties: false,
          },
        },
      },
    });

    const result = completion.choices[0].message.content;
    console.log("AI Word of the Day Result:", result);
    return result ? JSON.parse(result) : null;
  } catch (error) {
    console.error("Failed to generate Word of the Day with AI:", error);
    return null;
  }
};
