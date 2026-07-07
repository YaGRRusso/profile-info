import type { PersistenceScope } from "../types/scope.type";

export function noopScope(): PersistenceScope {
  return {
    query: {
      forRead: (filter) => filter,
      forMutate: (filter) => filter,
      forAggregate: (filter) => filter,
    },
    document: {
      forCreate: (payload) => payload,
      forUpdate: (payload) => payload,
    },
  };
}
