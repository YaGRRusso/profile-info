import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from "@nestjs/common";
import { AUTH_UNAUTHORIZED } from "@/core/auth/auth.messages";
import type { AuthContext } from "@/core/context/auth-context.interface";
import { getGraphqlRequest } from "@/core/context/graphql-context.helper";

export const Auth = createParamDecorator(
  (_: unknown, context: ExecutionContext): AuthContext => {
    const { user } = getGraphqlRequest(context);
    if (!user) {
      throw new UnauthorizedException(AUTH_UNAUTHORIZED);
    }

    return user;
  }
);
