/**
 * The JWT is kept in a cookie (not httpOnly, since the SPA sends it as a bearer header)
 * so that Next.js middleware can also see it and redirect before a protected page renders.
 */
export const TOKEN_COOKIE = 'et_token';
const MAX_AGE_SECONDS = 60 * 60 * 24; // matches the API default JWT_EXPIRES_IN=1d

export function getToken(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.split('; ').find((c) => c.startsWith(`${TOKEN_COOKIE}=`));
  return match ? decodeURIComponent(match.slice(TOKEN_COOKIE.length + 1)) : null;
}

export function setToken(token: string): void {
  document.cookie = `${TOKEN_COOKIE}=${encodeURIComponent(token)}; Path=/; Max-Age=${MAX_AGE_SECONDS}; SameSite=Lax`;
}

export function clearToken(): void {
  document.cookie = `${TOKEN_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
}
