import { useMutation, useQueryClient } from "@tanstack/react-query";
import { graphql } from "@/generated/graphql";
import type {
  CreateUserInput,
  UpdateMeInput,
  UpdateUserInput,
} from "@/generated/graphql/graphql";
import { execute } from "@/lib/execute";

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

export function useCreateOneUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["createOneUser"],
    mutationFn: (createUserInput: CreateUserInput) =>
      execute(createOneUser, { createUserInput }),
    onSuccess: () => invalidateUserQueries(queryClient),
  });
}

export function useCreateManyUsers() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["createManyUsers"],
    mutationFn: (createUserInputs: CreateUserInput[]) =>
      execute(createManyUsers, { createUserInputs }),
    onSuccess: () => invalidateUserQueries(queryClient),
  });
}

export function useUpdateOneUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["updateOneUser"],
    mutationFn: ({
      userId,
      updateUserInput,
    }: {
      userId: string;
      updateUserInput: UpdateUserInput;
    }) => execute(updateOneUser, { userId, updateUserInput }),
    onSuccess: () => invalidateUserQueries(queryClient),
  });
}

export function useUpdateManyUsers() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["updateManyUsers"],
    mutationFn: ({
      userIds,
      updateUserInput,
    }: {
      userIds: string[];
      updateUserInput: UpdateUserInput;
    }) => execute(updateManyUsers, { userIds, updateUserInput }),
    onSuccess: () => invalidateUserQueries(queryClient),
  });
}

export function useRemoveOneUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["removeOneUser"],
    mutationFn: (userId: string) => execute(removeOneUser, { userId }),
    onSuccess: () => invalidateUserQueries(queryClient),
  });
}

export function useRemoveManyUsers() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["removeManyUsers"],
    mutationFn: (userIds: string[]) => execute(removeManyUsers, { userIds }),
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
        { userId, updateUserInput: { disabled: false } },
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
        { userId, updateUserInput: { disabled: true } },
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
        { userIds, updateUserInput: { disabled: false } },
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
        { userIds, updateUserInput: { disabled: true } },
        options
      ),
  };
}
