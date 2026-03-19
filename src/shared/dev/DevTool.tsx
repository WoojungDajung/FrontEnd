"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";

const isDev = process.env.NODE_ENV === "development";

async function logout() {
  const res = await fetch("/proxy/auth/logout", {
    method: "POST",
  });

  if (res.status !== 200) {
    const { message } = await res.json();
    console.log(message);
  }
}

const DevTool = () => {
  const router = useRouter();

  const onClickLogoutButton = useCallback(async () => {
    await logout();
    router.push("/");
  }, [router]);

  if (!isDev) return null;

  return (
    <div className="fixed top-10 left-10 z-9999 rounded-[24px] p-16 border border-gray-100 bg-white/50 flex flex-col gap-12">
      <p className="typo-16-semibold text-gray-800">Dev Tools</p>
      <button
        className="rounded-[12px] p-4 border border-gray-100 typo-14-regular text-gray-800 cursor-pointer bg-white/50 hover:bg-gray-200/50"
        onClick={onClickLogoutButton}
      >
        로그아웃
      </button>
    </div>
  );
};

export default DevTool;
