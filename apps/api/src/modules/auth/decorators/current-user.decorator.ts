import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { GqlExecutionContext } from "@nestjs/graphql";
import type { GraphqlContext } from "@/core/context/graphql-context.interface";

export const CurrentUser = createParamDecorator(
  (_: unknown, context: ExecutionContext) => {
    const ctx = GqlExecutionContext.create(context);
    return (ctx.getContext() as GraphqlContext).req.user;
  }
);
