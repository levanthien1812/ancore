"use client";
import React, { useEffect, useState } from "react";
import AddOrEditWord from "../add-word/add-word";
import { Sparkles } from "lucide-react";
import { shorten } from "@/lib/utils/shorten";

/**
 * Component that detects text selection and shows a floating "Add Word" button
 */
const SelectionAddWord = () => {
  const [selection, setSelection] = useState<{
    text: string;
    x: number;
    y: number;
  } | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    const handleMouseUp = (e: MouseEvent) => {
      // Small delay to ensure the selection is fully captured by the browser
      setTimeout(() => {
        const sel = window.getSelection();
        const text = sel?.toString().trim();

        // Show button if text is selected (and not too long)
        if (text && text.length > 0 && text.length < 50) {
          // Prevent showing popover when clicking interactive elements
          const target = e.target as HTMLElement;
          if (target.closest("button, a, input, textarea")) {
            return;
          }

          const range = sel?.getRangeAt(0);
          const rect = range?.getBoundingClientRect();

          if (rect) {
            setSelection({
              text,
              // Center horizontally above the selection using viewport coords (for fixed position)
              x: rect.left + rect.width / 2,
              // Position slightly above the selection using viewport coords
              y: rect.top - 10,
            });
          }
        } else {
          setSelection(null);
        }
      }, 10);
    };

    document.addEventListener("mouseup", handleMouseUp);
    return () => document.removeEventListener("mouseup", handleMouseUp);
  }, []);

  if (!selection && !isDialogOpen) return null;

  return (
    <AddOrEditWord
      initialWord={selection?.text}
      open={isDialogOpen}
      onOpenChange={(open) => {
        setIsDialogOpen(open);
        if (!open) setSelection(null);
      }}
      triggerButton={
        selection && !isDialogOpen ? (
          <div
            className="fixed z-[9999] -translate-x-1/2 -translate-y-full pb-2 pointer-events-none"
            style={{ top: selection.y, left: selection.x }}
          >
            <div className="pointer-events-auto">
              <button className="flex items-center gap-1.5 bg-primary-2 text-white px-3 py-1.5 rounded-full shadow-lg cursor-pointer hover:scale-105 transition-all text-xs font-bold whitespace-nowrap border border-white/20">
                <Sparkles size={14} className="text-yellow-300" />
                Add &quot;
                {shorten(selection.text, 15)}
                &quot;
              </button>
            </div>
          </div>
        ) : null
      }
    />
  );
};

export default SelectionAddWord;
