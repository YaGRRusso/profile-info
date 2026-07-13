import { useInfiniteQuery } from "@tanstack/react-query";
import { graphql } from "@/generated/graphql";
import type {
  FilterUserInput,
  FindManyUsersQuery,
  FindManyUsersQueryVariables,
  SortUserInput,
} from "@/generated/graphql/graphql";
import {
  paginatedNextPageParam,
  paginatedSelect,
  withPagination,
} from "@/hooks/custom/paginated-query";
import { execute } from "@/lib/execute";

export type UserRow = FindManyUsersQuery["findManyUsers"]["nodes"][number];

const findManyUsers = graphql(`
  query FindManyUsers(
    $userFilters: FilterUserInput
    $userPagination: PaginationInput
    $userSort: SortUserInput
  ) {
    findManyUsers(
      userFilters: $userFilters
      userPagination: $userPagination
      userSort: $userSort
    ) {
      found
      nodes {
        id
        name
        nickname
        email
        avatar
        phone
        role
        disabled
        createdAt
        updatedAt
      }
    }
  }
`);

export function useFindManyUsers(
  variables?: {
    userFilters?: FilterUserInput;
    userSort?: SortUserInput;
  },
  options?: { enabled?: boolean }
) {
  return useInfiniteQuery({
    queryKey: ["findManyUsers", variables],
    queryFn: ({ pageParam }) =>
      execute(
        findManyUsers,
        withPagination<FindManyUsersQueryVariables>(
          "userPagination",
          pageParam,
          variables
        )
      ),
    initialPageParam: 0,
    getNextPageParam:
      paginatedNextPageParam<FindManyUsersQuery>("findManyUsers"),
    select: paginatedSelect<FindManyUsersQuery>("findManyUsers"),
    ...options,
  });
}
