export {};

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Kakao: any; // t1.kakaocdn.net/kakao_js_sdk (공유 포함)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    kakao: any; // dapi.kakao.com/v2/maps/sdk.js
  }
}
