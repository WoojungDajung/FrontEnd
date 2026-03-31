import { test, expect, BrowserContext } from "@playwright/test";

async function setAuthCookie(context: BrowserContext) {
  await context.addCookies([
    {
      name: "access-token",
      value: process.env.TEST_ACCESS_TOKEN!,
      domain: "localhost",
      path: "/",
    },
  ]);
}

function getAppointmentId() {
  const id = process.env.TEST_APPOINTMENT_ID;
  if (!id) throw new Error("TEST_APPOINTMENT_ID가 설정되지 않았습니다.");
  return id;
}

test.describe("약속 생성 → 상세 페이지 이동", () => {
  test.skip(
    !process.env.TEST_ACCESS_TOKEN,
    "TEST_ACCESS_TOKEN이 설정되지 않아 건너뜁니다.",
  );

  test("약속을 생성하면 상세 페이지로 이동하고 실제 데이터가 표시된다", async ({
    page,
    context,
  }) => {
    const appointmentId = getAppointmentId();
    await setAuthCookie(context);

    await page.goto("/appointments");

    // 생성 API 모킹 — globalSetup이 만든 실제 약속 ID를 반환해 상세 페이지가
    // 실제 백엔드 데이터로 서버사이드 렌더링되도록 한다
    await page.route("**/proxy/auth-api/appointment", (route) =>
      route.request().method() === "POST"
        ? route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({
              status_code: 200,
              data: {
                appointment: {
                  appointmentId,
                  appointmentName: "[E2E] 투표 테스트",
                  appointmentDueDate: "2026-04-28",
                  confirmYn: "N",
                  profileYn: "N",
                  hostYn: "Y",
                  dday: "D-30",
                  appointmentUserId: 1,
                },
                appointmentUserList: [],
                confirmedResult: null,
              },
            }),
          })
        : route.continue(),
    );

    await page.getByPlaceholder("예) 노란고양이파").fill("E2E 테스트 약속");
    await page.getByText("연도-월-일").click();
    await page.getByRole("button", { name: "다음 달로 이동" }).click();
    await page.locator('[role="grid"] button:not([disabled])').first().click();
    await page.getByPlaceholder("예) 애옹이").fill("테스터");

    await page.getByRole("button", { name: "약속 정하러 가기" }).click();

    await page.waitForURL(`/appointment/${appointmentId}`);
    await expect(page.getByText("[E2E] 투표 테스트")).toBeVisible();
  });
});
