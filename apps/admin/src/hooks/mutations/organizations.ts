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
      succeeded
      failed
    }
  }
`);

const disableOneOrganization = graphql(`
  mutation DisableOneOrganization($organizationId: ID!) {
    disableOneOrganization(organizationId: $organizationId) {
      id
      slug
    }
  }
`);

const disableManyOrganizations = graphql(`
  mutation DisableManyOrganizations($organizationIds: [ID!]!) {
    disableManyOrganizations(organizationIds: $organizationIds) {
      succeeded
      failed
    }
  }
`);

const enableOneOrganization = graphql(`
  mutation EnableOneOrganization($organizationId: ID!) {
    enableOneOrganization(organizationId: $organizationId) {
      id
      slug
    }
  }
`);

const enableManyOrganizations = graphql(`
  mutation EnableManyOrganizations($organizationIds: [ID!]!) {
    enableManyOrganizations(organizationIds: $organizationIds) {
      succeeded
      failed
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

export function useDisableOneOrganization() {
  return useMutation({
    mutationKey: ["disableOneOrganization"],
    mutationFn: (organizationId: string) =>
      execute(disableOneOrganization, { organizationId }),
  });
}

export function useDisableManyOrganizations() {
  return useMutation({
    mutationKey: ["disableManyOrganizations"],
    mutationFn: (organizationIds: string[]) =>
      execute(disableManyOrganizations, { organizationIds }),
  });
}

export function useEnableOneOrganization() {
  return useMutation({
    mutationKey: ["enableOneOrganization"],
    mutationFn: (organizationId: string) =>
      execute(enableOneOrganization, { organizationId }),
  });
}

export function useEnableManyOrganizations() {
  return useMutation({
    mutationKey: ["enableManyOrganizations"],
    mutationFn: (organizationIds: string[]) =>
      execute(enableManyOrganizations, { organizationIds }),
  });
}
