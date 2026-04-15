import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { ADMIN_ROLE } from './auth.constants';

@Injectable()
export class AdminRoleGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user as { role?: string } | undefined;
    if (!user || user.role !== ADMIN_ROLE) {
      throw new ForbiddenException('Admin access required');
    }
    return true;
  }
}
