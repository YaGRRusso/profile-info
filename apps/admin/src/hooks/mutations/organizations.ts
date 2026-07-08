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
    mutationKey: ["createOneOrganization"],
    mutationFn: (createOrganizationInput: CreateOrganizationInput) =>
      execute(createOneOrganization, { createOrganizationInput }),
    onSuccess: () => invalidateOrganizationQueries(queryClient),
  });
}

export function useUpdateOneOrganization() {
  const queryClient = useQueryClient();

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
    onSuccess: () => invalidateOrganizationQueries(queryClient),
  });
}

export function useUpdateManyOrganizations() {
  const queryClient = useQueryClient();

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
    onSuccess: () => invalidateOrganizationQueries(queryClient),
  });
}

export function useDisableOneOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["disableOneOrganization"],
    mutationFn: (organizationId: string) =>
      execute(disableOneOrganization, { organizationId }),
    onSuccess: () => invalidateOrganizationQueries(queryClient),
  });
}

export function useDisableManyOrganizations() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["disableManyOrganizations"],
    mutationFn: (organizationIds: string[]) =>
      execute(disableManyOrganizations, { organizationIds }),
    onSuccess: () => invalidateOrganizationQueries(queryClient),
  });
}

export function useEnableOneOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["enableOneOrganization"],
    mutationFn: (organizationId: string) =>
      execute(enableOneOrganization, { organizationId }),
    onSuccess: () => invalidateOrganizationQueries(queryClient),
  });
}

export function useEnableManyOrganizations() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["enableManyOrganizations"],
    mutationFn: (organizationIds: string[]) =>
      execute(enableManyOrganizations, { organizationIds }),
    onSuccess: () => invalidateOrganizationQueries(queryClient),
  });
}

export function useRemoveOneOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["removeOneOrganization"],
    mutationFn: (organizationId: string) =>
      execute(removeOneOrganization, { organizationId }),
    onSuccess: () => invalidateOrganizationQueries(queryClient),
  });
}

export function useRemoveManyOrganizations() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["removeManyOrganizations"],
    mutationFn: (organizationIds: string[]) =>
      execute(removeManyOrganizations, { organizationIds }),
    onSuccess: () => invalidateOrganizationQueries(queryClient),
  });
}
