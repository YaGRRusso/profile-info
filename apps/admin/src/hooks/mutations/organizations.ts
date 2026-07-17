import {
  type QueryClient,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { graphql } from "@/generated/graphql";
import type {
  CreateOrganizationInput,
  UpdateOrganizationInput,
} from "@/generated/graphql/graphql";
import { request } from "@/service/graphql";

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
      succeeded
      failed
    }
  }
`);

function invalidateOrganizationQueries(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: ["findManyOrganizations"] });
  queryClient.invalidateQueries({ queryKey: ["findManyActiveOrganizations"] });
}

export function useCreateOneOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (createOrganizationInput: CreateOrganizationInput) =>
      request(createOneOrganization, { createOrganizationInput }),
    mutationKey: ["createOneOrganization"],
    onSuccess: () => invalidateOrganizationQueries(queryClient),
  });
}

export function useUpdateOneOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      organizationId,
      updateOrganizationInput,
    }: {
      organizationId: string;
      updateOrganizationInput: UpdateOrganizationInput;
    }) =>
      request(updateOneOrganization, {
        organizationId,
        updateOrganizationInput,
      }),
    mutationKey: ["updateOneOrganization"],
    onSuccess: () => invalidateOrganizationQueries(queryClient),
  });
}

export function useUpdateManyOrganizations() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      organizationIds,
      updateOrganizationInput,
    }: {
      organizationIds: string[];
      updateOrganizationInput: UpdateOrganizationInput;
    }) =>
      request(updateManyOrganizations, {
        organizationIds,
        updateOrganizationInput,
      }),
    mutationKey: ["updateManyOrganizations"],
    onSuccess: () => invalidateOrganizationQueries(queryClient),
  });
}

export function useDisableOneOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (organizationId: string) =>
      request(disableOneOrganization, { organizationId }),
    mutationKey: ["disableOneOrganization"],
    onSuccess: () => invalidateOrganizationQueries(queryClient),
  });
}

export function useDisableManyOrganizations() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (organizationIds: string[]) =>
      request(disableManyOrganizations, { organizationIds }),
    mutationKey: ["disableManyOrganizations"],
    onSuccess: () => invalidateOrganizationQueries(queryClient),
  });
}

export function useEnableOneOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (organizationId: string) =>
      request(enableOneOrganization, { organizationId }),
    mutationKey: ["enableOneOrganization"],
    onSuccess: () => invalidateOrganizationQueries(queryClient),
  });
}

export function useEnableManyOrganizations() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (organizationIds: string[]) =>
      request(enableManyOrganizations, { organizationIds }),
    mutationKey: ["enableManyOrganizations"],
    onSuccess: () => invalidateOrganizationQueries(queryClient),
  });
}

export function useRemoveOneOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (organizationId: string) =>
      request(removeOneOrganization, { organizationId }),
    mutationKey: ["removeOneOrganization"],
    onSuccess: () => invalidateOrganizationQueries(queryClient),
  });
}

export function useRemoveManyOrganizations() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (organizationIds: string[]) =>
      request(removeManyOrganizations, { organizationIds }),
    mutationKey: ["removeManyOrganizations"],
    onSuccess: () => invalidateOrganizationQueries(queryClient),
  });
}
