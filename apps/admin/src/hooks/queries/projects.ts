import { useInfiniteQuery } from "@tanstack/react-query";
import { graphql } from "@/generated/graphql";
import type {
  FilterProjectInput,
  FindManyProjectsQuery,
  SortProjectInput,
} from "@/generated/graphql/graphql";
import { execute } from "@/lib/execute";

const PAGE_SIZE = 50;

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
          name
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
      execute(findManyProjects, {
        ...variables,
        projectPagination: { skip: pageParam, limit: PAGE_SIZE },
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const totalFetched = allPages.reduce(
        (sum, p) => sum + p.findManyProjects.nodes.length,
        0
      );
      return totalFetched < lastPage.findManyProjects.found
        ? totalFetched
        : undefined;
    },
    select: (data) => ({
      found: data.pages[0]?.findManyProjects.found ?? 0,
      nodes: data.pages.flatMap((p) => p.findManyProjects.nodes),
    }),
    ...options,
  });
}
