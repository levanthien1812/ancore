import { User } from "@/lib/generated/prisma/client";

export function buildWordOfTheDayPrompt(user: User): string {
  let userInfo;
  if (user.topics && user.topics.length > 0) {
    userInfo = `a ${user.level} learner interested in topics: ${user.topics}.`;
  } else {
    userInfo = `a ${user.level} learner.`;
  }

  return `
    Suggest one English "Word of the Day" suitable for a ${userInfo}.
    The word should be educational, not slang or a proper noun.

    Respond ONLY in valid JSON matching this structure:
    {
    "word": "",
    "pronunciation": "",
    "cefrLevel": "",
    "meanings": [
        {
        "definition": "",
        "partOfSpeech": "",
        "exampleSentences": "<example_1 \n example_2 \n example_3>",
        }
    ]
    }

    Rules:
    - The CEFR level must be one of A1, A2, B1, B2, C1, C2.
    - Example sentence should be simple and accurate.
    - Do not include any explanation outside the JSON.
`;
}
