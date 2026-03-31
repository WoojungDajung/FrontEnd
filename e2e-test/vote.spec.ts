import { test, expect, BrowserContext } from "@playwright/test";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// 날짜 투표
// ---------------------------------------------------------------------------

test.describe("날짜 투표", () => {
  test.skip(
    !process.env.TEST_ACCESS_TOKEN,
    "TEST_ACCESS_TOKEN이 설정되지 않아 건너뜁니다.",
  );

  test.beforeEach(async ({ context, page }) => {
    await setAuthCookie(context);
    await page.goto(`/appointment/${getAppointmentId()}`);
  });

  test("날짜를 선택하고 저장하면 투표가 완료된다", async ({ page }) => {
    // 투표 POST만 모킹 (브라우저 요청), 페이지 렌더링은 실제 데이터 사용
    await page.route("**/proxy/auth-api/date/vote/**", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ status_code: 200, data: {} }),
      }),
    );

    // "선택하기"가 활성화될 때까지 대기 (profileData + appointmentData 모두 로드돼야 enabled)
    await expect(
      page.getByRole("button", { name: "선택하기" }).first(),
    ).toBeEnabled();
    await page.getByRole("button", { name: "선택하기" }).first().click();

    // VoteCalendar 렌더링 확인 (aria-label "다음 달" 버튼은 VoteCalendar 전용)
    const nextMonthButton = page.getByLabel("다음 달");
    await expect(nextMonthButton).toBeVisible();
    await nextMonthButton.click();
    // 활성화된 날짜 버튼 클릭 (날짜는 숫자만으로 구성, disabled되지 않은 것)
    await page
      .locator("button:not([disabled])")
      .filter({ hasText: /^\d+$/ })
      .first()
      .click();

    // 저장하기 → 확인 다이얼로그
    await page.getByRole("button", { name: "저장하기" }).click();
    await page.getByRole("button", { name: "확인" }).click();

    // 성공 토스트 확인
    await expect(page.getByText("투표가 완료됐어요.")).toBeVisible();
  });

  test("날짜 투표 API 실패 시 에러 토스트가 표시된다", async ({ page }) => {
    await page.route("**/proxy/auth-api/date/vote/**", (route) =>
      route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ status_code: 500, message: "서버 오류" }),
      }),
    );

    await expect(
      page.getByRole("button", { name: "선택하기" }).first(),
    ).toBeEnabled();
    await page.getByRole("button", { name: "선택하기" }).first().click();
    await expect(page.getByLabel("다음 달")).toBeVisible();
    await page
      .locator("button:not([disabled])")
      .filter({ hasText: /^\d+$/ })
      .first()
      .click();
    await page.getByRole("button", { name: "저장하기" }).click();
    await page.getByRole("button", { name: "확인" }).click();

    await expect(
      page.getByText("투표에 실패했습니다. 잠시 후 다시 시도해주세요."),
    ).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// 장소 투표
// ---------------------------------------------------------------------------

test.describe("장소 투표", () => {
  test.skip(
    !process.env.TEST_ACCESS_TOKEN,
    "TEST_ACCESS_TOKEN이 설정되지 않아 건너뜁니다.",
  );

  test.beforeEach(async ({ context, page }) => {
    await setAuthCookie(context);

    const appointmentId = getAppointmentId();

    // appointment-locations를 즉시 응답하도록 모킹
    // → refetch 완료 즉시 isFetchingForVote=false + mode="VOTE" 전환
    // → 로딩 스피너 없이 VotePlaceForm이 렌더링됨 (webkit 타임아웃 문제도 해결)
    await page.route(`**/proxy/auth-api/location/${appointmentId}`, (route) => {
      if (route.request().method() !== "GET") return route.continue();
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          status_code: 200,
          data: {
            locationList: [
              {
                id: 1,
                name: "강남역",
                address: "서울 강남구 강남대로 396",
                voteCount: "0",
                percentage: "0%",
              },
            ],
            memberVoteRatio: "0/1",
          },
        }),
      });
    });

    // 내 투표 현황을 "투표 없음"으로 고정 → 테스트를 반복 실행해도 동일한 초기 상태
    await page.route("**/proxy/auth-api/location/myvote/**", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ status_code: 200, data: [] }),
      }),
    );

    await page.goto(`/appointment/${appointmentId}`);
  });

  test("장소를 선택하고 저장하면 투표가 완료된다", async ({ page }) => {
    await page.route("**/proxy/auth-api/location/vote/**", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ status_code: 200, data: null }),
      }),
    );

    // "투표하기"가 활성화될 때까지 대기 (canVote = profileData !== undefined && !disabled)
    await expect(page.getByRole("button", { name: "투표하기" })).toBeEnabled();
    await page.getByRole("button", { name: "투표하기" }).click();

    // VOTE 모드 진입 확인 ("저장하기"는 VotePlaceForm 전용)
    // onClickVoteButton이 백엔드 refetch를 기다린 후 VOTE 모드로 전환하므로 넉넉한 타임아웃 부여
    await expect(
      page.getByRole("button", { name: "저장하기" }).last(),
    ).toBeVisible();

    // globalSetup에서 등록한 장소 클릭
    await page.getByText("강남역").click();
    await page.getByRole("button", { name: "저장하기" }).last().click();

    // 성공 토스트 확인
    await expect(page.getByText("투표가 완료됐어요.")).toBeVisible();
  });

  test("장소 투표 API 실패 시 에러 토스트가 표시된다", async ({ page }) => {
    await page.route("**/proxy/auth-api/location/vote/**", (route) =>
      route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ status_code: 500, message: "서버 오류" }),
      }),
    );

    await expect(page.getByRole("button", { name: "투표하기" })).toBeEnabled();
    await page.getByRole("button", { name: "투표하기" }).click();
    // onClickVoteButton이 백엔드 refetch를 기다린 후 VOTE 모드로 전환하므로 넉넉한 타임아웃 부여
    await expect(
      page.getByRole("button", { name: "저장하기" }).last(),
    ).toBeVisible();
    await page.getByText("강남역").click();
    await page.getByRole("button", { name: "저장하기" }).last().click();

    await expect(
      page.getByText("투표에 실패했습니다. 잠시 후 다시 시도해주세요."),
    ).toBeVisible();
  });
});
