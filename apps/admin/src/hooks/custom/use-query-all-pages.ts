import { type UseInfiniteQueryResult } from "@tanstack/react-query";
import { useEffect } from "react";

export function useQueryAllPages<TData, TError>(
  query: UseInfiniteQueryResult<TData, TError>,
  enabled = true
): UseInfiniteQueryResult<TData, TError> {
  useEffect(() => {
    if (enabled && query.hasNextPage && !query.isFetchingNextPage)
      query.fetchNextPage();
  }, [
    enabled,
    query.hasNextPage,
    query.isFetchingNextPage,
    query.fetchNextPage,
  ]);

  return query;
}
