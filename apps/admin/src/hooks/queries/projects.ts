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
    getNextPageParam:
      paginatedNextPageParam<FindManyProjectsQuery>("findManyProjects"),
    initialPageParam: 0,
    queryFn: ({ pageParam }) =>
      execute(
        findManyProjects,
        withPagination<FindManyProjectsQueryVariables>(
          "projectPagination",
          pageParam,
          variables
        )
      ),
    queryKey: ["findManyProjects", variables],
    select: paginatedSelect<FindManyProjectsQuery>("findManyProjects"),
    ...options,
  });
}
