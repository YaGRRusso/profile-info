import type { ExecutionContext } from "@nestjs/common";
import type { Reflector } from "@nestjs/core";
import { isGraphqlContext } from "@/core/context/graphql-context.helper";
import { PUBLIC_KEY } from "@/core/decorators/public.decorator";

export function shouldSkipGraphqlGuard(
  context: ExecutionContext,
  reflector: Reflector
): boolean {
  if (!isGraphqlContext(context)) return true;

  return reflector.getAllAndOverride<boolean>(PUBLIC_KEY, [
    context.getHandler(),
    context.getClass(),
  ]);
}

export function getRouteMetadata<T>(
  reflector: Reflector,
  context: ExecutionContext,
  key: string
): T | undefined {
  return reflector.getAllAndOverride<T>(key, [
    context.getHandler(),
    context.getClass(),
  ]);
}
