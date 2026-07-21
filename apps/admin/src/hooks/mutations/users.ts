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

const toggleStatusOneUser = graphql(`
  mutation ToggleStatusOneUser($userId: ID!, $disabled: Boolean!) {
    toggleStatusOneUser(userId: $userId, disabled: $disabled) {
      id
    }
  }
`);

const toggleStatusManyUsers = graphql(`
  mutation ToggleStatusManyUsers($userIds: [ID!]!, $disabled: Boolean!) {
    toggleStatusManyUsers(userIds: $userIds, disabled: $disabled) {
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
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) =>
      request(toggleStatusOneUser, { disabled: false, userId }),
    mutationKey: ["toggleStatusOneUser", "enable"],
    onSuccess: () => invalidateUserQueries(queryClient),
  });
}

export function useDisableOneUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) =>
      request(toggleStatusOneUser, { disabled: true, userId }),
    mutationKey: ["toggleStatusOneUser", "disable"],
    onSuccess: () => invalidateUserQueries(queryClient),
  });
}

export function useEnableManyUsers() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userIds: string[]) =>
      request(toggleStatusManyUsers, { disabled: false, userIds }),
    mutationKey: ["toggleStatusManyUsers", "enable"],
    onSuccess: () => invalidateUserQueries(queryClient),
  });
}

export function useDisableManyUsers() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userIds: string[]) =>
      request(toggleStatusManyUsers, { disabled: true, userIds }),
    mutationKey: ["toggleStatusManyUsers", "disable"],
    onSuccess: () => invalidateUserQueries(queryClient),
  });
}
