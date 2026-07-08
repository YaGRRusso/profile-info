import { useInfiniteQuery } from "@tanstack/react-query";
import { graphql } from "@/generated/graphql";
import type {
  FilterProjectInput,
  FindManyProjectsQuery,
  FindManyProjectsQueryVariables,
  SortProjectInput,
} from "@/generated/graphql/graphql";
import {
  paginatedNextPageParam,
  paginatedSelect,
  withPagination,
} from "@/hooks/custom/paginated-query";
import { execute } from "@/lib/execute";

export type ProjectRow =
  FindManyProjectsQuery["findManyProjects"]["nodes"][number];

const findManyProjects = graphql(`
  query FindManyProjects(
    $projectFilters: FilterProjectInput
    $projectPagination: PaginationInput
    $projectSort: SortProjectInput
  ) {
    findManyProjects(
      projectFilters: $projectFilters
      projectPagination: $projectPagination
      projectSort: $projectSort
    ) {
      found
      nodes {
        id
        slug
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
        images
        urls {
          title
          value
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
          slug
          disabled
          i18n {
            locale
            messages {
              title
            }
          }
        }
        createdAt
        updatedAt
      }
    }
  }
`);

export function useFindManyProjects(
  variables?: {
    projectFilters?: FilterProjectInput;
    projectSort?: SortProjectInput;
  },
  options?: { enabled?: boolean }
) {
  return useInfiniteQuery({
    queryKey: ["findManyProjects", variables],
    queryFn: ({ pageParam }) =>
      execute(
        findManyProjects,
        withPagination<FindManyProjectsQueryVariables>(
          "projectPagination",
          pageParam,
          variables
        )
      ),
    initialPageParam: 0,
    getNextPageParam:
      paginatedNextPageParam<FindManyProjectsQuery>("findManyProjects"),
    select: paginatedSelect<FindManyProjectsQuery>("findManyProjects"),
    ...options,
  });
}
