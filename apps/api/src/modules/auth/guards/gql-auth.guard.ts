import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AuthGuard } from "@nestjs/passport";
import { Observable } from "rxjs";
import {
  getGraphqlRequest,
  isGraphqlContext,
} from "@/core/context/graphql-context.helper";
import type { GraphqlContext } from "@/core/context/graphql-context.interface";
import { PUBLIC_KEY } from "@/core/decorators/public.decorator";
import { JWT_STRATEGY } from "../auth.strategy";

@Injectable()
export class GqlAuthGuard extends AuthGuard(JWT_STRATEGY) {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  canActivate(
    context: ExecutionContext
  ): boolean | Promise<boolean> | Observable<boolean> {
    if (!isGraphqlContext(context)) return true;

    if (
      this.reflector.getAllAndOverride<boolean>(PUBLIC_KEY, [
        context.getHandler(),
        context.getClass(),
      ])
    ) {
      return true;
    }

    return super.canActivate(context);
  }

  getRequest(context: ExecutionContext): GraphqlContext["req"] {
    return getGraphqlRequest(context);
  }

  handleRequest<TUser>(err: Error | null, user: TUser): TUser {
    if (err || !user) {
      throw new UnauthorizedException();
    }

    return user;
  }
}
