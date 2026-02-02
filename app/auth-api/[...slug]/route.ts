import {
  deleteToken,
  getAccessToken,
  getRefreshToken,
  reissueToken,
  saveToken,
} from "@/lib/auth/token";
import { NextResponse } from "next/server";

function buildHeaders(request: Request, accessToken?: string) {
  const headers = new Headers();

  const allowList = ["content-type"];

  for (const name of allowList) {
    const value = request.headers.get(name);
    if (value) {
      headers.append(name, value);
    }
  }

  if (accessToken) {
    headers.set("access_token", `Bearer ${accessToken}`);
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  return headers;
}

async function handler(
  request: Request,
  { params }: { params: Promise<{ slug: string[] }> },
) {
  const { slug } = await params;

  const search = new URL(request.url).search;
  const url = `${process.env.NEXT_PUBLIC_SERVER_URL}/${slug.join("/")}${search}`;

  // 토큰 확인
  const accessToken = process.env.DEV_ACCESS_TOKEN ?? (await getAccessToken());

  if (!accessToken) {
    // 로그인 안 한 상태
    return NextResponse.json(
      { code: "AUTH_REQUIRED", message: "Authentication required" },
      { status: 401 },
    );
  }

  // 토큰 첨부해서 서버 요청
  const body =
    request.method === "GET" || request.method === "HEAD"
      ? undefined
      : await request.arrayBuffer();

  let res = await fetch(url, {
    method: request.method,
    headers: buildHeaders(request, accessToken),
    body,
  });

  const data = await res.json();

  if (!res.ok) {
    console.log("요청 실패:", data);
  }

  // 토큰 만료 시
  if (res.status === 401 || data.status_code === 401) {
    const refreshToken = await getRefreshToken();
    // 리프레시 토큰 없음 -> 다시 로그인 필요
    if (!refreshToken) {
      deleteToken(); // 로그아웃 처리
      return NextResponse.json(
        {
          code: "AUTH_EXPIRED",
          message: "Session expired. Please login again.",
        },
        { status: 401 },
      );
    }

    // 리프레시 토큰으로 액세스 토큰 재발급
    const newToken = await reissueToken(refreshToken);
    if (newToken) {
      await saveToken(newToken);
      // 재요청
      res = await fetch(url, {
        method: request.method,
        headers: buildHeaders(request, newToken),
        body,
      });
    } else {
      // 토큰 재발급 실패 -> 다시 로그인 필요
      deleteToken(); // 로그아웃 처리
      return NextResponse.json(
        {
          code: "AUTH_EXPIRED",
          message: "Session expired. Please login again.",
        },
        { status: 401 },
      );
    }
  }

  return NextResponse.json(data, { status: res.status });
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
