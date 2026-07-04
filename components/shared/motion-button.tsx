import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

const MButton = motion.create(Button);

// 1. Define your preset props explicitly
const DEFAULT_ANIMATION = {
  whileHover: { scale: 1.05 },
  whileTap: { scale: 0.95, y: 4 },
} as const;

// 2. Spread defaults first, then incoming props so they can be overridden
export const MotionButton = (props: React.ComponentProps<typeof MButton>) => (
  <MButton {...DEFAULT_ANIMATION} {...props} />
);
