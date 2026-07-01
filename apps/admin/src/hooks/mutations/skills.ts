import { useMutation } from "@tanstack/react-query";
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
      name
      slug
      category
      relevance
      createdAt
      updatedAt
    }
  }
`);

const updateOneSkill = graphql(`
  mutation UpdateOneSkill($skillId: ID!, $updateSkillInput: UpdateSkillInput!) {
    updateOneSkill(skillId: $skillId, updateSkillInput: $updateSkillInput) {
      id
      name
      slug
      category
      relevance
      createdAt
      updatedAt
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

export function useCreateOneSkill() {
  return useMutation({
    mutationKey: ["createOneSkill"],
    mutationFn: (createSkillInput: CreateSkillInput) =>
      execute(createOneSkill, { createSkillInput }),
  });
}

export function useUpdateOneSkill() {
  return useMutation({
    mutationKey: ["updateOneSkill"],
    mutationFn: ({
      skillId,
      updateSkillInput,
    }: {
      skillId: string;
      updateSkillInput: UpdateSkillInput;
    }) => execute(updateOneSkill, { skillId, updateSkillInput }),
  });
}

export function useUpdateManySkills() {
  return useMutation({
    mutationKey: ["updateManySkills"],
    mutationFn: ({
      skillIds,
      updateSkillInput,
    }: {
      skillIds: string[];
      updateSkillInput: UpdateSkillInput;
    }) => execute(updateManySkills, { skillIds, updateSkillInput }),
  });
}

export function useDisableOneSkill() {
  return useMutation({
    mutationKey: ["disableOneSkill"],
    mutationFn: (skillId: string) => execute(disableOneSkill, { skillId }),
  });
}

export function useDisableManySkills() {
  return useMutation({
    mutationKey: ["disableManySkills"],
    mutationFn: (skillIds: string[]) =>
      execute(disableManySkills, { skillIds }),
  });
}

export function useEnableOneSkill() {
  return useMutation({
    mutationKey: ["enableOneSkill"],
    mutationFn: (skillId: string) => execute(enableOneSkill, { skillId }),
  });
}

export function useEnableManySkills() {
  return useMutation({
    mutationKey: ["enableManySkills"],
    mutationFn: (skillIds: string[]) => execute(enableManySkills, { skillIds }),
  });
}
