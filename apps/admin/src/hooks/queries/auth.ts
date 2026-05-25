import type { UseQueryOptions } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
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

export function useGetMe(
  options?: Omit<UseQueryOptions<GetMeQuery>, "queryKey" | "queryFn">
) {
  return useQuery({
    queryKey: ["getMe"],
    queryFn: async () => await execute(getMe),
    ...options,
  });
}
