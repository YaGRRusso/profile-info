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

const removeOneSkill = graphql(`
  mutation RemoveOneSkill($skillId: ID!) {
    removeOneSkill(skillId: $skillId) {
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

const removeManySkills = graphql(`
  mutation RemoveManySkills($skillIds: [ID!]!) {
    removeManySkills(skillIds: $skillIds) {
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

export function useRemoveOneSkill() {
  return useMutation({
    mutationKey: ["removeOneSkill"],
    mutationFn: (skillId: string) => execute(removeOneSkill, { skillId }),
  });
}

export function useRemoveManySkills() {
  return useMutation({
    mutationKey: ["removeManySkills"],
    mutationFn: (skillIds: string[]) => execute(removeManySkills, { skillIds }),
  });
}
