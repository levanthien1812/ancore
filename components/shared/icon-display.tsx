import React, { useMemo } from "react";

export type IconProps = {
  width: number;
  height: number;
  className?: string;
};

type Props = {
  icon: React.ComponentType<IconProps>;
  bgClass?: string;
  hoverClass?: string;
  activeClass?: string;
  size?: "sm" | "md" | "lg";
  iconColor?: string;
  additionalClasses?: string;
  asButton?: boolean;
  onClick?: React.MouseEventHandler<HTMLElement>;
  disabled?: boolean;
};

const IconDisplay = ({
  icon: Icon,
  bgClass = "bg-white/20",
  hoverClass = "hover:bg-white/30",
  activeClass = "active:bg-white/40",
  size = "md",
  iconColor = "text-white",
  additionalClasses = "",
  asButton = false,
  ...rest
}: Props) => {
  const classesBySize = useMemo(() => {
    switch (size) {
      case "sm":
        return {
          parent: "p-1",
          child: {
            width: 14,
          },
        };
      case "md":
        return {
          parent: "p-2",
          child: {
            width: 16,
          },
        };
      case "lg":
        return {
          parent: "p-3",
          child: {
            width: 18,
          },
        };
    }
  }, [size]);

  const Component = asButton ? "button" : "div";

  const classes = useMemo(() => {
    const commonClasses = `flex justify-center items-center ${classesBySize.parent} rounded-full h-fit ${bgClass} ${additionalClasses}`;

    if (asButton) {
      return `${commonClasses} cursor-pointer ${hoverClass} active:font-bold ${activeClass}`;
    } else {
      return commonClasses;
    }
  }, [
    classesBySize,
    bgClass,
    activeClass,
    asButton,
    additionalClasses,
    hoverClass,
  ]);

  return (
    <Component
      type={asButton ? "button" : undefined}
      className={classes}
      {...rest}
    >
      <Icon
        width={classesBySize.child.width}
        height={classesBySize.child.width}
        className={iconColor}
      />
    </Component>
  );
};

export default IconDisplay;
