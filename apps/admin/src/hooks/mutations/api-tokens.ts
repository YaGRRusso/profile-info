import { useMutation } from "@tanstack/react-query";
import { graphql } from "@/generated/graphql";
import type {
  CreateApiTokenInput,
  UpdateApiTokenInput,
} from "@/generated/graphql/graphql";
import { execute } from "@/lib/execute";

const createOneApiToken = graphql(`
  mutation CreateOneApiToken($createApiTokenInput: CreateApiTokenInput!) {
    createOneApiToken(createApiTokenInput: $createApiTokenInput) {
      token
      apiToken {
        id
        ownerId
        name
        permissions
        expiresAt
        createdAt
        updatedAt
      }
    }
  }
`);

const updateOneApiToken = graphql(`
  mutation UpdateOneApiToken(
    $apiTokenId: ID!
    $updateApiTokenInput: UpdateApiTokenInput!
  ) {
    updateOneApiToken(
      apiTokenId: $apiTokenId
      updateApiTokenInput: $updateApiTokenInput
    ) {
      id
      ownerId
      name
      permissions
      expiresAt
      createdAt
      updatedAt
    }
  }
`);

const updateManyApiTokens = graphql(`
  mutation UpdateManyApiTokens(
    $apiTokenIds: [ID!]!
    $updateApiTokenInput: UpdateApiTokenInput!
  ) {
    updateManyApiTokens(
      apiTokenIds: $apiTokenIds
      updateApiTokenInput: $updateApiTokenInput
    ) {
      succeeded
      failed
    }
  }
`);

const removeOneApiToken = graphql(`
  mutation RemoveOneApiToken($apiTokenId: ID!) {
    removeOneApiToken(apiTokenId: $apiTokenId) {
      id
      name
      permissions
      expiresAt
      createdAt
      updatedAt
    }
  }
`);

const removeManyApiTokens = graphql(`
  mutation RemoveManyApiTokens($apiTokenIds: [ID!]!) {
    removeManyApiTokens(apiTokenIds: $apiTokenIds) {
      succeeded
      failed
    }
  }
`);

export function useCreateOneApiToken() {
  return useMutation({
    mutationKey: ["createOneApiToken"],
    mutationFn: (createApiTokenInput: CreateApiTokenInput) =>
      execute(createOneApiToken, { createApiTokenInput }),
  });
}

export function useUpdateOneApiToken() {
  return useMutation({
    mutationKey: ["updateOneApiToken"],
    mutationFn: ({
      apiTokenId,
      updateApiTokenInput,
    }: {
      apiTokenId: string;
      updateApiTokenInput: UpdateApiTokenInput;
    }) => execute(updateOneApiToken, { apiTokenId, updateApiTokenInput }),
  });
}

export function useUpdateManyApiTokens() {
  return useMutation({
    mutationKey: ["updateManyApiTokens"],
    mutationFn: ({
      apiTokenIds,
      updateApiTokenInput,
    }: {
      apiTokenIds: string[];
      updateApiTokenInput: UpdateApiTokenInput;
    }) => execute(updateManyApiTokens, { apiTokenIds, updateApiTokenInput }),
  });
}

export function useRemoveOneApiToken() {
  return useMutation({
    mutationKey: ["removeOneApiToken"],
    mutationFn: (apiTokenId: string) =>
      execute(removeOneApiToken, { apiTokenId }),
  });
}

export function useRemoveManyApiTokens() {
  return useMutation({
    mutationKey: ["removeManyApiTokens"],
    mutationFn: (apiTokenIds: string[]) =>
      execute(removeManyApiTokens, { apiTokenIds }),
  });
}
