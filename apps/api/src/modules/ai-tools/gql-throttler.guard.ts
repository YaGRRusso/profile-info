import { ExecutionContext, Injectable } from "@nestjs/common";
import { ThrottlerGuard } from "@nestjs/throttler";
import { getGraphqlContext } from "@/core/context/graphql-context.helper";
import {
  AppRequest,
  AppResponse,
} from "@/core/context/graphql-context.interface";

@Injectable()
export class GqlThrottlerGuard extends ThrottlerGuard {
  getRequestResponse(context: ExecutionContext): {
    req: AppRequest;
    res: AppResponse;
  } {
    const ctx = getGraphqlContext(context);
    return {
      req: ctx.req,
      res: ctx.res,
    };
  }

  protected getTracker(req: AppRequest): Promise<string> {
    return Promise.resolve(req.user?.id ?? req.ip ?? "anonymous");
  }
}
