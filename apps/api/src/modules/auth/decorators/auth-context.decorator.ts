import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from "@nestjs/common";
import { GqlExecutionContext } from "@nestjs/graphql";
import { toSessionAuthContext } from "@/core/context/auth-context.helper";
import type { AuthContext } from "@/core/context/auth-context.interface";
import type { GraphqlContext } from "@/core/context/graphql-context.interface";

export const Auth = createParamDecorator(
  (_: unknown, context: ExecutionContext): AuthContext => {
    const ctx = GqlExecutionContext.create(context);
    const user = (ctx.getContext() as GraphqlContext).req.user;
    if (!user) {
      throw new UnauthorizedException();
    }

    return toSessionAuthContext(user);
  }
);
