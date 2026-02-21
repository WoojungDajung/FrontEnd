import { logout } from "@/api/auth";
import { getRefreshToken } from "@/lib/auth/token";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const refreshToken = await getRefreshToken();

  let body = {};
  let statusCode = 0;

  if (refreshToken) {
    try {
      await logout(refreshToken);
      body = { ok: true };
      statusCode = 200;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      body = { message: `로그아웃 실패: ${error.messsage}` };
      statusCode = 500;
    }
  } else {
    body = { message: "로그인 상태 아님" };
    statusCode = 500;
  }

  const response = NextResponse.json(body, { status: statusCode });

  response.cookies.delete("access-token");
  response.cookies.delete("refresh-token");

  return response;
}
