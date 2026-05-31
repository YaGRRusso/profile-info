import { useInfiniteQuery } from "@tanstack/react-query";
import { graphql } from "@/graphql";
import type {
  FilterOrganizationInput,
  SortOrganizationInput,
} from "@/graphql/graphql";
import { execute } from "@/lib/execute";

const PAGE_SIZE = 50;

const findManyOrganizations = graphql(`
  query FindManyOrganizations(
    $organizationFilters: FilterOrganizationInput
    $organizationPagination: PaginationInput
    $organizationSort: SortOrganizationInput
  ) {
    findManyOrganizations(
      organizationFilters: $organizationFilters
      organizationPagination: $organizationPagination
      organizationSort: $organizationSort
    ) {
      found
      nodes {
        id
        name
        slug
      }
    }
  }
`);

export function useFindManyOrganizations(
  variables?: {
    organizationFilters?: FilterOrganizationInput;
    organizationSort?: SortOrganizationInput;
  },
  options?: { enabled?: boolean }
) {
  return useInfiniteQuery({
    queryKey: ["findManyOrganizations", variables],
    queryFn: ({ pageParam }) =>
      execute(findManyOrganizations, {
        ...variables,
        organizationPagination: { skip: pageParam, limit: PAGE_SIZE },
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const totalFetched = allPages.reduce(
        (sum, p) => sum + p.findManyOrganizations.nodes.length,
        0
      );
      return totalFetched < lastPage.findManyOrganizations.found
        ? totalFetched
        : undefined;
    },
    select: (data) => ({
      found: data.pages[0]?.findManyOrganizations.found ?? 0,
      nodes: data.pages.flatMap((p) => p.findManyOrganizations.nodes),
    }),
    ...options,
  });
}
