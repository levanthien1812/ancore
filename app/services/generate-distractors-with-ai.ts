import openai from "@/lib/openai";

export interface DistractorOutput {
  distractors: string[];
}

export const generateDistractorsWithAi = async (
  prompt: string,
): Promise<DistractorOutput | null> => {
  try {
    if (!prompt) return null;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-2024-08-06",
      messages: [{ role: "user", content: prompt }],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "DistractorGeneration",
          schema: {
            type: "object",
            properties: {
              distractors: {
                type: "array",
                items: { type: "string" },
                minItems: 3,
                maxItems: 3,
                description: "An array of exactly three distractor words.",
              },
            },
            required: ["distractors"],
            additionalProperties: false,
          },
        },
      },
    });

    const result = completion.choices[0].message.content;
    console.log("AI Distractors Result:", result);
    return result ? JSON.parse(result) : null;
  } catch (error) {
    console.error("Failed to generate distractors with AI:", error);
    throw error;
  }
};
