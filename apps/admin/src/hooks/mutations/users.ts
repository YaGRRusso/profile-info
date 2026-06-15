import { useMutation, useQueryClient } from "@tanstack/react-query";
import { graphql } from "@/generated/graphql";
import type { UpdateMeInput } from "@/generated/graphql/graphql";
import { execute } from "@/lib/execute";

const updateMe = graphql(`
  mutation UpdateMe($updateMeInput: UpdateMeInput!) {
    updateMe(updateMeInput: $updateMeInput) {
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

export function useUpdateMe() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["updateMe"],
    mutationFn: (updateMeInput: UpdateMeInput) =>
      execute(updateMe, { updateMeInput }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["getMe"],
      });
    },
  });
}
