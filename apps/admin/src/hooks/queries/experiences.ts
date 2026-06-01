import type { UseQueryOptions } from "@tanstack/react-query";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { graphql } from "@/graphql";
import type {
  FilterExperienceInput,
  FindManyExperienceByIdQuery,
  FindManyExperienceByIdQueryVariables,
  FindManyExperiencesQuery,
  FindOneExperienceByIdQuery,
  FindOneExperienceByIdQueryVariables,
  FindOneExperienceQuery,
  SortExperienceInput,
} from "@/graphql/graphql";
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

const findOneExperienceById = graphql(`
  query FindOneExperienceById($experienceId: ID!) {
    findOneExperienceById(experienceId: $experienceId) {
      id
      slug
      category
      relevance
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
`);

const findOneExperience = graphql(`
  query FindOneExperience($experienceFilters: FilterExperienceInput) {
    findOneExperience(experienceFilters: $experienceFilters) {
      id
      slug
      category
      relevance
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
`);

const findManyExperienceById = graphql(`
  query FindManyExperienceById($experienceIds: [ID!]!) {
    findManyExperienceById(experienceIds: $experienceIds) {
      id
      slug
      category
      relevance
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

export function useFindOneExperienceById(
  variables: FindOneExperienceByIdQueryVariables,
  options?: Omit<
    UseQueryOptions<FindOneExperienceByIdQuery>,
    "queryKey" | "queryFn"
  >
) {
  return useQuery({
    queryKey: ["findOneExperienceById", variables],
    queryFn: () => execute(findOneExperienceById, variables),
    ...options,
  });
}

export function useFindOneExperience(
  variables: { experienceFilters?: FilterExperienceInput },
  options?: Omit<
    UseQueryOptions<FindOneExperienceQuery>,
    "queryKey" | "queryFn"
  >
) {
  return useQuery({
    queryKey: ["findOneExperience", variables],
    queryFn: () => execute(findOneExperience, variables),
    ...options,
  });
}

export function useFindManyExperienceById(
  variables: FindManyExperienceByIdQueryVariables,
  options?: Omit<
    UseQueryOptions<FindManyExperienceByIdQuery>,
    "queryKey" | "queryFn"
  >
) {
  return useQuery({
    queryKey: ["findManyExperienceById", variables],
    queryFn: () => execute(findManyExperienceById, variables),
    ...options,
  });
}
