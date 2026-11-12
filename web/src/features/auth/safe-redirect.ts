/** Only allow same-origin relative paths as post-login redirects (prevents open redirects). */
export function safeRedirect(next: string | null | undefined, fallback = '/dashboard'): string {
  if (!next || !next.startsWith('/') || next.startsWith('//')) return fallback;
  return next;
}
