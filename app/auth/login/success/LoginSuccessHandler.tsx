"use client";

import { getMemberId } from "@/api/member";
import { sendGTM } from "@/lib/google-tag-manager";
import { LoginCompleteEventData } from "@/types/gtmEventData";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useEffectEvent } from "react";

const LoginSuccessHandler = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const searchParams = useSearchParams();

  const sendGTMEvent = useEffectEvent(async () => {
    const { memberId } = await queryClient.fetchQuery({
      queryKey: ["member-id"],
      queryFn: getMemberId,
    });
    const data: LoginCompleteEventData = {
      event: "user_login_complete",
      member_id: memberId,
    };
    sendGTM(data);
  });
  useEffect(() => {
    const next = searchParams.get("next") ?? "/appointments";

    const alreadyTracked = sessionStorage.getItem("login-tracked");
    if (!alreadyTracked) {
      sendGTMEvent().then(() => {
        sessionStorage.setItem("login-tracked", "true");
        router.replace(next);
      });
    } else {
      router.replace(next);
    }
  }, [router, searchParams]);

  return null;
};

export default LoginSuccessHandler;
