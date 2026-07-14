import type { ExecutionContext } from "@nestjs/common";
import { GqlExecutionContext } from "@nestjs/graphql";
import {
  getGraphqlContext,
  getGraphqlRequest,
  isGraphqlContext,
} from "./graphql-context.helper";
import type { GraphqlContext } from "./graphql-context.interface";

describe("isGraphqlContext", () => {
  it("returns true for graphql execution contexts", () => {
    const context = { getType: () => "graphql" } as ExecutionContext;

    expect(isGraphqlContext(context)).toBe(true);
  });

  it("returns false for non-graphql execution contexts", () => {
    const context = { getType: () => "http" } as ExecutionContext;

    expect(isGraphqlContext(context)).toBe(false);
  });
});

describe("getGraphqlContext", () => {
  const graphqlContext: GraphqlContext = {
    loaders: {} as GraphqlContext["loaders"],
    req: { user: { id: "user-1" } } as GraphqlContext["req"],
    res: {},
  };

  beforeEach(() => {
    jest.spyOn(GqlExecutionContext, "create").mockImplementation(
      (context: ExecutionContext) =>
        ({
          getContext: () =>
            (
              context as unknown as { getContext: () => GraphqlContext }
            ).getContext(),
        }) as GqlExecutionContext
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("throws when the execution context is not graphql", () => {
    const context = { getType: () => "http" } as ExecutionContext;

    expect(() => getGraphqlContext(context)).toThrow(
      "Context is not a GraphQL context"
    );
  });

  it("returns the GraphQL context for graphql execution contexts", () => {
    const context = {
      getContext: () => graphqlContext,
      getType: () => "graphql",
    } as unknown as ExecutionContext;

    expect(getGraphqlContext(context)).toBe(graphqlContext);
  });
});

describe("getGraphqlRequest", () => {
  const req = { user: { id: "user-1" } } as GraphqlContext["req"];

  beforeEach(() => {
    jest.spyOn(GqlExecutionContext, "create").mockImplementation(
      (context: ExecutionContext) =>
        ({
          getContext: () =>
            (
              context as unknown as { getContext: () => GraphqlContext }
            ).getContext(),
        }) as GqlExecutionContext
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("returns req from the GraphQL context", () => {
    const context = {
      getContext: () =>
        ({
          loaders: {} as GraphqlContext["loaders"],
          req,
          res: {},
        }) satisfies GraphqlContext,
      getType: () => "graphql",
    } as unknown as ExecutionContext;

    expect(getGraphqlRequest(context)).toBe(req);
  });
});
