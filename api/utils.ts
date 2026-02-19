export function buildAuthUrl(url: string) {
  return `${process.env.NEXT_PUBLIC_BASE_URL}/proxy/auth-api${url}`;
}
