// 서버 사이드에서 사용되는 토큰 관련 유틸 함수

import { cookies } from "next/headers";

// 토큰 쿠키에 저장
export async function saveToken(accessToken: string, refreshToken?: string) {
  const cookieStore = await cookies();
  cookieStore.set("access-token", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
  });

  if (refreshToken) {
    cookieStore.set("refresh-token", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
    });
  }
}

// 로그아웃 처리
export async function deleteToken() {
  const cookieStore = await cookies();
  cookieStore.delete("access-token");
  cookieStore.delete("refresh-token");
}

// 토큰 조회 - Access Token
export async function getAccessToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access-token");
  return accessToken?.value ?? null;
}
// 토큰 조회 - Refresh Token
export async function getRefreshToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refresh-token");
  return refreshToken?.value ?? null;
}
