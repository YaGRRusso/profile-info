import { useMutation } from "@tanstack/react-query";
import { graphql } from "@/generated/graphql";
import type {
  CreateExperienceInput,
  UpdateExperienceInput,
} from "@/generated/graphql/graphql";
import { execute } from "@/lib/execute";

const createOneExperience = graphql(`
  mutation CreateOneExperience($createExperienceInput: CreateExperienceInput!) {
    createOneExperience(createExperienceInput: $createExperienceInput) {
      id
      slug
    }
  }
`);

const updateOneExperience = graphql(`
  mutation UpdateOneExperience(
    $experienceId: ID!
    $updateExperienceInput: UpdateExperienceInput!
  ) {
    updateOneExperience(
      experienceId: $experienceId
      updateExperienceInput: $updateExperienceInput
    ) {
      id
      slug
    }
  }
`);

const updateManyExperiences = graphql(`
  mutation UpdateManyExperiences(
    $experienceIds: [ID!]!
    $updateExperienceInput: UpdateExperienceInput!
  ) {
    updateManyExperiences(
      experienceIds: $experienceIds
      updateExperienceInput: $updateExperienceInput
    ) {
      succeeded
      failed
    }
  }
`);

const removeOneExperience = graphql(`
  mutation RemoveOneExperience($experienceId: ID!) {
    removeOneExperience(experienceId: $experienceId) {
      id
      slug
    }
  }
`);

const removeManyExperiences = graphql(`
  mutation RemoveManyExperiences($experienceIds: [ID!]!) {
    removeManyExperiences(experienceIds: $experienceIds) {
      succeeded
      failed
    }
  }
`);

export function useCreateOneExperience() {
  return useMutation({
    mutationFn: (createExperienceInput: CreateExperienceInput) =>
      execute(createOneExperience, { createExperienceInput }),
    mutationKey: ["createOneExperience"],
  });
}

export function useUpdateOneExperience() {
  return useMutation({
    mutationFn: ({
      experienceId,
      updateExperienceInput,
    }: {
      experienceId: string;
      updateExperienceInput: UpdateExperienceInput;
    }) => execute(updateOneExperience, { experienceId, updateExperienceInput }),
    mutationKey: ["updateOneExperience"],
  });
}

export function useUpdateManyExperiences() {
  return useMutation({
    mutationFn: ({
      experienceIds,
      updateExperienceInput,
    }: {
      experienceIds: string[];
      updateExperienceInput: UpdateExperienceInput;
    }) =>
      execute(updateManyExperiences, {
        experienceIds,
        updateExperienceInput,
      }),
    mutationKey: ["updateManyExperiences"],
  });
}

export function useRemoveOneExperience() {
  return useMutation({
    mutationFn: (experienceId: string) =>
      execute(removeOneExperience, { experienceId }),
    mutationKey: ["removeOneExperience"],
  });
}

export function useRemoveManyExperiences() {
  return useMutation({
    mutationFn: (experienceIds: string[]) =>
      execute(removeManyExperiences, { experienceIds }),
    mutationKey: ["removeManyExperiences"],
  });
}
