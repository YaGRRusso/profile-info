import type { UseQueryOptions } from "@tanstack/react-query";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { graphql } from "@/graphql";
import type {
  FilterOrganizationInput,
  FindManyOrganizationByIdQuery,
  FindManyOrganizationByIdQueryVariables,
  FindManyOrganizationsQuery,
  FindOneOrganizationByIdQuery,
  FindOneOrganizationByIdQueryVariables,
  FindOneOrganizationQuery,
  SortOrganizationInput,
} from "@/graphql/graphql";
import { execute } from "@/lib/execute";

const PAGE_SIZE = 50;

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
        relevance
        createdAt
        updatedAt
      }
    }
  }
`);

const findOneOrganizationById = graphql(`
  query FindOneOrganizationById($organizationId: ID!) {
    findOneOrganizationById(organizationId: $organizationId) {
      id
      name
      slug
      category
      logo
      website
      relevance
      createdAt
      updatedAt
    }
  }
`);

const findOneOrganization = graphql(`
  query FindOneOrganization($organizationFilters: FilterOrganizationInput) {
    findOneOrganization(organizationFilters: $organizationFilters) {
      id
      name
      slug
      category
      logo
      website
      relevance
      createdAt
      updatedAt
    }
  }
`);

const findManyOrganizationById = graphql(`
  query FindManyOrganizationById($organizationIds: [ID!]!) {
    findManyOrganizationById(organizationIds: $organizationIds) {
      id
      name
      slug
      category
      logo
      website
      relevance
      createdAt
      updatedAt
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

export function useFindOneOrganizationById(
  variables: FindOneOrganizationByIdQueryVariables,
  options?: Omit<
    UseQueryOptions<FindOneOrganizationByIdQuery>,
    "queryKey" | "queryFn"
  >
) {
  return useQuery({
    queryKey: ["findOneOrganizationById", variables],
    queryFn: () => execute(findOneOrganizationById, variables),
    ...options,
  });
}

export function useFindOneOrganization(
  variables: { organizationFilters?: FilterOrganizationInput },
  options?: Omit<
    UseQueryOptions<FindOneOrganizationQuery>,
    "queryKey" | "queryFn"
  >
) {
  return useQuery({
    queryKey: ["findOneOrganization", variables],
    queryFn: () => execute(findOneOrganization, variables),
    ...options,
  });
}

export function useFindManyOrganizationById(
  variables: FindManyOrganizationByIdQueryVariables,
  options?: Omit<
    UseQueryOptions<FindManyOrganizationByIdQuery>,
    "queryKey" | "queryFn"
  >
) {
  return useQuery({
    queryKey: ["findManyOrganizationById", variables],
    queryFn: () => execute(findManyOrganizationById, variables),
    ...options,
  });
}
