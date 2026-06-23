import { useInfiniteQuery } from "@tanstack/react-query";
import { graphql } from "@/generated/graphql";
import type {
  FilterCourseInput,
  FindManyCoursesQuery,
  SortCourseInput,
} from "@/generated/graphql/graphql";
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
        ownerId
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
