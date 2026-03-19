import { sendGTMEvent } from "@next/third-parties/google";

export function sendGTM(data: object) {
  if (process.env.NODE_ENV === "development") {
    console.log("[GTM]", data);
    return;
  }
  sendGTMEvent(data);
}
