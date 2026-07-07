/** biome-ignore-all lint/suspicious/noMisplacedAssertion: shared test assertion helper */

import {
  catalogPersistenceScope,
  tenantPersistenceScope,
} from "@/core/context/auth-context.helper";
import type { AuthContext } from "@/core/context/auth-context.interface";

export function expectCrudScopedToTenant(
  scoped: jest.Mock,
  ctx: AuthContext
): void {
  const expected = tenantPersistenceScope(ctx);
  const received = scoped.mock.calls[0]?.[0];

  expect(received?.query.forRead({})).toEqual(expected.query.forRead({}));
}

export function expectCrudScopedToCatalog(
  scoped: jest.Mock,
  ctx: AuthContext
): void {
  const expected = catalogPersistenceScope(ctx);
  const received = scoped.mock.calls[0]?.[0];

  expect(received?.query.forRead({})).toEqual(expected.query.forRead({}));
}
