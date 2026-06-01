import type { UseQueryOptions } from "@tanstack/react-query";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { graphql } from "@/graphql";
import type {
  FilterEducationInput,
  FindManyEducationByIdQuery,
  FindManyEducationByIdQueryVariables,
  FindManyEducationsQuery,
  FindOneEducationByIdQuery,
  FindOneEducationByIdQueryVariables,
  FindOneEducationQuery,
  SortEducationInput,
} from "@/graphql/graphql";
import { execute } from "@/lib/execute";

const PAGE_SIZE = 50;

export type EducationRow =
  FindManyEducationsQuery["findManyEducations"]["nodes"][number];

const findManyEducations = graphql(`
  query FindManyEducations(
    $educationFilters: FilterEducationInput
    $educationPagination: PaginationInput
    $educationSort: SortEducationInput
  ) {
    findManyEducations(
      educationFilters: $educationFilters
      educationPagination: $educationPagination
      educationSort: $educationSort
    ) {
      found
      nodes {
        id
        slug
        level
        status
        relevance
        url
        image
        organization {
          id
          name
          slug
        }
        i18n {
          locale
          messages {
            title
            description
          }
        }
        createdAt
        updatedAt
      }
    }
  }
`);

const findOneEducationById = graphql(`
  query FindOneEducationById($educationId: ID!) {
    findOneEducationById(educationId: $educationId) {
      id
      slug
      level
      status
      relevance
      url
      image
      organization {
        id
        name
        slug
      }
      i18n {
        locale
        messages {
          title
          description
        }
      }
      createdAt
      updatedAt
    }
  }
`);

const findOneEducation = graphql(`
  query FindOneEducation($educationFilters: FilterEducationInput) {
    findOneEducation(educationFilters: $educationFilters) {
      id
      slug
      level
      status
      relevance
      url
      image
      organization {
        id
        name
        slug
      }
      i18n {
        locale
        messages {
          title
          description
        }
      }
      createdAt
      updatedAt
    }
  }
`);

const findManyEducationById = graphql(`
  query FindManyEducationById($educationIds: [ID!]!) {
    findManyEducationById(educationIds: $educationIds) {
      id
      slug
      level
      status
      relevance
      url
      image
      organization {
        id
        name
        slug
      }
      i18n {
        locale
        messages {
          title
          description
        }
      }
      createdAt
      updatedAt
    }
  }
`);

export function useFindManyEducations(
  variables?: {
    educationFilters?: FilterEducationInput;
    educationSort?: SortEducationInput;
  },
  options?: { enabled?: boolean }
) {
  return useInfiniteQuery({
    queryKey: ["findManyEducations", variables],
    queryFn: ({ pageParam }) =>
      execute(findManyEducations, {
        ...variables,
        educationPagination: { skip: pageParam, limit: PAGE_SIZE },
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const totalFetched = allPages.reduce(
        (sum, p) => sum + p.findManyEducations.nodes.length,
        0
      );
      return totalFetched < lastPage.findManyEducations.found
        ? totalFetched
        : undefined;
    },
    select: (data) => ({
      found: data.pages[0]?.findManyEducations.found ?? 0,
      nodes: data.pages.flatMap((p) => p.findManyEducations.nodes),
    }),
    ...options,
  });
}

export function useFindOneEducationById(
  variables: FindOneEducationByIdQueryVariables,
  options?: Omit<
    UseQueryOptions<FindOneEducationByIdQuery>,
    "queryKey" | "queryFn"
  >
) {
  return useQuery({
    queryKey: ["findOneEducationById", variables],
    queryFn: () => execute(findOneEducationById, variables),
    ...options,
  });
}

export function useFindOneEducation(
  variables: { educationFilters?: FilterEducationInput },
  options?: Omit<UseQueryOptions<FindOneEducationQuery>, "queryKey" | "queryFn">
) {
  return useQuery({
    queryKey: ["findOneEducation", variables],
    queryFn: () => execute(findOneEducation, variables),
    ...options,
  });
}

export function useFindManyEducationById(
  variables: FindManyEducationByIdQueryVariables,
  options?: Omit<
    UseQueryOptions<FindManyEducationByIdQuery>,
    "queryKey" | "queryFn"
  >
) {
  return useQuery({
    queryKey: ["findManyEducationById", variables],
    queryFn: () => execute(findManyEducationById, variables),
    ...options,
  });
}
