import { useInfiniteQuery } from "@tanstack/react-query";
import { graphql } from "@/generated/graphql";
import type {
  FilterCourseInput,
  FindManyCoursesQuery,
  FindManyCoursesQueryVariables,
  SortCourseInput,
} from "@/generated/graphql/graphql";
import {
  paginatedNextPageParam,
  paginatedSelect,
  withPagination,
} from "@/hooks/custom/paginated-query";
import { execute } from "@/lib/execute";

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
        status
        relevance
        url
        image
        hours
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

export function useFindManyCourses(
  variables?: {
    courseFilters?: FilterCourseInput;
    courseSort?: SortCourseInput;
  },
  options?: { enabled?: boolean }
) {
  return useInfiniteQuery({
    getNextPageParam:
      paginatedNextPageParam<FindManyCoursesQuery>("findManyCourses"),
    initialPageParam: 0,
    queryFn: ({ pageParam }) =>
      execute(
        findManyCourses,
        withPagination<FindManyCoursesQueryVariables>(
          "coursePagination",
          pageParam,
          variables
        )
      ),
    queryKey: ["findManyCourses", variables],
    select: paginatedSelect<FindManyCoursesQuery>("findManyCourses"),
    ...options,
  });
}
