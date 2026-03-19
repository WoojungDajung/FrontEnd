"use client";

import { cn } from "@/src/shared/utils/cn";
import { useToastStore } from "@/src/shared/toast/toastStore";

export function ToastContainer() {
  const toasts = useToastStore((state) => state.toasts);

  if (toasts.length === 0 || typeof window === "undefined") return null;

  return (
    <div className="fixed top-1/2 left-1/2 -translate-1/2 z-[9999] flex flex-col gap-8 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            "animate-slide-down",
            "rounded-[16px] bg-gray-500 text-white p-16 typo-16-regular",
          )}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}
