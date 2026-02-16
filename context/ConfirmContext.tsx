"use client";

import Button from "@/components/shared/Button";
import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { createPortal } from "react-dom";

interface ConfirmOptions {
  title?: string;
  message: string | ReactNode;
  confirmText?: string;
  cancelText?: string;
}

interface ConfirmContextValue {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextValue | null>(null);

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [confirmState, setConfirmState] = useState<{
    options: ConfirmOptions;
    resolve: (value: boolean) => void;
  } | null>(null);

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setConfirmState({
        options,
        resolve,
      });
    });
  }, []);

  const handleConfirm = () => {
    confirmState?.resolve(true);
    setConfirmState(null);
  };

  const handleCancel = () => {
    confirmState?.resolve(false);
    setConfirmState(null);
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {confirmState &&
        typeof window !== "undefined" &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center">
            <div
              className="absolute inset-0 bg-black/60"
              onClick={handleCancel}
            />

            {/* Modal */}
            <div className="relative w-342 bg-white rounded-[16px] border border-gray-100 flex flex-col items-center gap-24 py-16">
              {confirmState.options.title && (
                <h3 className="typo-18-semibold text-gray-800">
                  {confirmState.options.title}
                </h3>
              )}
              <p className="typo-14-regular text-gray-500 text-center">
                {confirmState.options.message}
              </p>

              <div className="w-full px-16 flex justify-between">
                <Button size="Small" color="Gray" onClick={handleCancel}>
                  {confirmState.options.cancelText || "닫기"}
                </Button>
                <Button size="Small" color="Danger" onClick={handleConfirm}>
                  {confirmState.options.confirmText || "확인"}
                </Button>
              </div>
            </div>
          </div>,
          document.getElementById("popup")!,
        )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error("useConfirm must be used within ConfirmProvider");
  }
  return context.confirm;
}
