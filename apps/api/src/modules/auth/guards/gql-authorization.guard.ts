import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { GqlExecutionContext } from "@nestjs/graphql";
import { hasPermission, isApiToken } from "@/core/context/auth-context.helper";
import { getGraphqlRequest } from "@/core/context/graphql-context.helper";
import { ROLES_KEY } from "@/core/decorators/roles.decorator";
import { SESSION_ONLY_KEY } from "@/core/decorators/session-only.decorator";
import { ApiTokenPermission } from "@/core/enums/api-token-permission.enum";
import { UserRole } from "@/core/enums/user-role.enum";
import { i18nKey } from "@/core/i18n/i18n";
import { getRouteMetadata, shouldSkipGraphqlGuard } from "./gql-guard.helper";

@Injectable()
export class GqlAuthorizationGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    if (shouldSkipGraphqlGuard(context, this.reflector)) return true;

    const { user } = getGraphqlRequest(context);
    if (!user) return true;

    if (
      getRouteMetadata<boolean>(this.reflector, context, SESSION_ONLY_KEY) &&
      isApiToken(user)
    ) {
      throw new ForbiddenException(i18nKey("auth.SESSION_REQUIRED"));
    }

    if (isApiToken(user)) {
      const { operation } =
        GqlExecutionContext.create(context).getInfo().operation;
      const required =
        operation === "mutation"
          ? ApiTokenPermission.MUTATE
          : ApiTokenPermission.QUERY;

      if (!hasPermission(user, required)) {
        throw new ForbiddenException(
          i18nKey("auth.INSUFFICIENT_API_TOKEN_PERMISSIONS", {
            permission: required,
          })
        );
      }
    }

    const requiredRoles = getRouteMetadata<UserRole[]>(
      this.reflector,
      context,
      ROLES_KEY
    );

    if (
      requiredRoles?.length &&
      (!user.role || !requiredRoles.includes(user.role))
    ) {
      throw new ForbiddenException(
        i18nKey("auth.INSUFFICIENT_PERMISSIONS", {
          roles: requiredRoles.join(", "),
        })
      );
    }

    return true;
  }
}
