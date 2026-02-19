import { cn } from "@/utils/cn";
import { ComponentProps } from "react";

export type ButtonVariant = "Primary" | "White" | "Danger" | "Gray";

interface ButtonProps extends ComponentProps<"button"> {
  size?: "Large" | "Medium" | "Small";
  color?: ButtonVariant;
}

const Button = ({
  size,
  color = "Primary",
  children,
  className,
  ...otherProps
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
        className,
      )}
      {...otherProps}
    >
      {children}
    </button>
  );
};

export default Button;
