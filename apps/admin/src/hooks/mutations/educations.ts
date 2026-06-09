import { useMutation } from "@tanstack/react-query";
import { graphql } from "@/generated/graphql";
import type {
  CreateEducationInput,
  UpdateEducationInput,
} from "@/generated/graphql/graphql";
import { execute } from "@/lib/execute";

const createOneEducation = graphql(`
  mutation CreateOneEducation($createEducationInput: CreateEducationInput!) {
    createOneEducation(createEducationInput: $createEducationInput) {
      id
      slug
    }
  }
`);

const updateOneEducation = graphql(`
  mutation UpdateOneEducation(
    $educationId: ID!
    $updateEducationInput: UpdateEducationInput!
  ) {
    updateOneEducation(
      educationId: $educationId
      updateEducationInput: $updateEducationInput
    ) {
      id
      slug
    }
  }
`);

const updateManyEducations = graphql(`
  mutation UpdateManyEducations(
    $educationIds: [ID!]!
    $updateEducationInput: UpdateEducationInput!
  ) {
    updateManyEducations(
      educationIds: $educationIds
      updateEducationInput: $updateEducationInput
    ) {
      count
    }
  }
`);

const removeOneEducation = graphql(`
  mutation RemoveOneEducation($educationId: ID!) {
    removeOneEducation(educationId: $educationId) {
      id
      slug
    }
  }
`);

const removeManyEducations = graphql(`
  mutation RemoveManyEducations($educationIds: [ID!]!) {
    removeManyEducations(educationIds: $educationIds) {
      count
    }
  }
`);

export function useCreateOneEducation() {
  return useMutation({
    mutationKey: ["createOneEducation"],
    mutationFn: (createEducationInput: CreateEducationInput) =>
      execute(createOneEducation, { createEducationInput }),
  });
}

export function useUpdateOneEducation() {
  return useMutation({
    mutationKey: ["updateOneEducation"],
    mutationFn: ({
      educationId,
      updateEducationInput,
    }: {
      educationId: string;
      updateEducationInput: UpdateEducationInput;
    }) => execute(updateOneEducation, { educationId, updateEducationInput }),
  });
}

export function useUpdateManyEducations() {
  return useMutation({
    mutationKey: ["updateManyEducations"],
    mutationFn: ({
      educationIds,
      updateEducationInput,
    }: {
      educationIds: string[];
      updateEducationInput: UpdateEducationInput;
    }) => execute(updateManyEducations, { educationIds, updateEducationInput }),
  });
}

export function useRemoveOneEducation() {
  return useMutation({
    mutationKey: ["removeOneEducation"],
    mutationFn: (educationId: string) =>
      execute(removeOneEducation, { educationId }),
  });
}

export function useRemoveManyEducations() {
  return useMutation({
    mutationKey: ["removeManyEducations"],
    mutationFn: (educationIds: string[]) =>
      execute(removeManyEducations, { educationIds }),
  });
}
