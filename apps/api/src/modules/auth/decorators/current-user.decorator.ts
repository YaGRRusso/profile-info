import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { getGraphqlRequest } from "@/core/context/graphql-context.helper";

export const CurrentUser = createParamDecorator(
  (_: unknown, context: ExecutionContext) => getGraphqlRequest(context).user
);
