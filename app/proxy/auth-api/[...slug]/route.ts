import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { setToken } from "@/src/features/auth/lib/token";
import { API_ERROR_CODE } from "@/src/shared/lib/error/errorCode";
import { reissueToken } from "@/src/features/auth/api/reissueToken";

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
  // const accessToken = process.env.DEV_ACCESS_TOKEN ?? (await getAccessToken());
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access-token")?.value ?? null;

  if (!accessToken) {
    // 로그인 안 한 상태
    return NextResponse.json(
      {
        code: API_ERROR_CODE.AUTH_REQUIRED,
        message: "Authentication required",
      },
      { status: 401 },
    );
  }

  // 토큰 첨부해서 서버 요청
  const body =
    request.method === "GET" || request.method === "HEAD"
      ? undefined
      : await request.arrayBuffer();

  const res = await fetch(url, {
    method: request.method,
    headers: buildHeaders(request, accessToken),
    body,
  });

  const data = await res.json();

  if (process.env.NODE_ENV === "development") {
    console.log(data);
  }

  if (!res.ok) {
    console.log("요청 실패:", data);
  }

  if (res.status !== 401 && data.status_code !== 401) {
    return NextResponse.json(data, { status: res.status });
  }

  // 토큰 만료 시
  const refreshToken = cookieStore.get("refresh-token")?.value ?? null;
  // 리프레시 토큰 없음 -> 다시 로그인 필요
  if (!refreshToken) {
    const response = NextResponse.json(
      {
        code: API_ERROR_CODE.AUTH_EXPIRED,
        message: "Session expired. Please login again.",
      },
      { status: 401 },
    );
    response.cookies.delete("access-token");
    response.cookies.delete("refresh-token");
    return response;
  }

  // 리프레시 토큰으로 액세스 토큰 재발급
  try {
    const newToken = await reissueToken(accessToken, refreshToken);
    // 재요청
    const res = await fetch(url, {
      method: request.method,
      headers: buildHeaders(request, newToken),
      body,
    });

    if (res.status === 401 || data.status_code === 401) {
      const response = NextResponse.json(
        {
          code: API_ERROR_CODE.AUTH_EXPIRED,
          message: "Session expired. Please login again.",
        },
        { status: 401 },
      );
      response.cookies.delete("access-token");
      response.cookies.delete("refresh-token");
      return response;
    }

    const response = NextResponse.json(data, { status: res.status });
    return setToken(response, accessToken);
  } catch (error) {
    // 토큰 재발급 실패 -> 다시 로그인 필요
    const response = NextResponse.json(
      {
        code: API_ERROR_CODE.AUTH_EXPIRED,
        message: "Session expired. Please login again.",
      },
      { status: 401 },
    );
    response.cookies.delete("access-token");
    response.cookies.delete("refresh-token");
    return response;
  }
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
