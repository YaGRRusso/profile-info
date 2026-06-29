import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import {
  getGraphqlRequest,
  isGraphqlContext,
} from "@/core/context/graphql-context.helper";
import { PUBLIC_KEY } from "@/core/decorators/public.decorator";
import { ROLES_KEY } from "@/core/decorators/roles.decorator";
import { UserRole } from "@/core/enums/user-role.enum";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    if (!isGraphqlContext(context)) return true;

    if (
      this.reflector.getAllAndOverride<boolean>(PUBLIC_KEY, [
        context.getHandler(),
        context.getClass(),
      ])
    ) {
      return true;
    }

    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()]
    );

    if (!requiredRoles?.length) return true;

    const user = getGraphqlRequest(context).user;

    if (!user?.role || !requiredRoles.includes(user.role)) {
      throw new ForbiddenException("Insufficient permissions");
    }

    return true;
  }
}
