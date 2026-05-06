import React from "react";
import { IconProps } from "./icon-display";

type Props = {
  size: "sm" | "md" | "lg";
  icon: React.ComponentType<IconProps>;
};

const IconButton = () => {
  return <div>IconButton</div>;
};

export default IconButton;
