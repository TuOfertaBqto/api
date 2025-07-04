import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from 'src/user/entities/user.entity';
import { ROLES_KEY } from '../decorators/auth.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) return true;

    const request = context
      .switchToHttp()
      .getRequest<{ user?: { role?: UserRole } }>();
    const { user } = request;

    if (!user || !user.role || !requiredRoles.includes(user.role)) {
      throw new ForbiddenException('You do not have permission (roles)');
    }

    return true;
  }
}
