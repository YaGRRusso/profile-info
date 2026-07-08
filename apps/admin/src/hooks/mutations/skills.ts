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
import { execute } from "@/lib/execute";

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
    mutationKey: ["createOneSkill"],
    mutationFn: (createSkillInput: CreateSkillInput) =>
      execute(createOneSkill, { createSkillInput }),
    onSuccess: () => invalidateSkillQueries(queryClient),
  });
}

export function useUpdateOneSkill() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["updateOneSkill"],
    mutationFn: ({
      skillId,
      updateSkillInput,
    }: {
      skillId: string;
      updateSkillInput: UpdateSkillInput;
    }) => execute(updateOneSkill, { skillId, updateSkillInput }),
    onSuccess: () => invalidateSkillQueries(queryClient),
  });
}

export function useUpdateManySkills() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["updateManySkills"],
    mutationFn: ({
      skillIds,
      updateSkillInput,
    }: {
      skillIds: string[];
      updateSkillInput: UpdateSkillInput;
    }) => execute(updateManySkills, { skillIds, updateSkillInput }),
    onSuccess: () => invalidateSkillQueries(queryClient),
  });
}

export function useDisableOneSkill() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["disableOneSkill"],
    mutationFn: (skillId: string) => execute(disableOneSkill, { skillId }),
    onSuccess: () => invalidateSkillQueries(queryClient),
  });
}

export function useDisableManySkills() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["disableManySkills"],
    mutationFn: (skillIds: string[]) =>
      execute(disableManySkills, { skillIds }),
    onSuccess: () => invalidateSkillQueries(queryClient),
  });
}

export function useEnableOneSkill() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["enableOneSkill"],
    mutationFn: (skillId: string) => execute(enableOneSkill, { skillId }),
    onSuccess: () => invalidateSkillQueries(queryClient),
  });
}

export function useEnableManySkills() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["enableManySkills"],
    mutationFn: (skillIds: string[]) => execute(enableManySkills, { skillIds }),
    onSuccess: () => invalidateSkillQueries(queryClient),
  });
}

export function useRemoveOneSkill() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["removeOneSkill"],
    mutationFn: (skillId: string) => execute(removeOneSkill, { skillId }),
    onSuccess: () => invalidateSkillQueries(queryClient),
  });
}

export function useRemoveManySkills() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["removeManySkills"],
    mutationFn: (skillIds: string[]) => execute(removeManySkills, { skillIds }),
    onSuccess: () => invalidateSkillQueries(queryClient),
  });
}
