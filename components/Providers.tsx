"use client";

import { makeBrowserQueryClient } from "@/lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { ReactNode, useState } from "react";

const Providers = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const [queryClient] = useState(() => {
    const onAuthError = () => {
      router.push("/"); // 로그인 페이지로 이동
    };
    return makeBrowserQueryClient(onAuthError);
  });

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

export default Providers;
