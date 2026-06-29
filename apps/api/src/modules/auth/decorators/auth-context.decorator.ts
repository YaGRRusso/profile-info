import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from "@nestjs/common";
import { toSessionAuthContext } from "@/core/context/auth-context.helper";
import type { AuthContext } from "@/core/context/auth-context.interface";
import { getGraphqlRequest } from "@/core/context/graphql-context.helper";

export const Auth = createParamDecorator(
  (_: unknown, context: ExecutionContext): AuthContext => {
    const user = getGraphqlRequest(context).user;
    if (!user) {
      throw new UnauthorizedException();
    }

    return toSessionAuthContext(user);
  }
);
