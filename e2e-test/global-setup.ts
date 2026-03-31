import { request } from "@playwright/test";

const BASE_URL = process.env.TEST_BASE_URL ?? "http://localhost:3000";

// 장소 투표 테스트에 쓸 고정 테스트 장소
const TEST_LOCATION = {
  name: "강남역",
  address: "서울 강남구 강남대로 396",
  latitude: "37.497951",
  longitude: "127.027619",
};

export default async function globalSetup() {
  const accessToken = process.env.TEST_ACCESS_TOKEN;
  if (!accessToken) {
    console.log(
      "[global-setup] TEST_ACCESS_TOKEN 없음 — vote 테스트를 건너뜁니다.",
    );
    return;
  }

  const api = await request.newContext({
    baseURL: BASE_URL,
    extraHTTPHeaders: {
      Cookie: `access-token=${accessToken}`,
      "Content-Type": "application/json",
    },
  });

  // 약속 생성
  const deadline = new Date();
  deadline.setDate(deadline.getDate() + 30);
  const deadlineStr = deadline.toISOString().split("T")[0];

  const createRes = await api.post("/proxy/auth-api/appointment", {
    data: {
      appointmentName: "[E2E] 투표 테스트",
      appointmentDueDate: deadlineStr,
      appointmentUserProfile: {
        nickName: "E2E테스터",
        address: "",
        startingPlace: "",
        latitude: "",
        longitude: "",
      },
    },
  });

  if (!createRes.ok()) {
    throw new Error(
      `약속 생성 실패 (${createRes.status()}): ${await createRes.text()}`,
    );
  }

  const createBody = await createRes.json();
  const appointmentId: string = createBody.data.appointment.appointmentId;
  process.env.TEST_APPOINTMENT_ID = appointmentId;

  // 장소 등록 (장소 투표 테스트용)
  const locationRes = await api.post(
    `/proxy/auth-api/location/${appointmentId}`,
    {
      data: {
        name: TEST_LOCATION.name,
        address: TEST_LOCATION.address,
        latitude: TEST_LOCATION.latitude,
        longitude: TEST_LOCATION.longitude,
      },
    },
  );

  if (!locationRes.ok()) {
    throw new Error(
      `장소 등록 실패 (${locationRes.status()}): ${await locationRes.text()}`,
    );
  }

  await api.dispose();

  console.log(`[global-setup] 테스트 약속 생성 완료: ${appointmentId}`);
}
