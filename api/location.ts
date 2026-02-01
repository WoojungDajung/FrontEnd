export async function registerLocation(
  appointmentId: string,
  placeName: string,
  address: string,
  latitude: string,
  longitude: string,
) {
  const url = `${process.env.NEXT_PUBLIC_BASE_URL}/auth-api/location/${appointmentId}`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      name: placeName,
      address,
      latitude,
      longitude,
    }),
  });

  const resBody = await res.json();
  console.log(resBody);

  if (!res.ok) {
    const { status_code, message } = resBody;
    throw new Error(`${status_code}: ${message}`);
  }

  return;
}
