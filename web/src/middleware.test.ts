// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { NextRequest } from 'next/server';
import { middleware } from './middleware';
import { TOKEN_COOKIE } from './lib/token-storage';

const request = (path: string, token?: string) => {
  const req = new NextRequest(new URL(path, 'http://localhost:3000'));
  if (token) req.cookies.set(TOKEN_COOKIE, token);
  return req;
};

describe('route middleware', () => {
  it('redirects signed-out users to login and remembers the target', () => {
    const res = middleware(request('/expenses?page=2'));
    const location = new URL(res.headers.get('location')!);
    expect(location.pathname).toBe('/login');
    expect(location.searchParams.get('next')).toBe('/expenses?page=2');
  });

  it('lets signed-in users through to protected pages', () => {
    expect(middleware(request('/dashboard', 'jwt')).headers.get('location')).toBeNull();
  });

  it('sends signed-in users away from the login page', () => {
    const res = middleware(request('/login', 'jwt'));
    expect(new URL(res.headers.get('location')!).pathname).toBe('/dashboard');
  });
});
