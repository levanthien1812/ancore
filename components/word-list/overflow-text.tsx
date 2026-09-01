"use client";

import React, { useEffect, useRef, useState } from "react";

type OverflowTextProps = {
  children: React.ReactNode;
  className?: string;
  speed?: number; // pixels per second
  title?: string;
};

export function OverflowText({
  children,
  className = "",
  speed = 60,
  title,
}: OverflowTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);

  const [isOverflowing, setIsOverflowing] = useState(false);
  const [distance, setDistance] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const checkOverflow = () => {
      const container = containerRef.current;
      const text = textRef.current;

      if (!container || !text) return;

      // Temporarily set display: inline-block & max-width: none to accurately measure intrinsic text width
      const prevDisplay = text.style.display;
      const prevMaxWidth = text.style.maxWidth;

      text.style.display = "inline-block";
      text.style.maxWidth = "none";

      const textWidth = text.offsetWidth;
      const containerWidth = container.clientWidth;

      text.style.display = prevDisplay;
      text.style.maxWidth = prevMaxWidth;

      const overflowDistance = textWidth - containerWidth;

      if (overflowDistance > 2) {
        setIsOverflowing(true);
        setDistance(overflowDistance);
        setDuration(overflowDistance / speed);
      } else {
        setIsOverflowing(false);
        setDistance(0);
        setDuration(0);
      }
    };

    checkOverflow();

    if (document.fonts) {
      document.fonts.ready.then(checkOverflow);
    }

    const resizeObserver = new ResizeObserver(checkOverflow);
    if (containerRef.current) resizeObserver.observe(containerRef.current);
    if (textRef.current) resizeObserver.observe(textRef.current);

    return () => resizeObserver.disconnect();
  }, [speed, children]);

  return (
    <div
      ref={containerRef}
      className={`overflow-hidden flex-1 min-w-0 ${className}`}
      title={title}
      style={
        {
          "--overflow-distance": `-${distance}px`,
          "--overflow-duration": `${duration}s`,
        } as React.CSSProperties
      }
    >
      <span
        ref={textRef}
        className={`block truncate max-w-full ${
          isOverflowing ? "marquee-on-group-hover" : ""
        }`}
      >
        {children}
      </span>
    </div>
  );
}
