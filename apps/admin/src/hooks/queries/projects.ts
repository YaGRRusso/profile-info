import type { UseQueryOptions } from "@tanstack/react-query";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { graphql } from "@/graphql";
import type {
  FilterProjectInput,
  FindManyProjectByIdQuery,
  FindManyProjectByIdQueryVariables,
  FindManyProjectsQuery,
  FindOneProjectByIdQuery,
  FindOneProjectByIdQueryVariables,
  FindOneProjectQuery,
  SortProjectInput,
} from "@/graphql/graphql";
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

const findOneProjectById = graphql(`
  query FindOneProjectById($projectId: ID!) {
    findOneProjectById(projectId: $projectId) {
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
`);

const findOneProject = graphql(`
  query FindOneProject($projectFilters: FilterProjectInput) {
    findOneProject(projectFilters: $projectFilters) {
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
`);

const findManyProjectById = graphql(`
  query FindManyProjectById($projectIds: [ID!]!) {
    findManyProjectById(projectIds: $projectIds) {
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

export function useFindOneProjectById(
  variables: FindOneProjectByIdQueryVariables,
  options?: Omit<
    UseQueryOptions<FindOneProjectByIdQuery>,
    "queryKey" | "queryFn"
  >
) {
  return useQuery({
    queryKey: ["findOneProjectById", variables],
    queryFn: () => execute(findOneProjectById, variables),
    ...options,
  });
}

export function useFindOneProject(
  variables: { projectFilters?: FilterProjectInput },
  options?: Omit<UseQueryOptions<FindOneProjectQuery>, "queryKey" | "queryFn">
) {
  return useQuery({
    queryKey: ["findOneProject", variables],
    queryFn: () => execute(findOneProject, variables),
    ...options,
  });
}

export function useFindManyProjectById(
  variables: FindManyProjectByIdQueryVariables,
  options?: Omit<
    UseQueryOptions<FindManyProjectByIdQuery>,
    "queryKey" | "queryFn"
  >
) {
  return useQuery({
    queryKey: ["findManyProjectById", variables],
    queryFn: () => execute(findManyProjectById, variables),
    ...options,
  });
}
