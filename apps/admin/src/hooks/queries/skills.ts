import type { UseQueryOptions } from "@tanstack/react-query";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { graphql } from "@/graphql";
import type {
  FilterSkillInput,
  FindManySkillByIdQuery,
  FindManySkillByIdQueryVariables,
  FindOneSkillByIdQuery,
  FindOneSkillByIdQueryVariables,
  FindOneSkillQuery,
  SortSkillInput,
} from "@/graphql/graphql";
import { execute } from "@/lib/execute";

const PAGE_SIZE = 50;

const findManySkills = graphql(`
  query FindManySkills(
    $SkillFilters: FilterSkillInput
    $SkillPagination: PaginationInput
    $SkillSort: SortSkillInput
  ) {
    findManySkills(
      SkillFilters: $SkillFilters
      SkillPagination: $SkillPagination
      SkillSort: $SkillSort
    ) {
      found
      nodes {
        id
        name
        slug
        category
        relevance
        createdAt
        updatedAt
      }
    }
  }
`);

const findOneSkillById = graphql(`
  query FindOneSkillById($SkillId: ID!) {
    findOneSkillById(SkillId: $SkillId) {
      id
      name
      slug
      category
      relevance
      createdAt
      updatedAt
    }
  }
`);

const findOneSkill = graphql(`
  query FindOneSkill($SkillFilters: FilterSkillInput) {
    findOneSkill(SkillFilters: $SkillFilters) {
      id
      name
      slug
      category
      relevance
      createdAt
      updatedAt
    }
  }
`);

const findManySkillById = graphql(`
  query FindManySkillById($SkillIds: [ID!]!) {
    findManySkillById(SkillIds: $SkillIds) {
      id
      name
      slug
      category
      relevance
      createdAt
      updatedAt
    }
  }
`);

export function useFindManySkills(
  variables?: { SkillFilters?: FilterSkillInput; SkillSort?: SortSkillInput },
  options?: { enabled?: boolean }
) {
  return useInfiniteQuery({
    queryKey: ["findManySkills", variables],
    queryFn: ({ pageParam }) =>
      execute(findManySkills, {
        ...variables,
        SkillPagination: { skip: pageParam, limit: PAGE_SIZE },
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const totalFetched = allPages.reduce(
        (sum, p) => sum + p.findManySkills.nodes.length,
        0
      );
      return totalFetched < lastPage.findManySkills.found
        ? totalFetched
        : undefined;
    },
    select: (data) => ({
      found: data.pages[0]?.findManySkills.found ?? 0,
      nodes: data.pages.flatMap((p) => p.findManySkills.nodes),
    }),
    ...options,
  });
}

export function useFindOneSkillById(
  variables: FindOneSkillByIdQueryVariables,
  options?: Omit<UseQueryOptions<FindOneSkillByIdQuery>, "queryKey" | "queryFn">
) {
  return useQuery({
    queryKey: ["findOneSkillById", variables],
    queryFn: () => execute(findOneSkillById, variables),
    ...options,
  });
}

export function useFindOneSkill(
  variables: { SkillFilters?: FilterSkillInput },
  options?: Omit<UseQueryOptions<FindOneSkillQuery>, "queryKey" | "queryFn">
) {
  return useQuery({
    queryKey: ["findOneSkill", variables],
    queryFn: () => execute(findOneSkill, variables),
    ...options,
  });
}

export function useFindManySkillById(
  variables: FindManySkillByIdQueryVariables,
  options?: Omit<
    UseQueryOptions<FindManySkillByIdQuery>,
    "queryKey" | "queryFn"
  >
) {
  return useQuery({
    queryKey: ["findManySkillById", variables],
    queryFn: () => execute(findManySkillById, variables),
    ...options,
  });
}
