export async function getAddressLngLat(
  address: string,
): Promise<{ latitude: string; longitude: string }> {
  const res = await fetch(
    `/proxy/kakao/geocode?address=${encodeURIComponent(address)}`,
  );
  if (!res.ok) {
    throw new Error("주소 변환 실패");
  }
  return res.json();
}
