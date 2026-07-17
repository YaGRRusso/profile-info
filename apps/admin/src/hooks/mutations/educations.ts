import { useMutation } from "@tanstack/react-query";
import { graphql } from "@/generated/graphql";
import type {
  CreateEducationInput,
  UpdateEducationInput,
} from "@/generated/graphql/graphql";
import { request } from "@/service/graphql";

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
      succeeded
      failed
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
      succeeded
      failed
    }
  }
`);

export function useCreateOneEducation() {
  return useMutation({
    mutationFn: (createEducationInput: CreateEducationInput) =>
      request(createOneEducation, { createEducationInput }),
    mutationKey: ["createOneEducation"],
  });
}

export function useUpdateOneEducation() {
  return useMutation({
    mutationFn: ({
      educationId,
      updateEducationInput,
    }: {
      educationId: string;
      updateEducationInput: UpdateEducationInput;
    }) => request(updateOneEducation, { educationId, updateEducationInput }),
    mutationKey: ["updateOneEducation"],
  });
}

export function useUpdateManyEducations() {
  return useMutation({
    mutationFn: ({
      educationIds,
      updateEducationInput,
    }: {
      educationIds: string[];
      updateEducationInput: UpdateEducationInput;
    }) =>
      request(updateManyEducations, {
        educationIds,
        updateEducationInput,
      }),
    mutationKey: ["updateManyEducations"],
  });
}

export function useRemoveOneEducation() {
  return useMutation({
    mutationFn: (educationId: string) =>
      request(removeOneEducation, { educationId }),
    mutationKey: ["removeOneEducation"],
  });
}

export function useRemoveManyEducations() {
  return useMutation({
    mutationFn: (educationIds: string[]) =>
      request(removeManyEducations, { educationIds }),
    mutationKey: ["removeManyEducations"],
  });
}
