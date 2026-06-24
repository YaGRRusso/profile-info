import { useInfiniteQuery } from "@tanstack/react-query";
import { graphql } from "@/generated/graphql";
import type {
  FilterApiTokenInput,
  FindManyApiTokensQuery,
  SortApiTokenInput,
} from "@/generated/graphql/graphql";
import { execute } from "@/lib/execute";

const PAGE_SIZE = 50;

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
      execute(findManyApiTokens, {
        ...variables,
        apiTokenPagination: { skip: pageParam, limit: PAGE_SIZE },
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const totalFetched = allPages.reduce(
        (sum, page) => sum + page.findManyApiTokens.nodes.length,
        0
      );
      return totalFetched < lastPage.findManyApiTokens.found
        ? totalFetched
        : undefined;
    },
    select: (data) => ({
      found: data.pages[0]?.findManyApiTokens.found ?? 0,
      nodes: data.pages.flatMap((page) => page.findManyApiTokens.nodes),
    }),
    ...options,
  });
}
