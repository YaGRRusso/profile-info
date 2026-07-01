import { useInfiniteQuery } from "@tanstack/react-query";
import { graphql } from "@/generated/graphql";
import type {
  FilterOrganizationInput,
  FindManyActiveOrganizationsQuery,
  FindManyActiveOrganizationsQueryVariables,
  FindManyOrganizationsQuery,
  FindManyOrganizationsQueryVariables,
  SortOrganizationInput,
} from "@/generated/graphql/graphql";
import {
  paginatedNextPageParam,
  paginatedSelect,
  withPagination,
} from "@/hooks/custom/paginated-query";
import { execute } from "@/lib/execute";

export type OrganizationRow =
  FindManyOrganizationsQuery["findManyOrganizations"]["nodes"][number];

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
        category
        logo
        website
        disabled
        i18n {
          locale
          messages {
            description
          }
        }
        relevance
        createdAt
        updatedAt
      }
    }
  }
`);

const findManyActiveOrganizations = graphql(`
  query FindManyActiveOrganizations(
    $organizationFilters: FilterOrganizationInput
    $organizationPagination: PaginationInput
    $organizationSort: SortOrganizationInput
  ) {
    findManyActiveOrganizations(
      organizationFilters: $organizationFilters
      organizationPagination: $organizationPagination
      organizationSort: $organizationSort
    ) {
      found
      nodes {
        id
        name
        slug
        category
        logo
        website
        disabled
        i18n {
          locale
          messages {
            description
          }
        }
        relevance
        createdAt
        updatedAt
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
      execute(
        findManyOrganizations,
        withPagination<FindManyOrganizationsQueryVariables>(
          "organizationPagination",
          pageParam,
          variables
        )
      ),
    initialPageParam: 0,
    getNextPageParam: paginatedNextPageParam<FindManyOrganizationsQuery>(
      "findManyOrganizations"
    ),
    select: paginatedSelect<FindManyOrganizationsQuery>(
      "findManyOrganizations"
    ),
    ...options,
  });
}

export function useFindManyActiveOrganizations(
  variables?: {
    organizationFilters?: FilterOrganizationInput;
    organizationSort?: SortOrganizationInput;
  },
  options?: { enabled?: boolean }
) {
  return useInfiniteQuery({
    queryKey: ["findManyActiveOrganizations", variables],
    queryFn: ({ pageParam }) =>
      execute(
        findManyActiveOrganizations,
        withPagination<FindManyActiveOrganizationsQueryVariables>(
          "organizationPagination",
          pageParam,
          variables
        )
      ),
    initialPageParam: 0,
    getNextPageParam: paginatedNextPageParam<FindManyActiveOrganizationsQuery>(
      "findManyActiveOrganizations"
    ),
    select: paginatedSelect<FindManyActiveOrganizationsQuery>(
      "findManyActiveOrganizations"
    ),
    ...options,
  });
}
