import React from "react";
import { motion } from "framer-motion";

const MotionLightBand = () => {
  return (
    <motion.div
      className="absolute inset-y-0 left-[-40%] w-24"
      style={{
        background: `
            linear-gradient(
            -60deg,
            transparent,
            rgba(255, 255, 255,0.35),
            rgba(255, 255, 255,0.55),
            rgba(255, 255, 255,0.35),
            transparent
            )
        `,
        transform: "skewX(-35deg)",
      }}
      animate={{ x: ["0%", "400%"] }}
      transition={{
        duration: 1.5,
        ease: "easeInOut",
        repeat: Infinity,
        repeatDelay: 3,
      }}
    />
  );
};

export default MotionLightBand;
