import { useInfiniteQuery } from "@tanstack/react-query";
import { graphql } from "@/generated/graphql";
import type {
  FilterSkillInput,
  FindManyActiveSkillsQuery,
  FindManyActiveSkillsQueryVariables,
  FindManySkillsQuery,
  FindManySkillsQueryVariables,
  SortSkillInput,
} from "@/generated/graphql/graphql";
import {
  paginatedNextPageParam,
  paginatedSelect,
  withPagination,
} from "@/hooks/custom/paginated-query";
import { execute } from "@/lib/execute";

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
        slug
        category
        disabled
        partition
        owner {
          id
          nickname
          name
          role
          email
          phone
          avatar
        }
        i18n {
          locale
          messages {
            title
          }
        }
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
        slug
        category
        disabled
        partition
        owner {
          id
          nickname
          name
          role
          email
          phone
          avatar
        }
        i18n {
          locale
          messages {
            title
          }
        }
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
    getNextPageParam:
      paginatedNextPageParam<FindManySkillsQuery>("findManySkills"),
    initialPageParam: 0,
    queryFn: ({ pageParam }) =>
      execute(
        findManySkills,
        withPagination<FindManySkillsQueryVariables>(
          "skillPagination",
          pageParam,
          variables
        )
      ),
    queryKey: ["findManySkills", variables],
    select: paginatedSelect<FindManySkillsQuery>("findManySkills"),
    ...options,
  });
}

export function useFindManyActiveSkills(
  variables?: { skillFilters?: FilterSkillInput; skillSort?: SortSkillInput },
  options?: { enabled?: boolean }
) {
  return useInfiniteQuery({
    getNextPageParam: paginatedNextPageParam<FindManyActiveSkillsQuery>(
      "findManyActiveSkills"
    ),
    initialPageParam: 0,
    queryFn: ({ pageParam }) =>
      execute(
        findManyActiveSkills,
        withPagination<FindManyActiveSkillsQueryVariables>(
          "skillPagination",
          pageParam,
          variables
        )
      ),
    queryKey: ["findManyActiveSkills", variables],
    select: paginatedSelect<FindManyActiveSkillsQuery>("findManyActiveSkills"),
    ...options,
  });
}
