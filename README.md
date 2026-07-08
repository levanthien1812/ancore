# 🚀 Ancore

> **An intelligent English learning companion powered by AI.**

Ancore helps learners build, retain, and actively use English vocabulary through AI-assisted learning, adaptive reviews, and interactive quizzes. Rather than being a simple vocabulary notebook, Ancore creates a personalized learning experience that continuously adapts to each learner's progress.

---

## ✨ Features

### 📚 Smart Vocabulary Management

- Add words manually or paste directly from **Cambridge Dictionary**.
- AI automatically extracts and generates:
  - Definitions
  - Pronunciations
  - Example sentences
  - Synonyms & antonyms
  - CEFR level
  - Usage notes

- Organize vocabulary with tags, notes, highlights, and mastery levels.

### 🧠 Intelligent Review System

- Personalized review sessions powered by spaced repetition.
- AI generates contextual review hints to reinforce memory.
- Interactive review cards with progress tracking.
- Adaptive scheduling based on mastery level and previous review performance.

### 🎯 Adaptive Quiz Engine

- Multiple question types, including:
  - Definition → Word
  - Fill in the Blank
  - Word → Synonym
  - Matching

- AI generates quiz questions from your own vocabulary.
- Retry mode for incorrectly answered questions.
- Detailed quiz statistics and learning progress.

### 💬 AI English Tutor

Practice English naturally with an AI assistant.

- Writing refinement
- Conversation practice
- Grammar explanations
- Speaking suggestions
- Context-aware feedback

### 📈 Personalized Learning

- Vocabulary mastery tracking
- Review history
- Study session analytics
- Daily learning goals
- Progress statistics

---

## 🖼️ Preview

| Dashboard                                        | Review                                        | Quiz                                        | AI Chat                                        |
| ------------------------------------------------ | --------------------------------------------- | ------------------------------------------- | ---------------------------------------------- |
| ![alt text](/public/images/ancore-dashboard.png) | ![alt text](/public/images/ancore-review.png) | ![alt text](/public/images/ancore-quiz.png) | ![alt text](/public/images/ancore-ai-chat.png) |

---

## 🛠️ Tech Stack

### Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- Framer Motion
- TanStack Query

### Backend

- Next.js API Routes
- Prisma ORM
- PostgreSQL
- NextAuth

### AI

- OpenAI API

---

## 📂 Project Structure

```text
.
├── app/
│   ├── (auth)/            # Authentication routes
│   ├── (root)/            # Main application pages
│   ├── api/               # API routes
│   ├── services/          # Server-side services
│   └── providers.tsx
│
├── components/
│   ├── add-word/          # Add word workflow
│   ├── review/            # Review sessions
│   ├── quizzes/           # Quiz system
│   ├── talk/              # AI conversation
│   ├── notes/             # Vocabulary notes
│   ├── word-card/         # Review & quiz cards
│   ├── word-list/         # Vocabulary management
│   ├── home/              # Landing/dashboard
│   ├── layout/            # Layout components
│   ├── shared/            # Shared business components
│   └── ui/                # Reusable UI components
│
├── lib/
│   ├── actions/           # Server Actions
│   ├── ai-prompts/        # AI prompt templates
│   ├── constants/
│   ├── hooks/
│   ├── validators/
│   ├── pusher/
│   ├── generated/
│   └── utils/
│
├── prisma/
│   ├── schema.prisma
│   └── migrations/
│
├── public/
│   ├── images/
│   ├── lottie/
│   ├── sounds/
│   └── videos/
│
├── db/                    # Database utilities
└── ...
```

---

## 🚀 Getting Started

Clone the repository

```bash
git clone https://github.com/your-username/ancore.git
```

Install dependencies

```bash
npm install
```

Configure environment variables

```bash
cp .env.example .env
```

Start the development server

```bash
npm start
```

---

## 🎯 Vision

Learning vocabulary should be more than memorizing word lists.

Ancore aims to become a personal AI learning companion that helps users **discover**, **remember**, and **use** new vocabulary confidently through intelligent assistance and adaptive learning.

---

## 📄 License

MIT
