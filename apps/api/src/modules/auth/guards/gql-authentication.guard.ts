import { ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AuthGuard } from "@nestjs/passport";
import { Observable } from "rxjs";
import { getGraphqlRequest } from "@/core/context/graphql-context.helper";
import type { GraphqlContext } from "@/core/context/graphql-context.interface";
import { API_TOKEN_STRATEGY } from "../strategies/api-token.strategy";
import { JWT_STRATEGY } from "../strategies/jwt.strategy";
import { shouldSkipGraphqlGuard } from "./gql-guard.helper";

const AUTH_STRATEGIES = [API_TOKEN_STRATEGY, JWT_STRATEGY];

@Injectable()
export class GqlAuthenticationGuard extends AuthGuard(AUTH_STRATEGIES) {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  canActivate(
    context: ExecutionContext
  ): boolean | Promise<boolean> | Observable<boolean> {
    if (shouldSkipGraphqlGuard(context, this.reflector)) return true;
    return super.canActivate(context);
  }

  getRequest(context: ExecutionContext): GraphqlContext["req"] {
    return getGraphqlRequest(context);
  }
}
