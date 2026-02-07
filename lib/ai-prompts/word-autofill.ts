import type { User } from "@prisma/client";

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
    Given the word or phrase "${word}", return complete learning information in JSON format.
    (If the word or phrase is invalid or does not exist, return null instead)

    Respond ONLY with valid JSON that matches this structure:
    {
    "word": "",
    "meanings": [
        {
        "pronunciation": "",
        "cefrLevel": null,
        "definition": "",
        "partOfSpeech": "",
        "exampleSentences": "<example_1|example_2|example_3>",
        "synonyms": "<synonym_1, synonym_2, synonym_3>",
        "antonyms": "<antonym_1, antonym_2, antonym_3>",
        "whenToUse": "",
        }
    ]
    }

    Rules:
    - If the input is a phrase (multiple words):
        - "pronunciation" and "partOfSpeech" should be empty strings. "cefrLevel" should be null.
    - If the input is a single word:
        - "pronunciation" should be in International Phonetic Alphabet (IPA) format, enclosed in slashes (e.g., /prəˌnʌnsiˈeɪʃn/).
        - "cefrLevel" must be one of: A1, A2, B1, B2, C1, C2 (or null).
    - "exampleSentences" should be a single string with multiple examples separated by a pipe character (|).
    - Keep definitions and examples suitable for the user’s level.
    - No explanations outside JSON.
`;
}
