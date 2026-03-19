// 로그아웃
export async function logout(refreshToken: string): Promise<void> {
  const url = `${process.env.NEXT_PUBLIC_SERVER_URL}/auth/logout?refreshToken=${refreshToken}`;
  const res = await fetch(url, {
    method: "POST",
  });

  const resBody = await res.json();
  const { status_code, message } = resBody;

  if (!res.ok || status_code !== 200) {
    if (status_code === 400) {
      // Refresh Token 존재하지 않음
    }
    throw new Error(`${status_code}: ${message}`);
  }
  return;
}
