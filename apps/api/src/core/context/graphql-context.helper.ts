import type { ExecutionContext } from "@nestjs/common";
import { GqlExecutionContext } from "@nestjs/graphql";
import type { GraphqlContext } from "./graphql-context.interface";

export function isGraphqlContext(context: ExecutionContext): boolean {
  return context.getType<string>() === "graphql";
}

export function getGraphqlContext(context: ExecutionContext): GraphqlContext {
  if (!isGraphqlContext(context)) {
    throw new Error("Context is not a GraphQL context");
  }

  return GqlExecutionContext.create(context).getContext<GraphqlContext>();
}

export function getGraphqlRequest(
  context: ExecutionContext
): GraphqlContext["req"] {
  return getGraphqlContext(context).req;
}

export function getGraphqlResponse(
  context: ExecutionContext
): GraphqlContext["res"] {
  return getGraphqlContext(context).res;
}
