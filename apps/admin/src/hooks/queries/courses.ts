import type { UseQueryOptions } from "@tanstack/react-query";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { graphql } from "@/graphql";
import type {
  FilterCourseInput,
  FindManyCourseByIdQuery,
  FindManyCourseByIdQueryVariables,
  FindManyCoursesQuery,
  FindOneCourseByIdQuery,
  FindOneCourseByIdQueryVariables,
  FindOneCourseQuery,
  SortCourseInput,
} from "@/graphql/graphql";
import { execute } from "@/lib/execute";

const PAGE_SIZE = 50;

export type CourseRow =
  FindManyCoursesQuery["findManyCourses"]["nodes"][number];

const findManyCourses = graphql(`
  query FindManyCourses(
    $courseFilters: FilterCourseInput
    $coursePagination: PaginationInput
    $courseSort: SortCourseInput
  ) {
    findManyCourses(
      courseFilters: $courseFilters
      coursePagination: $coursePagination
      courseSort: $courseSort
    ) {
      found
      nodes {
        id
        slug
        type
        status
        relevance
        url
        image
        hours
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

const findOneCourseById = graphql(`
  query FindOneCourseById($courseId: ID!) {
    findOneCourseById(courseId: $courseId) {
      id
      slug
      type
      status
      relevance
      url
      image
      hours
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

const findOneCourse = graphql(`
  query FindOneCourse($courseFilters: FilterCourseInput) {
    findOneCourse(courseFilters: $courseFilters) {
      id
      slug
      type
      status
      relevance
      url
      image
      hours
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

const findManyCourseById = graphql(`
  query FindManyCourseById($courseIds: [ID!]!) {
    findManyCourseById(courseIds: $courseIds) {
      id
      slug
      type
      status
      relevance
      url
      image
      hours
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

export function useFindManyCourses(
  variables?: {
    courseFilters?: FilterCourseInput;
    courseSort?: SortCourseInput;
  },
  options?: { enabled?: boolean }
) {
  return useInfiniteQuery({
    queryKey: ["findManyCourses", variables],
    queryFn: ({ pageParam }) =>
      execute(findManyCourses, {
        ...variables,
        coursePagination: { skip: pageParam, limit: PAGE_SIZE },
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const totalFetched = allPages.reduce(
        (sum, p) => sum + p.findManyCourses.nodes.length,
        0
      );
      return totalFetched < lastPage.findManyCourses.found
        ? totalFetched
        : undefined;
    },
    select: (data) => ({
      found: data.pages[0]?.findManyCourses.found ?? 0,
      nodes: data.pages.flatMap((p) => p.findManyCourses.nodes),
    }),
    ...options,
  });
}

export function useFindOneCourseById(
  variables: FindOneCourseByIdQueryVariables,
  options?: Omit<
    UseQueryOptions<FindOneCourseByIdQuery>,
    "queryKey" | "queryFn"
  >
) {
  return useQuery({
    queryKey: ["findOneCourseById", variables],
    queryFn: () => execute(findOneCourseById, variables),
    ...options,
  });
}

export function useFindOneCourse(
  variables: { courseFilters?: FilterCourseInput },
  options?: Omit<UseQueryOptions<FindOneCourseQuery>, "queryKey" | "queryFn">
) {
  return useQuery({
    queryKey: ["findOneCourse", variables],
    queryFn: () => execute(findOneCourse, variables),
    ...options,
  });
}

export function useFindManyCourseById(
  variables: FindManyCourseByIdQueryVariables,
  options?: Omit<
    UseQueryOptions<FindManyCourseByIdQuery>,
    "queryKey" | "queryFn"
  >
) {
  return useQuery({
    queryKey: ["findManyCourseById", variables],
    queryFn: () => execute(findManyCourseById, variables),
    ...options,
  });
}
