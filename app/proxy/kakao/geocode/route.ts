export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const address = searchParams.get("address");

  if (!address) {
    return Response.json({ message: "address가 필요합니다." }, { status: 400 });
  }

  const res = await fetch(
    `https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(
      address,
    )}`,
    {
      headers: {
        Authorization: `KakaoAK ${process.env.NEXT_PUBLIC_KAKAO_REST_API_KEY}`,
      },
    },
  );

  const data = await res.json();

  if (!res.ok) {
    return Response.json(data, { status: res.status });
  }

  const { documents } = data;

  if (!documents?.length) {
    return Response.json({ message: "검색 결과 없음" }, { status: 404 });
  }

  return Response.json({
    longitude: documents[0].x,
    latitude: documents[0].y,
  });
}
