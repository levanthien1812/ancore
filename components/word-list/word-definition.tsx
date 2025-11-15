import { shorten } from "@/lib/utils/shorten";

const WordDefinition = ({ meanings }: { meanings: string[] }) => {
  return (
    <ul className="list-disc ms-4">
      {meanings.map((meaning, index) => (
        <li key={index} className="text-primary-2">
          {shorten(meaning)}
        </li>
      ))}
    </ul>
  );
};

export default WordDefinition;
