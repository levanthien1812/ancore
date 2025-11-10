import { User } from "@/lib/generated/prisma/client";

export function buildWordOfTheDayPrompt(user: User): string {
  return `
    Suggest one English "Word of the Day" suitable for a ${
      user.level
    } learner interested in ${user.topics.join(", ")}.
    The word should be educational, not slang or a proper noun.

    Respond ONLY in valid JSON matching this structure:
    {
    "word": "",
    "pronunciation": "",
    "cefrLevel": "",
    "topic": "",
    "meanings": [
        {
        "definition": "",
        "partOfSpeech": "",
        "exampleSentences": []
        }
    ]
    }

    Rules:
    - The CEFR level must be one of A1, A2, B1, B2, C1, C2.
    - Example sentence should be simple and accurate.
    - Do not include any explanation outside the JSON.
`;
}
