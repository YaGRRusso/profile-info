import type { UseQueryOptions } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import { graphql } from "@/generated/graphql";
import type { GetMeQuery } from "@/generated/graphql/graphql";
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
      phone
      birth
      address
      description
      urls {
        title
        value
      }
    }
  }
`);

export function useGetMe(
  options?: Omit<UseQueryOptions<GetMeQuery>, "queryKey" | "queryFn">
) {
  return useQuery({
    queryKey: ["getMe"],
    queryFn: () => execute(getMe),
    ...options,
  });
}
