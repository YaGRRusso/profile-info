import { type UseInfiniteQueryResult } from "@tanstack/react-query";
import { useEffect } from "react";

export function useQueryAllPages<TData, TError>(
  query: UseInfiniteQueryResult<TData, TError>,
  enabled = true
): UseInfiniteQueryResult<TData, TError> {
  const {
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    isSuccess,
  } = query;

  useEffect(() => {
    if (
      !enabled ||
      !isSuccess ||
      !hasNextPage ||
      isFetchingNextPage ||
      isFetching
    ) {
      return;
    }

    fetchNextPage();
  }, [
    enabled,
    isSuccess,
    hasNextPage,
    isFetchingNextPage,
    isFetching,
    fetchNextPage,
  ]);

  return query;
}
