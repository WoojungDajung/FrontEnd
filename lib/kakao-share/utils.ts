export enum MESSAGE_TEMPLATE_ID {
  INVITE = 128317,
  SHARE_RESULT = 128954,
}

export function initiateKakao() {
  if (typeof window === "undefined") {
    return;
  }

  if (window.Kakao.isInitialized()) {
    return;
  }

  window.Kakao.init(process.env.NEXT_PUBLIC_KAKAO_JS_KEY);
}

export function shareAppointmentOnKakaoTalk(
  appointmentId: string,
  appointmentName: string,
  templateId: number,
) {
  if (typeof window === "undefined") {
    return;
  }

  window.Kakao.Share.sendCustom({
    templateId: templateId,
    templateArgs: {
      meeting_id: appointmentId,
      meeting_name: appointmentName,
    },
  });
}
