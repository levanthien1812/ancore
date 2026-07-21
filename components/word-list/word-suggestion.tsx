"use client";
import {
  ACADEMIC_VOCABULARY,
  BUSINESS_ENGLISH,
  DAILY_CONVERSATION,
  ESSENTIAL_COLLECTION,
  MOST_FREQUENT_VERBS,
  TECH_ENGLISH,
  TOEIC_600_PLUS,
  TRAVEL_ENGLISH,
  WordCollection,
} from "@/lib/collections/word-collections";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import React, { useEffect } from "react";
import AddOrEditWord from "../add-word/add-word";
import { handlePlayAudio } from "@/lib/utils/handlePlayAudio";

type CollectionItemProps = {
  name: string;
  icon: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  collection: WordCollection;
};

const collections: CollectionItemProps[] = [
  {
    name: "Essential Collection",
    icon: "⭐",
    bgColor: "bg-amber-50 hover:bg-amber-100",
    borderColor: "border-amber-300",
    textColor: "text-amber-600",
    collection: ESSENTIAL_COLLECTION,
  },
  {
    name: "Most Frequent Verbs",
    icon: "🔠",
    bgColor: "bg-sky-50 hover:bg-sky-100",
    borderColor: "border-sky-300",
    textColor: "text-sky-600",
    collection: MOST_FREQUENT_VERBS,
  },
  {
    name: "Daily Conversation",
    icon: "💬",
    bgColor: "bg-emerald-50 hover:bg-emerald-100",
    borderColor: "border-emerald-300",
    textColor: "text-emerald-600",
    collection: DAILY_CONVERSATION,
  },
  {
    name: "Business English",
    icon: "🏢",
    bgColor: "bg-indigo-50 hover:bg-indigo-100",
    borderColor: "border-indigo-300",
    textColor: "text-indigo-600",
    collection: BUSINESS_ENGLISH,
  },
  {
    name: "Travel English",
    icon: "✈️",
    bgColor: "bg-cyan-50 hover:bg-cyan-100",
    borderColor: "border-cyan-300",
    textColor: "text-cyan-600",
    collection: TRAVEL_ENGLISH,
  },
  {
    name: "Tech English",
    icon: "💻",
    bgColor: "bg-violet-50 hover:bg-violet-100",
    borderColor: "border-violet-300",
    textColor: "text-violet-600",
    collection: TECH_ENGLISH,
  },
  {
    name: "Academic Vocabulary",
    icon: "📖",
    bgColor: "bg-rose-50 hover:bg-rose-100",
    borderColor: "border-rose-300",
    textColor: "text-rose-600",
    collection: ACADEMIC_VOCABULARY,
  },
  {
    name: "TOEIC 600+",
    icon: "🎓",
    bgColor: "bg-teal-50 hover:bg-teal-100",
    borderColor: "border-teal-300",
    textColor: "text-teal-600",
    collection: TOEIC_600_PLUS,
  },
];

const CollectionItem = ({
  collection,
  onClick,
  selectedCollection,
}: {
  collection: CollectionItemProps;
  onClick: (collection: CollectionItemProps) => void;
  selectedCollection: CollectionItemProps | null;
}) => {
  const session = useSession();
  const user = session.data?.user;
  if (!user) return;

  return (
    <motion.button
      className={`flex items-center gap-x-4 border cursor-pointer rounded-lg p-4 ${!selectedCollection || selectedCollection?.name === collection.name ? `${collection.bgColor} ${collection.borderColor}` : "bg-gray-50 border-gray-300"}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onClick(collection)}
    >
      <div
        className={`w-8 h-8 rounded-sm flex items-center justify-center ${collection.textColor}`}
      >
        <span className="text-[28px]">{collection.icon}</span>
      </div>
      <div className="flex flex-col">
        <p
          className={`font-semibold text-sm ${
            !selectedCollection || selectedCollection?.name === collection.name
              ? collection.textColor
              : "text-gray-600"
          }`}
        >
          {collection.name}
        </p>
        <p className="text-xs text-muted-foreground text-start">
          {collection.collection[user.level].length} words
        </p>
      </div>
    </motion.button>
  );
};

const WordSuggestion = ({ existingWords }: { existingWords?: string[] }) => {
  const [selectedCollection, setSelectedCollection] =
    React.useState<CollectionItemProps | null>(null);
  const [selectedWord, setSelectedWord] = React.useState<string | null>(null);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  const session = useSession();
  const user = session.data?.user;

  useEffect(() => {
    audioRef.current = new Audio("/sounds/button-press.mp3");
    audioRef.current.preload = "auto";
  }, []);

  if (!user) return;

  const handleClickCollection = (collection: CollectionItemProps) => {
    setSelectedCollection(collection);
    if (!audioRef.current) return;

    handlePlayAudio(audioRef.current);
  };

  const handleClickWord = (word: string) => {
    setSelectedWord(word);
  };

  return (
    <div className="mt-6">
      <p className="text-xl font-semibold">Explore word collections</p>
      <p className="text-sm text-muted-foreground text-center">
        Level: {user.level}
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-2 mt-4">
        {collections.map((collection) => (
          <CollectionItem
            collection={collection}
            key={collection.name}
            onClick={() => handleClickCollection(collection)}
            selectedCollection={selectedCollection}
          />
        ))}
      </div>
      {selectedCollection && (
        <div className="mt-6">
          <p className="text-xl font-semibold">{selectedCollection.name}</p>
          <p className="text-sm text-muted-foreground text-center">
            Select words you want to learn
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-2 mt-4">
            {selectedCollection.collection[user?.level]
              .filter((word) =>
                existingWords ? !existingWords.includes(word) : true,
              )
              .map((word, idx) => (
                <motion.button
                  key={idx}
                  className={`relative overflow-hidden bg-gray-50 hover:bg-primary hover:text-white border border-b-3 border-r-2 text-sm px-2 py-2 rounded-md cursor-pointer transition`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleClickWord(word)}
                >
                  {word}
                </motion.button>
              ))}
          </div>
        </div>
      )}
      {selectedWord && (
        <AddOrEditWord
          initialWord={selectedWord}
          open={true}
          onOpenChange={(open) => !open && setSelectedWord(null)}
        />
      )}
    </div>
  );
};

export default WordSuggestion;
