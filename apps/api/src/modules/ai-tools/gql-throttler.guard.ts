import { ExecutionContext, Injectable } from "@nestjs/common";
import { ThrottlerGuard } from "@nestjs/throttler";
import { getGraphqlContext } from "@/core/context/graphql-context.helper";

@Injectable()
export class GqlThrottlerGuard extends ThrottlerGuard {
  getRequestResponse(context: ExecutionContext): {
    req: Record<string, unknown>;
    res: Record<string, unknown>;
  } {
    const ctx = getGraphqlContext(context);
    return {
      req: ctx.req as unknown as Record<string, unknown>,
      res: ctx.res as Record<string, unknown>,
    };
  }
}
