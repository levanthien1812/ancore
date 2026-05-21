import { shorten } from "@/lib/utils/shorten";
import { useLayout } from "../layout/layout-context";
import { Dot } from "lucide-react";

const WordDefinition = ({ meanings }: { meanings: string[] }) => {
  const { mode } = useLayout();

  if (mode === "grid") {
    return (
      <div className="">
        <p className="text-sm text-white" title={meanings[0]}>
          {shorten(meanings[0], 70)}
        </p>
        {meanings.length > 1 && (
          <p className="text-xs text-gray-200  mt-1 italic">
            ({meanings.length - 1} more)
          </p>
        )}
      </div>
    );
  }

  return (
    <ul className="list-disc ms-4">
      {meanings.map((meaning, index) => (
        <li key={index} className="text-primary-2" title={meaning}>
          {shorten(meaning)}
        </li>
      ))}
    </ul>
  );
};

export default WordDefinition;
