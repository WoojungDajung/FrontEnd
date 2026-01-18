import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  // TODO: 로그인 안하면 접근 X
  // if (!isAuthenticated()) {
  //   return NextResponse.redirect(new URL("/", request.url));
  // }
}

export const config = {
  matcher: "/meeting/:path*",
};

async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access-token");
  if (!accessToken) {
    return false;
  }
  return true;
}
