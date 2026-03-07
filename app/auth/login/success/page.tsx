"use client";

import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

const Page = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const next = searchParams.get("next") ?? "/appointments";
    router.replace(next);
  }, [router, searchParams]);

  return (
    <div className="fixed left-0 top-0 w-dvw h-dvh grid place-content-center">
      <LoadingSpinner open size={50} />
    </div>
  );
};

export default Page;
