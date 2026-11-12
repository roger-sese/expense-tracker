import { describe, expect, it } from 'vitest';
import { safeRedirect } from './safe-redirect';

describe('safeRedirect', () => {
  it('allows internal paths', () => {
    expect(safeRedirect('/expenses?page=2')).toBe('/expenses?page=2');
  });

  it.each([null, '', 'https://evil.com', '//evil.com', 'javascript:alert(1)'])('rejects %s', (next) => {
    expect(safeRedirect(next)).toBe('/dashboard');
  });
});
