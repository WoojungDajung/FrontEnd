import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/setup-meeting")) {
    return NextResponse.redirect(new URL("/appointments", request.url));
  }

  // 비로그인 상태 -> 접근 X
  const athenticated = await isAuthenticated(request);
  if (!athenticated) {
    // 로그인 페이지로 이동
    return NextResponse.redirect(new URL("/", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/setup-meeting", "/appointments", "/appointment/:path*"],
};

async function isAuthenticated(request: NextRequest): Promise<boolean> {
  const accessToken = request.cookies.get("access-token")?.value;
  return Boolean(accessToken);
}
