import { shorten } from "@/lib/utils/shorten";
import { useLayout } from "../layout/layout-context";
import { Dot } from "lucide-react";

const WordDefinition = ({ meanings }: { meanings: string[] }) => {
  const { mode } = useLayout();
  if (mode === "grid") {
    return (
      <div className="flex gap-2 items-center">
        <div className="">
          {meanings.map((meaning, index) => (
            <p key={index} className="text-sm text-white" title={meaning}>
              {meanings.length > 1 ? <Dot className="inline" /> : ""}
              {shorten(meaning, 50)}
            </p>
          ))}
        </div>
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
