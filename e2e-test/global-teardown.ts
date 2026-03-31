import { request } from "@playwright/test";

const BASE_URL = process.env.TEST_BASE_URL ?? "http://localhost:3000";

export default async function globalTeardown() {
  const accessToken = process.env.TEST_ACCESS_TOKEN;
  const appointmentId = process.env.TEST_APPOINTMENT_ID;

  if (!accessToken || !appointmentId) return;

  const api = await request.newContext({
    baseURL: BASE_URL,
    extraHTTPHeaders: {
      Cookie: `access-token=${accessToken}`,
    },
  });

  await api.delete(`/proxy/auth-api/appointment/${appointmentId}`);
  await api.dispose();

  console.log(`[global-teardown] 테스트 약속 삭제 완료: ${appointmentId}`);
}
