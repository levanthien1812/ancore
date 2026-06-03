import openai from "@/lib/openai";
export interface WordDefinitionOutput {
  word: string;
  meanings: Array<{
    pronunciation?: string;
    cefrLevel?: string | null;
    definition: string;
    partOfSpeech?: string;
    examples?: string[];
    guideWord?: string;
    synonyms?: string;
    antonyms?: string;
  }>;
  usageNotes?: string;
}

export const fillWordWithAi = async (
  prompt: string,
): Promise<WordDefinitionOutput | null> => {
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
    throw error;
  }
};
