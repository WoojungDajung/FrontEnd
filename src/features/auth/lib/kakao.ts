export function getAuthorizationUrl(returnTo?: string) {
  const params = new URLSearchParams({
    client_id: `${process.env.NEXT_PUBLIC_KAKAO_REST_API_KEY}`,
    redirect_uri: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback/kakao`,
    response_type: "code",
  });

  if (returnTo) {
    params.set("state", returnTo);
  }

  return `https://kauth.kakao.com/oauth/authorize?${params.toString()}`;
}
