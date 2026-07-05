import { useLayoutEffect, useState, RefObject } from "react";

interface XArrowConnectorProps {
  fromRef: RefObject<HTMLDivElement | null>;
  toRef: RefObject<HTMLDivElement | null>;
  strokeColor?: string;
  strokeWidth?: number;
  strokeDasharray?: string;
}

export function XArrowConnector({
  fromRef,
  toRef,
  strokeColor = "#6366f1", // Default Indigo-500
  strokeWidth = 3,
  strokeDasharray = "5,5", // Dashed by default
}: XArrowConnectorProps) {
  const [coords, setCoords] = useState({ x1: 0, y1: 0, x2: 0, y2: 0 });

  useLayoutEffect(() => {
    const updateLine = () => {
      const fromEl = fromRef.current;
      const toEl = toRef.current;

      if (!fromEl || !toEl) return;

      // 1. Get exact current positions in viewport boundary space
      const rect1 = fromEl.getBoundingClientRect();
      const rect2 = toEl.getBoundingClientRect();

      // 2. Add window scroll factors to convert coordinate maps to document-absolute spaces
      const scrollX = window.scrollX;
      const scrollY = window.scrollY;

      // Center point of the RIGHT edge of the starting component
      const x1 = rect1.right + scrollX;
      const y1 = rect1.top + scrollY + rect1.height / 2;

      // Center point of the LEFT edge of the target component
      const x2 = rect2.left + scrollX;
      const y2 = rect2.top + scrollY + rect2.height / 2;

      setCoords({ x1, y1, x2, y2 });
    };

    // Initialize line
    updateLine();

    // 3. Fallbacks to recalculate positions on window changes
    window.addEventListener("resize", updateLine);
    window.addEventListener("scroll", updateLine, { passive: true });

    // 4. Heavy-duty layout tracker: Updates positions instantly if elements move
    // independently (e.g. changing flex attributes, rendering content updates)
    const observer = new ResizeObserver(() => updateLine());
    if (fromRef.current) observer.observe(fromRef.current);
    if (toRef.current) observer.observe(toRef.current);

    return () => {
      window.removeEventListener("resize", updateLine);
      window.removeEventListener("scroll", updateLine);
      observer.disconnect();
    };
  }, [fromRef, toRef]);

  return (
    // 'fixed' positioning isolates the SVG canvas away from parent container restrictions
    <svg
      className="fixed inset-0 w-full h-full pointer-events-none z-0"
      style={{ overflow: "visible" }}
    >
      <line
        x1={coords.x1}
        y1={coords.y1}
        x2={coords.x2}
        y2={coords.y2}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeDasharray={strokeDasharray}
      />
    </svg>
  );
}
