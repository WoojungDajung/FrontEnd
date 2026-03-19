import { ReactNode } from "react";
import { create } from "zustand";

type ConfirmVariant = "primary" | "danger";

interface ConfirmOptions {
  title?: string;
  message: string | ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmVariant;
}

interface ConfirmStore {
  options: ConfirmOptions | null;
  resolve: ((value: boolean) => void) | null;
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  handleConfirm: () => void;
  handleCancel: () => void;
}

export const useConfirmStore = create<ConfirmStore>((set, get) => ({
  options: null,
  resolve: null,

  confirm: (options) => {
    return new Promise<boolean>((resolve) => {
      set({ options, resolve });
    });
  },

  handleConfirm: () => {
    get().resolve?.(true);
    set({ options: null, resolve: null });
  },

  handleCancel: () => {
    get().resolve?.(false);
    set({ options: null, resolve: null });
  },
}));
