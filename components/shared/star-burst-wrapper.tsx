"use client";
import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { STAR_BURST_DELAY } from "@/lib/constants/constant";

interface CustomStar {
  id: number;
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  targetRotate: number;
  size: number;
}

interface StarBurstWrapperProps {
  children: React.ReactElement<{ onClick?: React.MouseEventHandler }>;
  className?: string;
}

export function StarBurstWrapper({
  children,
  className,
}: StarBurstWrapperProps) {
  const [stars, setStars] = useState<CustomStar[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const triggerBurst = (e: React.MouseEvent<HTMLElement>) => {
    if (!containerRef.current) return;

    // 1. Get the exact shape of the button at the moment of the click
    const rect = containerRef.current.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;

    const starCount = 6; // Keep it clean and minimal
    const newStars: CustomStar[] = [];

    for (let i = 0; i < starCount; i++) {
      // 2. Pick a random angle (0 to 360 degrees)
      const angle = Math.random() * Math.PI * 2;

      // 3. Start position: Right near the perimeter edges of the button
      // We map the circle angle to the button's width/height bounding box
      const startX = Math.cos(angle) * (w * 0.45);
      const startY = Math.sin(angle) * (h * 0.45);

      // 4. End position: Short distance outward (20px to 45px max travel distance)
      const driftDistance = 20 + Math.random() * 25;
      const targetX = startX + Math.cos(angle) * driftDistance;
      const targetY = startY + Math.sin(angle) * driftDistance;

      // 5. Minimal rotation: Restrict rotation to a tight window (-30 to +30 degrees)
      const targetRotate = (Math.random() - 0.5) * 60;

      newStars.push({
        id: Date.now() + i + Math.random(),
        startX,
        startY,
        targetX,
        targetY,
        targetRotate,
        size: 12 + Math.random() * 10, // Slight variation in sizes
      });
    }

    setStars(newStars);
  };

  return (
    <div
      ref={containerRef}
      className={cn("relative inline-block isolate", className)}
    >
      {/* The Bouncy Button */}
      <div className="relative z-10 w-full" onClickCapture={triggerBurst}>
        {children}
      </div>

      {/* Controlled Star Burst */}
      <AnimatePresence>
        {stars.map((star) => (
          <motion.div
            key={star.id}
            className="absolute pointer-events-none left-1/2 top-1/2 z-20 text-[#FFD700]"
            style={{ x: "-50%", y: "-50%" }}
            initial={{
              x: `calc(-50% + ${star.startX}px)`,
              y: `calc(-50% + ${star.startY}px)`,
              scale: 0,
              opacity: 1,
              rotate: 0,
            }}
            animate={{
              x: `calc(-50% + ${star.targetX}px)`,
              y: `calc(-50% + ${star.targetY}px)`,
              scale: [0, 1.1, 1, 0], // Pops into view, stabilizes, shrinks away
              opacity: [1, 1, 0.8, 0],
              rotate: star.targetRotate, // Light rotation twist
            }}
            transition={{
              duration: STAR_BURST_DELAY, // Extended, relaxed duration
              ease: "easeOut", // Smooth deceleration
            }}
            onAnimationComplete={() => {
              setStars((prev) => prev.filter((s) => s.id !== star.id));
            }}
          >
            <Star
              size={star.size}
              fill="currentColor"
              color="currentColor"
              className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.15)]"
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
