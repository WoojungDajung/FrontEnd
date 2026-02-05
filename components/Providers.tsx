"use client";

import { getQueryClient } from "@/lib/react-query/get-query-client";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";

const Providers = ({ children }: { children: ReactNode }) => {
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

export default Providers;
