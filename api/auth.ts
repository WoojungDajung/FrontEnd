// 토큰 재발급
export async function reissueToken(
  accessToken: string,
  refreshToken: string,
): Promise<string> {
  const url = `${process.env.NEXT_PUBLIC_SERVER_URL}/auth/reissue?refreshToken=${refreshToken}`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const resBody = await res.json();
  const { status_code, message } = resBody;

  if (!res.ok || status_code !== 200) {
    if (status_code === 403) {
      // Refresh Token 만료 또는 유효하지 않음
      // 로그아웃과 같은 기능이 수행됨
    }
    throw new Error(`${status_code}: ${message}`);
  }

  const newAccessToken = resBody.data as string;
  return newAccessToken;
}

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
