import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { GqlExecutionContext } from "@nestjs/graphql";
import type { GraphqlContext } from "@/core/context/graphql-context.interface";
import { PUBLIC_KEY } from "@/core/decorators/public-route.decorator";
import { ROLES_KEY } from "@/core/decorators/roles.decorator";
import { UserRole } from "@/core/enums/user-role.enum";
import { UserModel } from "@/modules/users/schemas/user.schema";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    if (context.getType<string>() !== "graphql") return true;

    const isPublic = this.reflector.getAllAndOverride<boolean>(PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) return true;

    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()]
    );

    if (!requiredRoles?.length) return true;

    const ctx = GqlExecutionContext.create(context);
    const user = (ctx.getContext() as GraphqlContext).req.user as
      | UserModel
      | undefined;

    if (!user?.role || !requiredRoles.includes(user.role)) {
      throw new ForbiddenException("Insufficient permissions");
    }

    return true;
  }
}
