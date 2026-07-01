import { useInfiniteQuery } from "@tanstack/react-query";
import { graphql } from "@/generated/graphql";
import type {
  FilterApiTokenInput,
  FindManyApiTokensQuery,
  FindManyApiTokensQueryVariables,
  SortApiTokenInput,
} from "@/generated/graphql/graphql";
import {
  paginatedNextPageParam,
  paginatedSelect,
  withPagination,
} from "@/hooks/custom/paginated-query";
import { execute } from "@/lib/execute";

export type ApiTokenRow =
  FindManyApiTokensQuery["findManyApiTokens"]["nodes"][number];

const findManyApiTokens = graphql(`
  query FindManyApiTokens(
    $apiTokenFilters: FilterApiTokenInput
    $apiTokenPagination: PaginationInput
    $apiTokenSort: SortApiTokenInput
  ) {
    findManyApiTokens(
      apiTokenFilters: $apiTokenFilters
      apiTokenPagination: $apiTokenPagination
      apiTokenSort: $apiTokenSort
    ) {
      found
      nodes {
        id
        ownerId
        name
        permissions
        expiresAt
        createdAt
        updatedAt
      }
    }
  }
`);

export function useFindManyApiTokens(
  variables?: {
    apiTokenFilters?: FilterApiTokenInput;
    apiTokenSort?: SortApiTokenInput;
  },
  options?: { enabled?: boolean }
) {
  return useInfiniteQuery({
    queryKey: ["findManyApiTokens", variables],
    queryFn: ({ pageParam }) =>
      execute(
        findManyApiTokens,
        withPagination<FindManyApiTokensQueryVariables>(
          "apiTokenPagination",
          pageParam,
          variables
        )
      ),
    initialPageParam: 0,
    getNextPageParam:
      paginatedNextPageParam<FindManyApiTokensQuery>("findManyApiTokens"),
    select: paginatedSelect<FindManyApiTokensQuery>("findManyApiTokens"),
    ...options,
  });
}
