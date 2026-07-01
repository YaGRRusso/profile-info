import { useInfiniteQuery } from "@tanstack/react-query";
import { graphql } from "@/generated/graphql";
import type {
  FilterSkillInput,
  FindManySkillsQuery,
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
        disabled
        createdAt
        updatedAt
      }
    }
  }
`);

const findManyActiveSkills = graphql(`
  query FindManyActiveSkills(
    $skillFilters: FilterSkillInput
    $skillPagination: PaginationInput
    $skillSort: SortSkillInput
  ) {
    findManyActiveSkills(
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
        disabled
        createdAt
        updatedAt
      }
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

export function useFindManyActiveSkills(
  variables?: { skillFilters?: FilterSkillInput; skillSort?: SortSkillInput },
  options?: { enabled?: boolean }
) {
  return useInfiniteQuery({
    queryKey: ["findManyActiveSkills", variables],
    queryFn: ({ pageParam }) =>
      execute(findManyActiveSkills, {
        ...variables,
        skillPagination: { skip: pageParam, limit: PAGE_SIZE },
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const totalFetched = allPages.reduce(
        (sum, p) => sum + p.findManyActiveSkills.nodes.length,
        0
      );
      return totalFetched < lastPage.findManyActiveSkills.found
        ? totalFetched
        : undefined;
    },
    select: (data) => ({
      found: data.pages[0]?.findManyActiveSkills.found ?? 0,
      nodes: data.pages.flatMap((p) => p.findManyActiveSkills.nodes),
    }),
    ...options,
  });
}
