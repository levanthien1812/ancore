import { User } from "@/lib/generated/prisma/client";

export function buildQuizGenerationPrompt(
  word: string,
  meaning: string,
  user: User
): string {
  return `
    You are a quiz generator for an English learning website.
    The user is a ${user.level} learner interested in topics: ${user.topics}.

    Generate 2–3 short quiz questions about the word "${word}" meaning "${meaning}".
    Questions should be suitable for the user's level and reflect their topics of interest.

    Allowed question types: "MultipleChoice", "Matching", "FillInBlank".

    Respond ONLY with valid JSON in this structure:
    {
    "word": "",
    "questions": [
        {
        "question": "",
        "type": "",
        "options": [],
        "leftItems": [],
        "rightItems": [],
        "answer": ""
        }
    ]
    }

    Rules:
    - Omit empty fields depending on question type.
    - Keep questions concise and natural.
    - Provide only JSON, no extra text.
`;
}
