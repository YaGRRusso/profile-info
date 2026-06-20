import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { GqlExecutionContext } from "@nestjs/graphql";
import type { GraphqlContext } from "@/core/context/graphql-context.interface";
import { toRequestContext } from "@/core/context/request-context.helper";
import type { RequestContext } from "@/core/context/request-context.interface";
import type { UserModel } from "@/modules/users/schemas/user.schema";

export const CurrentRequestContext = createParamDecorator(
  (_: unknown, context: ExecutionContext): RequestContext => {
    const ctx = GqlExecutionContext.create(context);
    const user = (ctx.getContext() as GraphqlContext).req.user as UserModel;

    return toRequestContext(user);
  }
);
