import type { User } from "@/lib/generated/prisma/client";

export function buildWordAutofillPrompt(word: string, user: User): string {
  return `
    You are an English learning assistant.
    The user is a ${
      user.level
    } learner interested in topics: ${user.topics.join(", ")}.
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
        "exampleSentences": [],
        "synonyms": [],
        "antonyms": [],
        "usageNotes": []
        }
    ]
    }

    Rules:
    - "cefrLevel" must be one of: A1, A2, B1, B2, C1, C2
    - Keep definitions and examples suitable for the user’s level.
    - No explanations outside JSON.
`;
}
