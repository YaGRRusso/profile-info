import { useInfiniteQuery } from "@tanstack/react-query";
import { graphql } from "@/generated/graphql";
import type {
  FilterExperienceInput,
  FindManyExperiencesQuery,
  FindManyExperiencesQueryVariables,
  SortExperienceInput,
} from "@/generated/graphql/graphql";
import {
  paginatedNextPageParam,
  paginatedSelect,
  withPagination,
} from "@/hooks/custom/paginated-query";
import { execute } from "@/lib/execute";

export type ExperienceRow =
  FindManyExperiencesQuery["findManyExperiences"]["nodes"][number];

const findManyExperiences = graphql(`
  query FindManyExperiences(
    $experienceFilters: FilterExperienceInput
    $experiencePagination: PaginationInput
    $experienceSort: SortExperienceInput
  ) {
    findManyExperiences(
      experienceFilters: $experienceFilters
      experiencePagination: $experiencePagination
      experienceSort: $experienceSort
    ) {
      found
      nodes {
        id
        slug
        category
        relevance
        owner {
          id
          nickname
          name
          role
          email
          phone
          avatar
        }
        organization {
          id
          name
          slug
        }
        roles {
          i18n {
            locale
            messages {
              title
              description
            }
          }
          period {
            from
            to
          }
          skills {
            id
            name
          }
        }
        createdAt
        updatedAt
      }
    }
  }
`);

export function useFindManyExperiences(
  variables?: {
    experienceFilters?: FilterExperienceInput;
    experienceSort?: SortExperienceInput;
  },
  options?: { enabled?: boolean }
) {
  return useInfiniteQuery({
    queryKey: ["findManyExperiences", variables],
    queryFn: ({ pageParam }) =>
      execute(
        findManyExperiences,
        withPagination<FindManyExperiencesQueryVariables>(
          "experiencePagination",
          pageParam,
          variables
        )
      ),
    initialPageParam: 0,
    getNextPageParam: paginatedNextPageParam<FindManyExperiencesQuery>(
      "findManyExperiences"
    ),
    select: paginatedSelect<FindManyExperiencesQuery>("findManyExperiences"),
    ...options,
  });
}
