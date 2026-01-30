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

// 토큰 재발급
export async function reissueToken(
  refreshToken: string,
): Promise<string | null> {
  const url = `${process.env.NEXT_PUBLIC_SERVER_URL}/auth/reissue?refreshToken=${refreshToken}`;
  const res = await fetch(url, {
    method: "POST",
  });

  if (!res.ok) {
    console.log(await res.json());
    return null;
  }

  const accessToken = (await res.json()) as string;
  return accessToken;
}
