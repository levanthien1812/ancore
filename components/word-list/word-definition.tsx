import { shorten } from "@/lib/utils/shorten";
import { useLayout } from "../layout/layout-context";

const WordDefinition = ({ meanings }: { meanings: string[] }) => {
  const { mode } = useLayout();
  if (mode === "grid") {
    return (
      <div className="">
        {meanings.map((meaning, index) => (
          <p key={index} className="text-sm text-white">
            {shorten(meaning, 100)}
          </p>
        ))}
      </div>
    );
  }

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
