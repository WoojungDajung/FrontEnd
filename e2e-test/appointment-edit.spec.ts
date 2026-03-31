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

// ---------------------------------------------------------------------------
// 약속 정보 수정 후 페이지 반영
// ---------------------------------------------------------------------------

test.describe("약속 정보 수정 후 페이지 반영", () => {
  test.skip(
    !process.env.TEST_ACCESS_TOKEN,
    "TEST_ACCESS_TOKEN이 설정되지 않아 건너뜁니다.",
  );

  test.beforeEach(async ({ context, page }) => {
    await setAuthCookie(context);
    await page.goto(`/appointment/${getAppointmentId()}`);
  });

  test("수정 후 변경된 이름이 페이지에 반영된다", async ({ page }) => {
    const appointmentId = getAppointmentId();

    // PUT 성공 후 React Query가 refetch할 때 새 데이터를 반환한다.
    // - 초기 페이지 로드는 서버사이드 fetch라 이 mock이 적용되지 않는다.
    // - PUT 이후 클라이언트 사이드 GET refetch는 이 mock이 인터셉트한다.
    let putCompleted = false;

    await page.route(
      `**/proxy/auth-api/appointment/${appointmentId}`,
      (route) => {
        const method = route.request().method();

        if (method === "PUT") {
          putCompleted = true;
          return route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({
              status_code: 200,
              data: {
                appointment: {
                  appointmentId,
                  appointmentName: "수정된 약속 이름",
                  appointmentDueDate: "2026-04-28",
                  confirmYn: "N",
                  profileYn: "Y",
                  hostYn: "Y",
                  dday: "D-30",
                  appointmentUserId: 1,
                },
                appointmentUserList: [],
                confirmedResult: null,
              },
            }),
          });
        }

        if (method === "GET" && putCompleted) {
          return route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({
              status_code: 200,
              data: {
                appointment: {
                  appointmentId,
                  appointmentName: "수정된 약속 이름",
                  appointmentDueDate: "2026-04-28",
                  confirmYn: "N",
                  profileYn: "Y",
                  hostYn: "Y",
                  dday: "D-30",
                  appointmentUserId: 1,
                },
                appointmentUserList: [],
                confirmedResult: null,
              },
            }),
          });
        }

        return route.continue();
      },
    );

    const editButton = page.getByRole("button", { name: "약속 정보 수정" });
    // disabled={!mounted}: hydration 완료 후 enabled → React onClick 핸들러 attach 보장
    await expect(editButton).toBeEnabled();
    await editButton.click();

    // BottomDrawer가 role="dialog"로 렌더링됨
    // data-state="open"이 될 때까지 대기
    const dialog = page.locator('[role="dialog"][data-state="open"]');
    await expect(dialog).toBeVisible({ timeout: 15000 });
    await page.waitForTimeout(500); // 애니메이션 소요 시간

    const appointmentNameInput = dialog.locator(
      'input[name="appointmentName"]',
    );
    await expect(appointmentNameInput).toBeVisible();
    await appointmentNameInput.click({ clickCount: 3 }); // 기존 텍스트 전체 선택
    await appointmentNameInput.pressSequentially("수정된 약속 이름");

    // isDirty=true가 될 때까지 대기 후 클릭
    await expect(
      dialog.getByRole("button", { name: "등록하기" }),
    ).toBeEnabled();
    await dialog.getByRole("button", { name: "등록하기" }).click();

    await expect(page.getByText("저장이 완료됐어요.")).toBeVisible();
    await expect(page.getByText("수정된 약속 이름")).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// 프로필 수정 후 페이지 반영
// ---------------------------------------------------------------------------

test.describe("프로필 수정 후 페이지 반영", () => {
  test.skip(
    !process.env.TEST_ACCESS_TOKEN,
    "TEST_ACCESS_TOKEN이 설정되지 않아 건너뜁니다.",
  );

  test.beforeEach(async ({ context, page }) => {
    await setAuthCookie(context);
    await page.goto(`/appointment/${getAppointmentId()}`);
  });

  test("수정 후 변경된 닉네임이 참여자 목록에 반영된다", async ({ page }) => {
    const appointmentId = getAppointmentId();

    // GET /proxy/auth-api/member/{id} → getMemberProfile (appointment-user-profile 쿼리 refetch)
    // PUT /proxy/auth-api/member/{id} → updateMemberProfile
    // 두 요청이 같은 URL을 사용하므로 한 핸들러에서 처리한다.
    let putCompleted = false;

    await page.route(`**/proxy/auth-api/member/${appointmentId}`, (route) => {
      const method = route.request().method();

      if (method === "PUT") {
        putCompleted = true;
        return route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            status_code: 200,
            data: {
              nickName: "수정된닉네임",
              address: "",
              startingPlace: "",
              longitude: "",
              latitude: "",
            },
          }),
        });
      }

      if (method === "GET" && putCompleted) {
        return route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            status_code: 200,
            data: {
              id: 999,
              memberNickName: "수정된닉네임",
              startingPlace: null,
            },
          }),
        });
      }

      return route.continue();
    });

    await page.route(
      `**/proxy/auth-api/appointment/${appointmentId}`,
      (route) => {
        if (route.request().method() === "GET" && putCompleted) {
          return route.fulfill({
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
                  profileYn: "Y",
                  hostYn: "Y",
                  dday: "D-30",
                  appointmentUserId: 999,
                },
                appointmentUserList: [
                  { id: 999, nickName: "수정된닉네임", editableYn: "Y" },
                ],
                confirmedResult: null,
              },
            }),
          });
        }
        return route.continue();
      },
    );

    await expect(
      page.getByRole("button", { name: "프로필 수정" }),
    ).toBeVisible();
    await page.getByRole("button", { name: "프로필 수정" }).click();

    const dialog = page.locator('[role="dialog"][data-state="open"]');
    await expect(dialog).toBeVisible({ timeout: 15000 });
    await page.waitForTimeout(500); // 애니메이션 소요 시간

    // input[name="nickName"]을 탐색
    const nickNameInput = page.locator('input[name="nickName"]');
    await expect(nickNameInput).toBeVisible();
    await nickNameInput.click({ clickCount: 3 });
    await nickNameInput.pressSequentially("수정된닉네임");

    // profile drawer의 저장하기 (form submit button)
    await expect(
      page.locator('[role="dialog"]').getByRole("button", { name: "저장하기" }),
    ).toBeEnabled();
    await page
      .locator('[role="dialog"]')
      .getByRole("button", { name: "저장하기" })
      .click();

    await expect(page.getByText("저장이 완료됐어요.")).toBeVisible();
    await expect(page.getByText("수정된닉네임")).toBeVisible();
  });
});
