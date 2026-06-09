import { useMutation } from "@tanstack/react-query";
import { graphql } from "@/generated/graphql";
import type {
  CreateOrganizationInput,
  UpdateOrganizationInput,
} from "@/generated/graphql/graphql";
import { execute } from "@/lib/execute";

const createOneOrganization = graphql(`
  mutation CreateOneOrganization(
    $createOrganizationInput: CreateOrganizationInput!
  ) {
    createOneOrganization(createOrganizationInput: $createOrganizationInput) {
      id
      slug
    }
  }
`);

const updateOneOrganization = graphql(`
  mutation UpdateOneOrganization(
    $organizationId: ID!
    $updateOrganizationInput: UpdateOrganizationInput!
  ) {
    updateOneOrganization(
      organizationId: $organizationId
      updateOrganizationInput: $updateOrganizationInput
    ) {
      id
      slug
    }
  }
`);

const updateManyOrganizations = graphql(`
  mutation UpdateManyOrganizations(
    $organizationIds: [ID!]!
    $updateOrganizationInput: UpdateOrganizationInput!
  ) {
    updateManyOrganizations(
      organizationIds: $organizationIds
      updateOrganizationInput: $updateOrganizationInput
    ) {
      count
    }
  }
`);

const removeOneOrganization = graphql(`
  mutation RemoveOneOrganization($organizationId: ID!) {
    removeOneOrganization(organizationId: $organizationId) {
      id
      slug
    }
  }
`);

const removeManyOrganizations = graphql(`
  mutation RemoveManyOrganizations($organizationIds: [ID!]!) {
    removeManyOrganizations(organizationIds: $organizationIds) {
      count
    }
  }
`);

export function useCreateOneOrganization() {
  return useMutation({
    mutationKey: ["createOneOrganization"],
    mutationFn: (createOrganizationInput: CreateOrganizationInput) =>
      execute(createOneOrganization, { createOrganizationInput }),
  });
}

export function useUpdateOneOrganization() {
  return useMutation({
    mutationKey: ["updateOneOrganization"],
    mutationFn: ({
      organizationId,
      updateOrganizationInput,
    }: {
      organizationId: string;
      updateOrganizationInput: UpdateOrganizationInput;
    }) =>
      execute(updateOneOrganization, {
        organizationId,
        updateOrganizationInput,
      }),
  });
}

export function useUpdateManyOrganizations() {
  return useMutation({
    mutationKey: ["updateManyOrganizations"],
    mutationFn: ({
      organizationIds,
      updateOrganizationInput,
    }: {
      organizationIds: string[];
      updateOrganizationInput: UpdateOrganizationInput;
    }) =>
      execute(updateManyOrganizations, {
        organizationIds,
        updateOrganizationInput,
      }),
  });
}

export function useRemoveOneOrganization() {
  return useMutation({
    mutationKey: ["removeOneOrganization"],
    mutationFn: (organizationId: string) =>
      execute(removeOneOrganization, { organizationId }),
  });
}

export function useRemoveManyOrganizations() {
  return useMutation({
    mutationKey: ["removeManyOrganizations"],
    mutationFn: (organizationIds: string[]) =>
      execute(removeManyOrganizations, { organizationIds }),
  });
}
