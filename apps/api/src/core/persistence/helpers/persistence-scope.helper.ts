import type { PersistenceScope } from "../types/scope.type";

export function noopScope(): PersistenceScope {
  return {
    document: {
      forCreate: (payload) => payload,
      forUpdate: (payload) => payload,
    },
    query: {
      forAggregate: (filter) => filter,
      forMutate: (filter) => filter,
      forRead: (filter) => filter,
    },
  };
}
