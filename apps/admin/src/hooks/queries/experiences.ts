import { useInfiniteQuery } from "@tanstack/react-query";
import { graphql } from "@/generated/graphql";
import type {
  FilterExperienceInput,
  FindManyExperiencesQuery,
  SortExperienceInput,
} from "@/generated/graphql/graphql";
import { execute } from "@/lib/execute";

const PAGE_SIZE = 50;

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
      execute(findManyExperiences, {
        ...variables,
        experiencePagination: { skip: pageParam, limit: PAGE_SIZE },
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const totalFetched = allPages.reduce(
        (sum, p) => sum + p.findManyExperiences.nodes.length,
        0
      );
      return totalFetched < lastPage.findManyExperiences.found
        ? totalFetched
        : undefined;
    },
    select: (data) => ({
      found: data.pages[0]?.findManyExperiences.found ?? 0,
      nodes: data.pages.flatMap((p) => p.findManyExperiences.nodes),
    }),
    ...options,
  });
}
