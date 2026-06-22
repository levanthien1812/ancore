-- AlterTable
ALTER TABLE "UserSettings" ADD COLUMN     "quizWordLevels" "MasteryLevel"[] DEFAULT ARRAY['Learning', 'Familiar', 'Mastered']::"MasteryLevel"[];
