// 서버 사이드에서 사용되는 토큰 관련 유틸 함수

import { NextResponse } from "next/server";

export function setToken(
  response: NextResponse,
  accessToken: string,
  refreshToken?: string,
) {
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
  };
  response.cookies.set("access-token", accessToken, cookieOptions);
  if (refreshToken) {
    response.cookies.set("refresh-token", refreshToken, cookieOptions);
  }
  return response;
}
