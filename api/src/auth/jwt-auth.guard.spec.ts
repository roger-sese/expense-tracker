import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtAuthGuard } from './jwt-auth.guard';

const contextFor = (req: Record<string, unknown>) =>
  ({ switchToHttp: () => ({ getRequest: () => req }) }) as unknown as ExecutionContext;

describe('JwtAuthGuard', () => {
  const jwt = new JwtService({ secret: 'test-secret' });
  const guard = new JwtAuthGuard(jwt);

  it('rejects requests without a bearer token', async () => {
    await expect(guard.canActivate(contextFor({ headers: {} }))).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('rejects an invalid token', async () => {
    const req = { headers: { authorization: 'Bearer not-a-jwt' } };
    await expect(guard.canActivate(contextFor(req))).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('attaches the user for a valid token', async () => {
    const token = await jwt.signAsync({ sub: 7, email: 'a@b.co' });
    const req: Record<string, unknown> = { headers: { authorization: `Bearer ${token}` } };
    await expect(guard.canActivate(contextFor(req))).resolves.toBe(true);
    expect(req.user).toEqual({ id: 7, email: 'a@b.co' });
  });
});
