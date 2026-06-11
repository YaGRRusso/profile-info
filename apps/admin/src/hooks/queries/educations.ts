import { useInfiniteQuery } from "@tanstack/react-query";
import { graphql } from "@/generated/graphql";
import type {
  FilterEducationInput,
  FindManyEducationsQuery,
  SortEducationInput,
} from "@/generated/graphql/graphql";
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
