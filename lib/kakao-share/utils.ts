export function initiateKakao() {
  if (typeof window === "undefined") {
    return;
  }

  if (window.Kakao.isInitialized()) {
    return;
  }

  window.Kakao.init(process.env.NEXT_PUBLIC_KAKAO_JS_KEY);
}

export function shareMeetingOnKakaoTalk(
  meetingId: string,
  meetingName: string,
) {
  if (typeof window === "undefined") {
    return;
  }

  window.Kakao.Share.sendCustom({
    templateId: 128317,
    templateArgs: {
      meeting_id: meetingId,
      meeting_name: meetingName,
    },
  });
}
