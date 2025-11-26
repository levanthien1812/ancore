import { z } from "zod";

export const distractorSchema = z.object({
  distractors: z
    .array(z.string())
    .length(3)
    .describe("An array of three distractor words."),
});

export function buildDistractorGenerationPrompt(
  correctAnswer: string,
  distractorPool: string[],
  contextWord?: string // New optional parameter
): string {
  let promptText = `
    You are an expert in English vocabulary and testing.
    Your task is to select three distractor words for a multiple-choice question.
    The correct answer is "${correctAnswer}".`;

  if (contextWord) {
    // Specific prompt for synonym/antonym questions
    promptText += `
    The original word in question is "${contextWord}".
    Choose the three most relevant distractor words from the following list that are either other synonyms/antonyms of "${contextWord}", or words closely related in meaning to "${contextWord}" or "${correctAnswer}", that could plausibly be mistaken for the correct answer.`;
  } else {
    // General prompt for definition-to-word or other types
    promptText += `
    Choose the three most relevant distractor words from the following list that could plausibly be mistaken for the correct answer.`;
  }

  promptText += ` If no words from the list are relevant, you can generate appropriate distractors.
    List of potential distractors: [${distractorPool.join(", ")}]
    Respond ONLY with a valid JSON object.`;

  return promptText;
}
