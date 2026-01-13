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
  return (
    <button
      className={cn(
        "button typo-18-semibold",
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
