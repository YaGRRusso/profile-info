import { useQuery } from "@tanstack/react-query";
import { graphql } from "@/graphql";
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

export function useGetMe() {
  return useQuery({
    queryKey: ["getMe"],
    queryFn: async () => await execute(getMe),
  });
}
