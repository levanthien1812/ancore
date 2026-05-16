import { UserLevel } from "@prisma/client";

export const buildConversationOrSelfTalkGenerationPrompt = (
  topic: string,
  subTopic: string,
  type: "dialogue" | "self-talk",
  userLevel: UserLevel,
) => {
  return `
You are an English learning assistant.

Generate English practice content for a ${userLevel} learner.

Topic: ${topic}
Sub-topic: ${subTopic}
Practice type: ${type}

Requirements:
- Generate a descriptive and engaging title for this practice content.

- If practice type is "dialogue":
  - Generate a natural conversation between 2 people.
  - Use natural vocabulary for ${userLevel}, but introduce useful new words, idioms, or better ways of expressing ideas to help the learner progress.
  - Create 8-12 conversation turns.
  - "conversation" must contain the dialogue.
  - "selfTalk" must be null.

- If practice type is "self-talk":
  - Generate a short self-talk or monologue about the topic.
  - Use natural vocabulary for ${userLevel}, but incorporate more descriptive words and varied sentence structures to demonstrate better ways of expressing thoughts.
  - Create 8-12 sentences.
  - "selfTalk" must contain an array of sentences.
  - "conversation" must be null.

- Extract 5-10 useful vocabulary words or phrases from the generated content.
- Provide short meanings for each word in simple English.

Return ONLY valid JSON with this exact structure:

{
  "title": "A descriptive title",
  "conversation": [
    {
      "nameA": "Hello"
    },
    {
      "nameB": "Hi"
    }
  ] | null,
  "selfTalk": ["Sentence 1", "Sentence 2"] | null,
  "words": [
    {
      "word": "example",
      "meaning": "simple explanation"
    }
  ]
}

Rules:
- Do not include markdown.
- Do not include explanations.
- Do not include extra text outside JSON.
- Either "conversation" or "selfTalk" must be null.
`;
};
