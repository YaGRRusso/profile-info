import { useMutation, useQueryClient } from "@tanstack/react-query";
import { graphql } from "@/generated/graphql";
import type {
  CreateUserInput,
  UpdateMeInput,
  UpdateUserInput,
} from "@/generated/graphql/graphql";
import { request } from "@/service/graphql";

const updateMe = graphql(`
  mutation UpdateMe($updateMeInput: UpdateMeInput!) {
    updateMe(updateMeInput: $updateMeInput) {
      id
      email
      name
      nickname
      role
      avatar
      phone
      birth
      address
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
    }
  }
`);

const createOneUser = graphql(`
  mutation CreateOneUser($createUserInput: CreateUserInput!) {
    createOneUser(createUserInput: $createUserInput) {
      id
    }
  }
`);

const createManyUsers = graphql(`
  mutation CreateManyUsers($createUserInputs: [CreateUserInput!]!) {
    createManyUsers(createUserInputs: $createUserInputs) {
      succeeded
      failed
    }
  }
`);

const updateOneUser = graphql(`
  mutation UpdateOneUser($userId: ID!, $updateUserInput: UpdateUserInput!) {
    updateOneUser(userId: $userId, updateUserInput: $updateUserInput) {
      id
    }
  }
`);

const updateManyUsers = graphql(`
  mutation UpdateManyUsers($userIds: [ID!]!, $updateUserInput: UpdateUserInput!) {
    updateManyUsers(userIds: $userIds, updateUserInput: $updateUserInput) {
      succeeded
      failed
    }
  }
`);

const removeOneUser = graphql(`
  mutation RemoveOneUser($userId: ID!) {
    removeOneUser(userId: $userId) {
      id
    }
  }
`);

const removeManyUsers = graphql(`
  mutation RemoveManyUsers($userIds: [ID!]!) {
    removeManyUsers(userIds: $userIds) {
      succeeded
      failed
    }
  }
`);

function invalidateUserQueries(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ["findManyUsers"] });
}

export function useUpdateMe() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (updateMeInput: UpdateMeInput) =>
      request(updateMe, { updateMeInput }),
    mutationKey: ["updateMe"],
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["getMe"],
      });
    },
  });
}

export function useCreateOneUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (createUserInput: CreateUserInput) =>
      request(createOneUser, { createUserInput }),
    mutationKey: ["createOneUser"],
    onSuccess: () => invalidateUserQueries(queryClient),
  });
}

export function useCreateManyUsers() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (createUserInputs: CreateUserInput[]) =>
      request(createManyUsers, { createUserInputs }),
    mutationKey: ["createManyUsers"],
    onSuccess: () => invalidateUserQueries(queryClient),
  });
}

export function useUpdateOneUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      userId,
      updateUserInput,
    }: {
      userId: string;
      updateUserInput: UpdateUserInput;
    }) => request(updateOneUser, { updateUserInput, userId }),
    mutationKey: ["updateOneUser"],
    onSuccess: () => invalidateUserQueries(queryClient),
  });
}

export function useUpdateManyUsers() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      userIds,
      updateUserInput,
    }: {
      userIds: string[];
      updateUserInput: UpdateUserInput;
    }) => request(updateManyUsers, { updateUserInput, userIds }),
    mutationKey: ["updateManyUsers"],
    onSuccess: () => invalidateUserQueries(queryClient),
  });
}

export function useRemoveOneUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => request(removeOneUser, { userId }),
    mutationKey: ["removeOneUser"],
    onSuccess: () => invalidateUserQueries(queryClient),
  });
}

export function useRemoveManyUsers() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userIds: string[]) => request(removeManyUsers, { userIds }),
    mutationKey: ["removeManyUsers"],
    onSuccess: () => invalidateUserQueries(queryClient),
  });
}

export function useEnableOneUser() {
  const updateOneUserMutation = useUpdateOneUser();
  return {
    ...updateOneUserMutation,
    mutate: (
      userId: string,
      options?: Parameters<typeof updateOneUserMutation.mutate>[1]
    ) =>
      updateOneUserMutation.mutate(
        { updateUserInput: { disabled: false }, userId },
        options
      ),
  };
}

export function useDisableOneUser() {
  const updateOneUserMutation = useUpdateOneUser();
  return {
    ...updateOneUserMutation,
    mutate: (
      userId: string,
      options?: Parameters<typeof updateOneUserMutation.mutate>[1]
    ) =>
      updateOneUserMutation.mutate(
        { updateUserInput: { disabled: true }, userId },
        options
      ),
  };
}

export function useEnableManyUsers() {
  const updateManyUsersMutation = useUpdateManyUsers();
  return {
    ...updateManyUsersMutation,
    mutate: (
      userIds: string[],
      options?: Parameters<typeof updateManyUsersMutation.mutate>[1]
    ) =>
      updateManyUsersMutation.mutate(
        { updateUserInput: { disabled: false }, userIds },
        options
      ),
  };
}

export function useDisableManyUsers() {
  const updateManyUsersMutation = useUpdateManyUsers();
  return {
    ...updateManyUsersMutation,
    mutate: (
      userIds: string[],
      options?: Parameters<typeof updateManyUsersMutation.mutate>[1]
    ) =>
      updateManyUsersMutation.mutate(
        { updateUserInput: { disabled: true }, userIds },
        options
      ),
  };
}
