import { cn } from "@/utils/cn";
import { ReactNode } from "react";

interface ButtonProps {
  size?: "Large" | "Medium" | "Small";
  color?: "Primary" | "White" | "Danger" | "Gray";
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
  children: ReactNode;
}

const Button = ({
  size,
  color = "Primary",
  disabled,
  onClick,
  className,
  children,
}: ButtonProps) => {
  function getFontSize() {
    if (color === "Primary") {
      return size === "Small" ? "typo-16-semibold" : "typo-18-semibold";
    } else if (color === "White") {
      return size === "Small" ? "typo-16-regular" : "typo-18-regular";
    } else if (color === "Danger") {
      return "typo-16-semibold";
    } else {
      // color === "Gray"
      return "typo-16-semibold";
    }
  }

  return (
    <button
      className={cn(
        "button",
        size === "Large"
          ? "button--lg"
          : size === "Medium"
          ? "button--md"
          : size === "Small"
          ? "button--sm"
          : undefined,
        color === "Primary"
          ? "button--primary"
          : color === "White"
          ? "button--white"
          : color === "Danger"
          ? "button--danger"
          : "button--gray",
        getFontSize(),
        className
      )}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export default Button;
