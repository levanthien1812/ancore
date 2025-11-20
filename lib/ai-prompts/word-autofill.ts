import type { User } from "@/lib/generated/prisma/client";

export function buildWordAutofillPrompt(word: string, user: User): string {
  let userInfo;
  if (user.topics && user.topics.length > 0) {
    userInfo = `The user is a ${user.level} learner interested in topics: ${user.topics}.`;
  } else {
    userInfo = `The user is a ${user.level} learner.`;
  }

  return `
    You are an English learning assistant.
    ${userInfo}
    Given the word "${word}", return complete learning information in JSON format.

    Respond ONLY with valid JSON that matches this structure:
    {
    "word": "",
    "pronunciation": "",
    "cefrLevel": "",
    "meanings": [
        {
        "definition": "",
        "partOfSpeech": "",
        "exampleSentences": "<example_1 \n example_2 \n example_3>",
        "synonyms": "<synonym_1, synonym_2, synonym_3>",
        "antonyms": "<antonym_1, antonym_2, antonym_3>",
        "usageNotes": ""
        }
    ]
    }

    Rules:
    - "cefrLevel" must be one of: A1, A2, B1, B2, C1, C2
    - Keep definitions and examples suitable for the user’s level.
    - No explanations outside JSON.
`;
}
