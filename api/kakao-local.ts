export async function getAddressLngLat(
  address: string,
): Promise<{ longitude: string; latitude: string }> {
  const format: "json" | "xml" = "json";
  const searchParams = new URLSearchParams({
    query: address,
  });
  const headers = new Headers({
    Authorization: `KakaoAK ${process.env.NEXT_KAKAO_REST_API_KEY}`,
  });

  const res = await fetch(
    `https://dapi.kakao.com/v2/local/search/address.${format}?${searchParams.toString()}`,
    {
      method: "GET",
      headers,
    },
  );

  const resBody = await res.json();
  console.log(resBody);

  if (!res.ok) {
    const { errorType, message } = resBody;
    throw new Error(`주소 변환 실패: ${message} (${errorType})`);
  }

  const { documents } = resBody;
  if (documents.length === 0) {
    throw new Error("검색 결과 없음");
  }

  const document = documents[0];
  return {
    longitude: document.x,
    latitude: document.y,
  };
}
