import { test, expect } from "@playwright/test";

test.describe("로그인", () => {
  test("이미 로그인된 사용자는 / 접근 시 /appointments로 리다이렉트된다", async ({
    page,
    context,
  }) => {
    await context.addCookies([
      {
        name: "access-token",
        value: "mock-access-token",
        domain: "localhost",
        path: "/",
      },
    ]);

    await page.goto("/");

    await page.waitForURL(/\/appointments/);
    expect(page.url()).toContain("/appointments");
  });

  test("카카오 로그인 성공 후 /appointments 화면으로 이동한다", async ({
    page,
    context,
  }) => {
    // 카카오 OAuth 콜백 후 서버가 설정한 인증 쿠키를 시뮬레이션
    await context.addCookies([
      {
        name: "access-token",
        value: "mock-access-token",
        domain: "localhost",
        path: "/",
      },
    ]);

    // LoginSuccessHandler가 호출하는 getMemberId API 모킹 (클라이언트 사이드 fetch)
    await page.route("**/proxy/auth-api/member/memberId", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          status_code: 200,
          data: { memberId: 1 },
        }),
      }),
    );

    // OAuth 콜백 완료 후 서버가 리다이렉트하는 로그인 성공 페이지로 이동
    await page.goto("/auth/login/success?next=/appointments");

    // LoginSuccessHandler가 getMemberId 호출 후 /appointments로 라우팅할 때까지 대기
    await page.waitForURL(/\/appointments/);

    expect(page.url()).toContain("/appointments");
  });
});
