// auth/guards/permissions.guard.ts
import {
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Injectable,
  } from '@nestjs/common';
  import { Reflector } from '@nestjs/core';
  import { PERMISSIONS_KEY } from 'src/common/decoraters/permissions.decorator';
  
  @Injectable()
  export class PermissionsGuard implements CanActivate {
    constructor(private reflector: Reflector) {}
  
    canActivate(context: ExecutionContext): boolean {
      const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
        PERMISSIONS_KEY,
        [context.getHandler(), context.getClass()],
      );
  
      if (!requiredPermissions || requiredPermissions.length === 0) return true;
  
      const { user } = context.switchToHttp().getRequest();
      const userPermissions = user?.permissions || [];
  
      const hasPermission = requiredPermissions.every((permission) =>
        userPermissions.includes(permission),
      );
  
      if (!hasPermission) throw new ForbiddenException('Permission denied');
      return true;
    }
  }
  
