import React from "react";
import { Easing, motion } from "framer-motion";

const BorderGlowAnimation = ({ children }: { children: React.ReactNode }) => {
  const strokeAnimation = {
    initial: { strokeDashoffset: 0, opacity: 1 },
    animate: {
      strokeDashoffset: -900, // Chạy hết 1 vòng (điều chỉnh tùy kích thước div)
      opacity: [1, 1, 0], // Giữ sáng và mờ dần ở 10% cuối cùng
    },
    transition: {
      duration: 3,
      ease: "easeInOut" as Easing,
      times: [0, 0.9, 1],
    },
  };

  return (
    <div className="relative rounded-2xl">
      {/* SVG tạo hiệu ứng tia sáng chạy viền */}
      {/* SVG bao quanh để làm hiệu ứng lóe sáng */}
      <svg
        className="absolute inset-0 h-full w-full pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="glowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f5d142" /> {/* Xanh Cyan */}
            <stop offset="50%" stopColor="#ffe819" /> {/* Xanh Blue */}
            <stop offset="100%" stopColor="#ffffff" />{" "}
            {/* Đầu tia màu Trắng rực */}
          </linearGradient>
        </defs>
        {/* LỚP 1: Tia lóe sáng (Glow) nằm phía dưới */}
        <motion.rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          rx="16"
          fill="none"
          stroke={"url(#glowGradient)"}
          strokeWidth="8" // Nét dày để tạo quầng
          strokeLinecap="round"
          strokeDasharray="120 500" // Tia sáng dài 100px
          style={{ filter: "blur(4px)" }} // Làm nhòe để tạo hiệu ứng phát sáng
          {...strokeAnimation}
        />

        {/* LỚP 2: Tia lõi sáng (Core) nằm đè lên trên */}
        <motion.rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          rx="16"
          fill="none"
          stroke={"url(#glowGradient)"} // Sử dụng gradient cho tia lõi
          strokeWidth="3" // Nét mảnh hơn lớp nền
          strokeLinecap="round"
          strokeDasharray="120 500"
          {...strokeAnimation}
        />
      </svg>

      {children}
    </div>
  );
};

export default BorderGlowAnimation;
