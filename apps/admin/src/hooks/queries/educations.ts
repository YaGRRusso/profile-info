import { useInfiniteQuery } from "@tanstack/react-query";
import { graphql } from "@/generated/graphql";
import type {
  FilterEducationInput,
  FindManyEducationsQuery,
  FindManyEducationsQueryVariables,
  SortEducationInput,
} from "@/generated/graphql/graphql";
import {
  paginatedNextPageParam,
  paginatedSelect,
  withPagination,
} from "@/hooks/custom/paginated-query";
import { execute } from "@/lib/execute";

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
        i18n {
          locale
          messages {
            title
            description
          }
        }
        skills {
          id
          name
        }
        period {
          from
          to
        }
        createdAt
        updatedAt
      }
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
      execute(
        findManyEducations,
        withPagination<FindManyEducationsQueryVariables>(
          "educationPagination",
          pageParam,
          variables
        )
      ),
    initialPageParam: 0,
    getNextPageParam:
      paginatedNextPageParam<FindManyEducationsQuery>("findManyEducations"),
    select: paginatedSelect<FindManyEducationsQuery>("findManyEducations"),
    ...options,
  });
}
