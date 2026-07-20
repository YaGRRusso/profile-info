import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from "@nestjs/common";
import type { AuthContext } from "@/core/context/auth-context.interface";
import { getGraphqlRequest } from "@/core/context/graphql-context.helper";
import { i18nKey } from "@/core/i18n/i18n";

export const Auth = createParamDecorator(
  (_: unknown, context: ExecutionContext): AuthContext => {
    const { user } = getGraphqlRequest(context);
    if (!user) {
      throw new UnauthorizedException(i18nKey("auth.UNAUTHORIZED"));
    }

    return user;
  }
);
