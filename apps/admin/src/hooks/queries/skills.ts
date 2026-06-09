import type { UseQueryOptions } from "@tanstack/react-query";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { graphql } from "@/generated/graphql";
import type {
  FilterSkillInput,
  FindManySkillByIdQuery,
  FindManySkillByIdQueryVariables,
  FindManySkillsQuery,
  FindOneSkillByIdQuery,
  FindOneSkillByIdQueryVariables,
  FindOneSkillQuery,
  SortSkillInput,
} from "@/generated/graphql/graphql";
import { execute } from "@/lib/execute";

const PAGE_SIZE = 50;

export type SkillRow = FindManySkillsQuery["findManySkills"]["nodes"][number];

const findManySkills = graphql(`
  query FindManySkills(
    $skillFilters: FilterSkillInput
    $skillPagination: PaginationInput
    $skillSort: SortSkillInput
  ) {
    findManySkills(
      skillFilters: $skillFilters
      skillPagination: $skillPagination
      skillSort: $skillSort
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
  query FindOneSkillById($skillId: ID!) {
    findOneSkillById(skillId: $skillId) {
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
  query FindOneSkill($skillFilters: FilterSkillInput) {
    findOneSkill(skillFilters: $skillFilters) {
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
  query FindManySkillById($skillIds: [ID!]!) {
    findManySkillById(skillIds: $skillIds) {
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
  variables?: { skillFilters?: FilterSkillInput; skillSort?: SortSkillInput },
  options?: { enabled?: boolean }
) {
  return useInfiniteQuery({
    queryKey: ["findManySkills", variables],
    queryFn: ({ pageParam }) =>
      execute(findManySkills, {
        ...variables,
        skillPagination: { skip: pageParam, limit: PAGE_SIZE },
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
  variables: { skillFilters?: FilterSkillInput },
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
