import type { UseQueryOptions } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import { graphql } from "@/generated/graphql";
import type { GetMeQuery } from "@/generated/graphql/graphql";
import { request } from "@/service/graphql";

const getMe = graphql(`
  query GetMe {
    getMe {
      id
      email
      name
      nickname
      role
      avatar
      phone
      birth
      address
      locale
      locales
      i18n {
        locale
        messages {
          title
          description
        }
      }
      urls {
        title
        value
      }
      skillIds
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
    }
  }
`);

export function useGetMe(
  options?: Omit<UseQueryOptions<GetMeQuery>, "queryKey" | "queryFn">
) {
  return useQuery({
    queryFn: () => request(getMe),
    queryKey: ["getMe"],
    ...options,
  });
}
