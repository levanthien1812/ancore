import { MasteryLevel, QuestionType } from "@prisma/client";

export const PAGE_SIZES = [10, 20, 50, 100];

export const CORRECT_ENCOURAGEMENTS = [
  "Correct!",
  "Nice work!",
  "Well done!",
  "Great job!",
  "You got it!",
  "Exactly right!",
  "Spot on!",
  "That’s correct!",
];

export const INCORRECT_ENCOURAGEMENTS = [
  "Not quite.",
  "Almost there.",
  "Close one!",
  "Oops, not this time.",
  "That’s okay—keep going.",
];

export const AI_GREETINGS = [
  "I'm all ears. What’s on your mind today?",
  "Hello! Is there anything you’d like to dive into or chat about?",
  "I'm ready when you are. What should we talk about first?",
  "Hi there! I'm here to help with whatever you're working on or just to chat. What’s up?",
  "Hey! What's the latest? I'm down to talk about anything.",
  "Glad you're here. What are we thinking about today?",
  "Hi! I’ve got no agenda—just here to see what’s on your radar.",
  "Yo! Ready for a deep dive or a quick question? You call the shots.",
  "Hello! If you could talk about any topic right now, what would it be? I’m ready for it.",
  "Hey there. Whether it's a big project or a random thought, I'm here for the conversation.",
];

export const AI_NUDGES = [
  "No rush! I'm here whenever you're ready to practice.",
  "Don't worry about making mistakes, just give it a try!",
  "Stuck? You can try starting with 'I think...' or just say a single word.",
  "I'm still listening! What's on your mind regarding what I just said?",
];

export const MAXIMUM_WORDS_IN_AI_REPLY = 50;
export const MAXIMUM_TOKENS_IN_AI_RESPONSE = 500;
export const MAXIMUM_RECORDING_TIME = 30;
export const MAXIMUM_MESSAGES_IN_CHAT = 14;
export const SHOW_NUDGE_IN = 40000;
export const MAXIMUM_EXAMPLES = 10;
export const DEFAULT_WORDS_PER_REVIEW = 10;
export const DEFAULT_WORDS_PER_FETCH = 100;
export const DEFAULT_WORDS_PER_PAGE_TABLE = 10;
export const DEFAULT_WORDS_PER_PAGE_GRID = 20;

export const ENGLISH_TOPICS = [
  {
    id: 1,
    topic: "My daily routine",
    subTopics: [
      "Morning habits",
      "Work or study schedule",
      "Evening routine",
      "Weekend routine",
      "Time management",
    ],
  },
  {
    id: 2,
    topic: "My job and career goals",
    subTopics: [
      "Current job responsibilities",
      "Dream career",
      "Skills to improve",
      "Work challenges",
      "Future plans",
    ],
  },
  {
    id: 3,
    topic: "A memorable childhood memory",
    subTopics: [
      "Favorite childhood game",
      "School memories",
      "Family trips",
      "Funny accidents",
      "Life lessons from childhood",
    ],
  },
  {
    id: 4,
    topic: "My hometown or city",
    subTopics: [
      "Famous places",
      "Local food",
      "Transportation",
      "Weather",
      "Things to improve",
    ],
  },
  {
    id: 5,
    topic: "My hobbies and free time activities",
    subTopics: [
      "Indoor hobbies",
      "Outdoor activities",
      "Learning new skills",
      "Relaxation methods",
      "Weekend interests",
    ],
  },
  {
    id: 6,
    topic: "A person I admire",
    subTopics: [
      "Why I admire them",
      "Their achievements",
      "Lessons learned from them",
      "Their personality",
      "How they inspire me",
    ],
  },
  {
    id: 7,
    topic: "Travel experiences",
    subTopics: [
      "Best trip ever",
      "Worst travel experience",
      "Dream destination",
      "Travel tips",
      "Travel with friends or family",
    ],
  },
  {
    id: 8,
    topic: "Food and cooking",
    subTopics: [
      "Favorite dishes",
      "Cooking skills",
      "Street food",
      "Healthy eating",
      "Foods I dislike",
    ],
  },
  {
    id: 9,
    topic: "Technology in daily life",
    subTopics: [
      "Smartphone usage",
      "Social media habits",
      "Artificial intelligence",
      "Online learning",
      "Technology addiction",
    ],
  },
  {
    id: 10,
    topic: "Education and learning",
    subTopics: [
      "School memories",
      "Useful subjects",
      "Learning methods",
      "Online courses",
      "Challenges in studying",
    ],
  },
  {
    id: 11,
    topic: "Health and exercise",
    subTopics: [
      "Exercise habits",
      "Sleep schedule",
      "Healthy diet",
      "Stress management",
      "Bad habits to quit",
    ],
  },
  {
    id: 12,
    topic: "Movies, TV shows, and books",
    subTopics: [
      "Favorite genres",
      "Recent movies watched",
      "Book recommendations",
      "Characters I like",
      "Entertainment habits",
    ],
  },
  {
    id: 13,
    topic: "Friendship",
    subTopics: [
      "Qualities of a good friend",
      "Making friends",
      "Maintaining friendships",
      "Childhood friends",
      "Friendship conflicts",
    ],
  },
  {
    id: 14,
    topic: "Family relationships",
    subTopics: [
      "Family traditions",
      "Responsibilities at home",
      "Generation gap",
      "Family support",
      "Spending time together",
    ],
  },
  {
    id: 15,
    topic: "Money and spending habits",
    subTopics: [
      "Saving money",
      "Budgeting",
      "Impulse buying",
      "Financial goals",
      "Expensive purchases",
    ],
  },
  {
    id: 16,
    topic: "Social issues",
    subTopics: [
      "Pollution",
      "Traffic problems",
      "Education inequality",
      "Internet behavior",
      "Climate change",
    ],
  },
  {
    id: 17,
    topic: "Success and failure",
    subTopics: [
      "Personal achievements",
      "Biggest failure",
      "Lessons learned",
      "Definition of success",
      "Overcoming setbacks",
    ],
  },
  {
    id: 18,
    topic: "Cultural differences",
    subTopics: [
      "Food culture",
      "Festivals",
      "Communication styles",
      "Customs and traditions",
      "Travel observations",
    ],
  },
  {
    id: 19,
    topic: "My future plans",
    subTopics: [
      "Career goals",
      "Places to visit",
      "Skills to learn",
      "Lifestyle goals",
      "Personal development",
    ],
  },
  {
    id: 20,
    topic: "Problems in modern society",
    subTopics: [
      "Work stress",
      "Phone addiction",
      "Fake news",
      "Loneliness",
      "Rising living costs",
    ],
  },
];

export enum QuizEvaluationLevel {
  NeedsPractice = "Needs Practice",
  Fair = "Fair",
  Good = "Good",
  Awesome = "Awesome",
  Outstanding = "Outstanding",
}

export enum QuizEvaluationEncouragement {
  NeedsPractice = "Don't worry, keep practicing and you'll get there!",
  Fair = "Not bad! A little more effort and you'll improve.",
  Good = "Good job! You're on the right track.",
  Awesome = "Awesome work! Keep it up!",
  Outstanding = "Outstanding performance! You're doing amazing!",
}

export const REQUIRED_QUESTION_TYPES: QuestionType[] = [
  QuestionType.DefinitionToWord_Typing,
];
export const REQUIRED_REVIEW_MASTERY_LEVELS: MasteryLevel[] = [
  MasteryLevel.New,
  MasteryLevel.Learning,
];
