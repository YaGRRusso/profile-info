import { useQuery } from "@tanstack/react-query";
import { graphql } from "@/generated/graphql";
import { execute } from "@/lib/execute";

const apiStatus = graphql(`
  query ApiStatus {
    __typename
  }
`);

export function useApiStatus() {
  return useQuery({
    queryKey: ["apiStatus"],
    queryFn: () => execute(apiStatus),
  });
}
