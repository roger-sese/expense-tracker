import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { apiRequest, ApiError, API_URL, setUnauthorizedHandler } from './api-client';
import { clearToken, getToken, setToken } from './token-storage';

const jsonResponse = (status: number, body: unknown) =>
  new Response(body === undefined ? null : JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

describe('apiRequest', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock);
    clearToken();
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    fetchMock.mockReset();
    setUnauthorizedHandler(null);
  });

  it('sends the bearer token, JSON body and drops empty query params', async () => {
    setToken('abc');
    fetchMock.mockResolvedValue(jsonResponse(200, { ok: true }));

    await apiRequest('/expenses', { method: 'POST', body: { a: 1 }, query: { page: 2, search: '', categoryId: undefined } });

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(`${API_URL}/expenses?page=2`);
    expect(init.headers).toMatchObject({ Authorization: 'Bearer abc', 'Content-Type': 'application/json' });
    expect(init.body).toBe('{"a":1}');
  });

  it('joins NestJS validation messages into a single ApiError', async () => {
    fetchMock.mockResolvedValue(jsonResponse(400, { message: ['amount must be positive', 'date is invalid'] }));
    await expect(apiRequest('/expenses')).rejects.toMatchObject({
      status: 400,
      message: 'amount must be positive. date is invalid',
    });
  });

  it('clears the session and notifies on 401 when a token was sent', async () => {
    setToken('expired');
    const handler = vi.fn();
    setUnauthorizedHandler(handler);
    fetchMock.mockResolvedValue(jsonResponse(401, { message: 'Invalid or expired token' }));

    await expect(apiRequest('/auth/me')).rejects.toBeInstanceOf(ApiError);
    expect(handler).toHaveBeenCalledOnce();
    expect(getToken()).toBeNull();
  });

  it('reports a friendly error when the server is unreachable', async () => {
    fetchMock.mockRejectedValue(new TypeError('Failed to fetch'));
    await expect(apiRequest('/health')).rejects.toMatchObject({ status: 0, message: expect.stringMatching(/reach the server/) });
  });

  it('returns undefined for 204 responses', async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }));
    await expect(apiRequest('/expenses/1', { method: 'DELETE' })).resolves.toBeUndefined();
  });
});
