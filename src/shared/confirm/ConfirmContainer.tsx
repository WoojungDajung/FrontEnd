"use client";

import Button, { ButtonVariant } from "@/src/shared/ui/Button";
import { useConfirmStore } from "@/src/shared/confirm/confirmStore";

type ConfirmVariant = "primary" | "danger";

const getConfirmButtonColor = (
  variant: ConfirmVariant = "primary",
): ButtonVariant => {
  const variantColor: Record<string, ButtonVariant> = {
    primary: "Primary",
    danger: "Danger",
  };
  return variantColor[variant];
};

export function ConfirmContainer() {
  const { options, handleConfirm, handleCancel } = useConfirmStore();

  if (!options || typeof window === "undefined") return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={handleCancel} />

      <div className="relative w-342 bg-white rounded-[16px] border border-gray-100 flex flex-col items-center gap-24 py-16">
        {options.title && (
          <h3 className="typo-18-semibold text-gray-800">{options.title}</h3>
        )}
        <p className="typo-14-regular text-gray-500 text-center">
          {options.message}
        </p>

        <div className="w-full px-16 flex justify-between">
          <Button size="Small" color="Gray" onClick={handleCancel}>
            {options.cancelText || "닫기"}
          </Button>
          <Button
            size="Small"
            color={getConfirmButtonColor(options.variant)}
            onClick={handleConfirm}
          >
            {options.confirmText || "확인"}
          </Button>
        </div>
      </div>
    </div>
  );
}
