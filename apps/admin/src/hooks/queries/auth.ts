import type { UseQueryOptions } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import type { ExecutionResult } from "graphql";
import { graphql } from "@/graphql";
import type { GetMeQuery } from "@/graphql/graphql";
import { execute } from "@/lib/execute";

const getMe = graphql(`
  query GetMe {
    getMe {
      id
      email
      name
      nickname
      role
      title
      avatar
    }
  }
`);

type GetMeOptions = Omit<
  UseQueryOptions<ExecutionResult<GetMeQuery>>,
  "queryKey" | "queryFn"
>;

export function useGetMe(options?: GetMeOptions) {
  return useQuery({
    queryKey: ["getMe"],
    queryFn: async () => await execute(getMe),
    ...options,
  });
}
