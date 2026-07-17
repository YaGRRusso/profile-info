import {
  type QueryClient,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { graphql } from "@/generated/graphql";
import type {
  CreateSkillInput,
  UpdateSkillInput,
} from "@/generated/graphql/graphql";
import { request } from "@/service/graphql";

const createOneSkill = graphql(`
  mutation CreateOneSkill($createSkillInput: CreateSkillInput!) {
    createOneSkill(createSkillInput: $createSkillInput) {
      id
      slug
      category
      createdAt
      updatedAt
      i18n {
        locale
        messages {
          title
        }
      }
    }
  }
`);

const updateOneSkill = graphql(`
  mutation UpdateOneSkill($skillId: ID!, $updateSkillInput: UpdateSkillInput!) {
    updateOneSkill(skillId: $skillId, updateSkillInput: $updateSkillInput) {
      id
      slug
      category
      createdAt
      updatedAt
      i18n {
        locale
        messages {
          title
        }
      }
    }
  }
`);

const updateManySkills = graphql(`
  mutation UpdateManySkills(
    $skillIds: [ID!]!
    $updateSkillInput: UpdateSkillInput!
  ) {
    updateManySkills(skillIds: $skillIds, updateSkillInput: $updateSkillInput) {
      succeeded
      failed
    }
  }
`);

const disableOneSkill = graphql(`
  mutation DisableOneSkill($skillId: ID!) {
    disableOneSkill(skillId: $skillId) {
      id
      slug
    }
  }
`);

const disableManySkills = graphql(`
  mutation DisableManySkills($skillIds: [ID!]!) {
    disableManySkills(skillIds: $skillIds) {
      succeeded
      failed
    }
  }
`);

const enableOneSkill = graphql(`
  mutation EnableOneSkill($skillId: ID!) {
    enableOneSkill(skillId: $skillId) {
      id
      slug
    }
  }
`);

const enableManySkills = graphql(`
  mutation EnableManySkills($skillIds: [ID!]!) {
    enableManySkills(skillIds: $skillIds) {
      succeeded
      failed
    }
  }
`);

const removeOneSkill = graphql(`
  mutation RemoveOneSkill($skillId: ID!) {
    removeOneSkill(skillId: $skillId) {
      id
      slug
    }
  }
`);

const removeManySkills = graphql(`
  mutation RemoveManySkills($skillIds: [ID!]!) {
    removeManySkills(skillIds: $skillIds) {
      succeeded
      failed
    }
  }
`);

function invalidateSkillQueries(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: ["findManySkills"] });
  queryClient.invalidateQueries({ queryKey: ["findManyActiveSkills"] });
}

export function useCreateOneSkill() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (createSkillInput: CreateSkillInput) =>
      request(createOneSkill, { createSkillInput }),
    mutationKey: ["createOneSkill"],
    onSuccess: () => invalidateSkillQueries(queryClient),
  });
}

export function useUpdateOneSkill() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      skillId,
      updateSkillInput,
    }: {
      skillId: string;
      updateSkillInput: UpdateSkillInput;
    }) => request(updateOneSkill, { skillId, updateSkillInput }),
    mutationKey: ["updateOneSkill"],
    onSuccess: () => invalidateSkillQueries(queryClient),
  });
}

export function useUpdateManySkills() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      skillIds,
      updateSkillInput,
    }: {
      skillIds: string[];
      updateSkillInput: UpdateSkillInput;
    }) => request(updateManySkills, { skillIds, updateSkillInput }),
    mutationKey: ["updateManySkills"],
    onSuccess: () => invalidateSkillQueries(queryClient),
  });
}

export function useDisableOneSkill() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (skillId: string) => request(disableOneSkill, { skillId }),
    mutationKey: ["disableOneSkill"],
    onSuccess: () => invalidateSkillQueries(queryClient),
  });
}

export function useDisableManySkills() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (skillIds: string[]) =>
      request(disableManySkills, { skillIds }),
    mutationKey: ["disableManySkills"],
    onSuccess: () => invalidateSkillQueries(queryClient),
  });
}

export function useEnableOneSkill() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (skillId: string) => request(enableOneSkill, { skillId }),
    mutationKey: ["enableOneSkill"],
    onSuccess: () => invalidateSkillQueries(queryClient),
  });
}

export function useEnableManySkills() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (skillIds: string[]) => request(enableManySkills, { skillIds }),
    mutationKey: ["enableManySkills"],
    onSuccess: () => invalidateSkillQueries(queryClient),
  });
}

export function useRemoveOneSkill() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (skillId: string) => request(removeOneSkill, { skillId }),
    mutationKey: ["removeOneSkill"],
    onSuccess: () => invalidateSkillQueries(queryClient),
  });
}

export function useRemoveManySkills() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (skillIds: string[]) => request(removeManySkills, { skillIds }),
    mutationKey: ["removeManySkills"],
    onSuccess: () => invalidateSkillQueries(queryClient),
  });
}
