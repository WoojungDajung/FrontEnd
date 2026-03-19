import { create } from "zustand";

interface Toast {
  id: string;
  message: string;
  duration: number;
}

interface ToastOptions {
  message: string;
  duration?: number;
}

interface ToastStore {
  toasts: Toast[];
  toast: (options: ToastOptions) => void;
  removeToast: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],

  toast: (options) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: Toast = {
      id,
      message: options.message,
      duration: options.duration ?? 3000,
    };

    set((state) => ({ toasts: [...state.toasts, newToast] }));

    setTimeout(() => {
      useToastStore.getState().removeToast(id);
    }, newToast.duration);
  },

  removeToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));
