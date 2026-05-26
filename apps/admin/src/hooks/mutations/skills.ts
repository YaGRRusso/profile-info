import { useMutation } from "@tanstack/react-query";
import { graphql } from "@/graphql";
import type { CreateSkillInput, UpdateSkillInput } from "@/graphql/graphql";
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
  mutation UpdateOneSkill($SkillId: ID!, $updateSkillInput: UpdateSkillInput!) {
    updateOneSkill(SkillId: $SkillId, updateSkillInput: $updateSkillInput) {
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
    $SkillIds: [ID!]!
    $updateSkillInput: UpdateSkillInput!
  ) {
    updateManySkills(SkillIds: $SkillIds, updateSkillInput: $updateSkillInput) {
      count
    }
  }
`);

const removeOneSkill = graphql(`
  mutation RemoveOneSkill($SkillId: ID!) {
    removeOneSkill(SkillId: $SkillId) {
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
  mutation RemoveManySkills($SkillIds: [ID!]!) {
    removeManySkills(SkillIds: $SkillIds) {
      count
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
      SkillId,
      updateSkillInput,
    }: {
      SkillId: string;
      updateSkillInput: UpdateSkillInput;
    }) => execute(updateOneSkill, { SkillId, updateSkillInput }),
  });
}

export function useUpdateManySkills() {
  return useMutation({
    mutationKey: ["updateManySkills"],
    mutationFn: ({
      SkillIds,
      updateSkillInput,
    }: {
      SkillIds: string[];
      updateSkillInput: UpdateSkillInput;
    }) => execute(updateManySkills, { SkillIds, updateSkillInput }),
  });
}

export function useRemoveOneSkill() {
  return useMutation({
    mutationKey: ["removeOneSkill"],
    mutationFn: (SkillId: string) => execute(removeOneSkill, { SkillId }),
  });
}

export function useRemoveManySkills() {
  return useMutation({
    mutationKey: ["removeManySkills"],
    mutationFn: (SkillIds: string[]) => execute(removeManySkills, { SkillIds }),
  });
}
