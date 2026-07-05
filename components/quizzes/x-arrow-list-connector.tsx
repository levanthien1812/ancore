import { useLayoutEffect, useRef, useState } from "react";

interface XArrowStateConnectorProps {
  // Pass the raw state array so the hook knows exactly when to re-trigger
  dataList: Array<{ id: string | number; targetId?: string | number }>;
  leftRefs: React.MutableRefObject<{ [key: string]: HTMLDivElement | null }>;
  rightRefs: React.MutableRefObject<{ [key: string]: HTMLDivElement | null }>;
  strokeColor?: string;
  strokeWidth?: number;
  strokeDasharray?: string;
}

interface LineCoords {
  id: string | number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export function XArrowStateConnector({
  dataList,
  leftRefs,
  rightRefs,
  strokeColor = "#6366f1",
  strokeWidth = 1,
  strokeDasharray = "0",
}: XArrowStateConnectorProps) {
  const [lines, setLines] = useState<LineCoords[]>([]);
  const svgRef = useRef<SVGSVGElement>(null);

  useLayoutEffect(() => {
    const updateAllLines = () => {
      const svgEl = svgRef.current;
      if (!svgEl) return;
      const svgRect = svgEl.getBoundingClientRect();

      const calculatedLines = dataList
        .map((item) => {
          const fromEl = leftRefs.current[item.id];
          const toEl = rightRefs.current[item.targetId ?? item.id];

          // If the element hasn't mounted yet, skip it safely
          if (!fromEl || !toEl) return null;

          const rect1 = fromEl.getBoundingClientRect();
          const rect2 = toEl.getBoundingClientRect();

          const x1 = rect1.right - svgRect.left;
          const y1 = rect1.top + rect1.height / 2 - svgRect.top;

          const x2 = rect2.left - svgRect.left;
          const y2 = rect2.top + rect2.height / 2 - svgRect.top;

          return { id: item.id, x1, y1, x2, y2 };
        })
        .filter((line): line is LineCoords => line !== null);

      setLines(calculatedLines);
    };

    // Calculate lines after the DOM updates with the new state
    updateAllLines();

    window.addEventListener("resize", updateAllLines);
    // Since lines are now relative to the absolute SVG, they natively scroll with the container!
    // No need to eagerly listen to scroll events unless elements move independently.

    // Instantly watch all elements currently registered in the DOM cache
    const observer = new ResizeObserver(() => updateAllLines());
    dataList.forEach((item) => {
      const fromEl = leftRefs.current[item.id];
      const toEl = rightRefs.current[item.targetId ?? item.id];
      if (fromEl) observer.observe(fromEl);
      if (toEl) observer.observe(toEl);
    });

    return () => {
      window.removeEventListener("resize", updateAllLines);
      observer.disconnect();
    };
    // 💡 CRUCIAL: Re-run this whole layout effect whenever the state length changes!
  }, [dataList, leftRefs, rightRefs]);

  return (
    <svg
      ref={svgRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0"
      style={{ overflow: "visible" }}
    >
      {lines.map((line) => {
        const offset = Math.abs(line.x2 - line.x1) / 2;
        const d = `M ${line.x1} ${line.y1} C ${line.x1 + offset} ${line.y1}, ${line.x2 - offset} ${line.y2}, ${line.x2} ${line.y2}`;
        return (
          <path
            key={line.id}
            d={d}
            fill="none"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDasharray}
          />
        );
      })}
    </svg>
  );
}
