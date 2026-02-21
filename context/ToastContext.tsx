"use client";

import { cn } from "@/utils/cn";
import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { createPortal } from "react-dom";

interface ToastOptions {
  message: string;
  duration?: number; // ms, 기본 3000
}

interface Toast extends ToastOptions {
  id: string;
  duration: number;
}

interface ToastContextValue {
  toast: (options: ToastOptions) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const toast = useCallback(
    (options: ToastOptions) => {
      const id = Math.random().toString(36).substring(2, 9);
      const newToast: Toast = {
        id,
        message: options.message,
        duration: options.duration || 3000,
      };

      setToasts((prev) => [...prev, newToast]);

      setTimeout(() => {
        removeToast(id);
      }, newToast.duration);
    },
    [removeToast],
  );

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {toasts.length > 0 &&
        typeof window !== "undefined" &&
        createPortal(
          <div className="fixed top-1/2 left-1/2 -translate-1/2 z-[9999] flex flex-col gap-8 pointer-events-none">
            {toasts.map((toast) => (
              <div
                key={toast.id}
                className={cn(
                  "animate-slide-down",
                  "rounded-[16px] bg-gray-500 text-white p-16 typo-16-regular",
                )}
              >
                {toast.message}
              </div>
            ))}
          </div>,
          document.getElementById("popup")!,
        )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}
