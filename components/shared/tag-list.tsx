import React from "react";
import { Badge } from "../ui/badge";

const TagList = ({
  items,
  onTagClick,
  selected,
}: {
  items: string[];
  onTagClick: (tag: string) => void;
  selected?: string[];
}) => {
  return (
    <div className="flex gap-1">
      {items.map((item) => {
        const isSelected = selected?.includes(item);
        return (
          <Badge
            key={item}
            variant={isSelected ? "default" : "secondary"}
            className="cursor-pointer"
            onClick={() => onTagClick(item)}
            aria-pressed={isSelected}
          >
            {item}
          </Badge>
        );
      })}
    </div>
  );
};

export default TagList;
