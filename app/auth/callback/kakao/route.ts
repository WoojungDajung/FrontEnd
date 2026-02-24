import { ERROR_CODE } from "@/constants/error-code";
import { setToken } from "@/lib/auth/token";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const state = searchParams.get("state"); // 돌아갈 페이지

  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");
  if (error) {
    console.log(`카카오 로그인 에러: ${errorDescription} (${error})`);
  }

  if (code) {
    try {
      // 토큰 요청
      const url = `${process.env.NEXT_PUBLIC_SERVER_URL}/auth/login`;
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization_code: code,
          redirect_base: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback/kakao`,
        },
        body: JSON.stringify({}),
      });

      const resData = await res.json();

      if (!res.ok) {
        // 토큰 획득 실패
        const urlSearchParams = new URLSearchParams({
          code: ERROR_CODE.AUTH_TOKEN_EXCHANGED_FAILED,
        });
        if (state) urlSearchParams.append("next", state);
        return NextResponse.redirect(
          `${process.env.NEXT_PUBLIC_BASE_URL}/error?${urlSearchParams.toString()}`,
        );
      }

      let redirectUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/appointments`;
      // 기존 페이지로
      if (state) {
        redirectUrl = `${process.env.NEXT_PUBLIC_BASE_URL}${state}`;
      }
      const response = NextResponse.redirect(redirectUrl);
      const { accessToken, refreshToken } = resData.data;
      return setToken(response, accessToken, refreshToken);
    } catch (err) {
      // 에러 처리
      console.log(`카카오 토큰 처리 중 에러 캐치:`, err);

      const urlSearchParams = new URLSearchParams({
        code: ERROR_CODE.AUTH_UNKNOWN_ERROR,
      });
      if (state) urlSearchParams.append("next", state);
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BASE_URL}/error?${urlSearchParams.toString()}`,
      );
    }
  }

  if (error === "access_denied") {
    // 로그인 취소
    if (state) {
      const urlSearchParams = new URLSearchParams({
        next: state,
      });
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BASE_URL}?${urlSearchParams.toString()}`,
      );
    } else {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}`);
    }
  }

  const urlSearchParams = new URLSearchParams({
    code: ERROR_CODE.AUTH_UNKNOWN_ERROR,
  });
  if (state) urlSearchParams.append("next", state);
  return NextResponse.redirect(
    `${process.env.NEXT_PUBLIC_BASE_URL}/error?${urlSearchParams.toString()}`,
  );
}
