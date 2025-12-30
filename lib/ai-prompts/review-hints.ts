import type { User } from "@prisma/client";

export function buildReviewHintsPrompt(word: string, user: User): string {
  const userInfo = `The user is a ${user.level} learner.`;

  return `
    You are an English learning assistant helping a user review a word.
    ${userInfo}

    The target word is "${word}".
    Your task is to generate a set of hints to help the user guess this word.

    Respond ONLY with a valid JSON object that strictly matches this structure:
    {
      "tags": "",
      "synonyms": "",
      "whenToUse": "",
      "exampleSentence": ""
    }

    Rules for each field:
    - "tags": Provide comma-separated topics or related words.
    - "synonyms": Provide a comma-separated string of synonyms.
    - "whenToUse": Provide a short, concise description of when to use the word.
    - "exampleSentence": Provide an example sentence using the word, but replace the word itself with '_____' (five underscores).
    - Keep the language and complexity of the hints appropriate for the user's learning level.
    - Do not include any explanations or text outside of the JSON object.
    - If you cannot generate a hint for a field, return an empty string for that field.
`;
}
