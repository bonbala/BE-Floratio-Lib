// src/common/guards/permissions.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMS_KEY } from '../decorators/permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<string[]>(PERMS_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
    if (!required) return true;

    const { user } = ctx.switchToHttp().getRequest();

    // nếu đã có mảng permissions string, dùng luôn
    const userPerms: string[] = Array.isArray(user.permissions)
      ? user.permissions
      : // fallback: nếu permissions nằm trong role object
        ((user.role as any).permissions as any[]).map((p) => p.name);

    return required.every((p) => userPerms.includes(p));
  }
}
