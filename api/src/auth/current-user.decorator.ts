import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthenticatedRequest } from './jwt-auth.guard';

/** Injects the authenticated user's id into a route handler parameter. */
export const CurrentUserId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): number =>
    ctx.switchToHttp().getRequest<AuthenticatedRequest>().user.id,
);
