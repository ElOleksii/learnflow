import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import { JwtPayload } from '../types';
import { Request } from 'express';

interface RequestWithUser extends Request {
  user?: JwtPayload;
}

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();

    return request.user;
  },
);
