"use client";

import { ConfirmProvider } from "@/context/ConfirmContext";
import { ToastProvider } from "@/context/ToastContext";
import { getQueryClient } from "@/lib/react-query/get-query-client";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";

const Providers = ({ children }: { children: ReactNode }) => {
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <ConfirmProvider>
        <ToastProvider>{children}</ToastProvider>
      </ConfirmProvider>
    </QueryClientProvider>
  );
};

export default Providers;
