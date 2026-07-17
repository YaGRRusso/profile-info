import { useMutation } from "@tanstack/react-query";
import { graphql } from "@/generated/graphql";
import type {
  CreateProjectInput,
  UpdateProjectInput,
} from "@/generated/graphql/graphql";
import { request } from "@/service/graphql";

const createOneProject = graphql(`
  mutation CreateOneProject($createProjectInput: CreateProjectInput!) {
    createOneProject(createProjectInput: $createProjectInput) {
      id
      slug
    }
  }
`);

const updateOneProject = graphql(`
  mutation UpdateOneProject(
    $projectId: ID!
    $updateProjectInput: UpdateProjectInput!
  ) {
    updateOneProject(
      projectId: $projectId
      updateProjectInput: $updateProjectInput
    ) {
      id
      slug
    }
  }
`);

const updateManyProjects = graphql(`
  mutation UpdateManyProjects(
    $projectIds: [ID!]!
    $updateProjectInput: UpdateProjectInput!
  ) {
    updateManyProjects(
      projectIds: $projectIds
      updateProjectInput: $updateProjectInput
    ) {
      succeeded
      failed
    }
  }
`);

const removeOneProject = graphql(`
  mutation RemoveOneProject($projectId: ID!) {
    removeOneProject(projectId: $projectId) {
      id
      slug
    }
  }
`);

const removeManyProjects = graphql(`
  mutation RemoveManyProjects($projectIds: [ID!]!) {
    removeManyProjects(projectIds: $projectIds) {
      succeeded
      failed
    }
  }
`);

export function useCreateOneProject() {
  return useMutation({
    mutationFn: (createProjectInput: CreateProjectInput) =>
      request(createOneProject, { createProjectInput }),
    mutationKey: ["createOneProject"],
  });
}

export function useUpdateOneProject() {
  return useMutation({
    mutationFn: ({
      projectId,
      updateProjectInput,
    }: {
      projectId: string;
      updateProjectInput: UpdateProjectInput;
    }) => request(updateOneProject, { projectId, updateProjectInput }),
    mutationKey: ["updateOneProject"],
  });
}

export function useUpdateManyProjects() {
  return useMutation({
    mutationFn: ({
      projectIds,
      updateProjectInput,
    }: {
      projectIds: string[];
      updateProjectInput: UpdateProjectInput;
    }) => request(updateManyProjects, { projectIds, updateProjectInput }),
    mutationKey: ["updateManyProjects"],
  });
}

export function useRemoveOneProject() {
  return useMutation({
    mutationFn: (projectId: string) => request(removeOneProject, { projectId }),
    mutationKey: ["removeOneProject"],
  });
}

export function useRemoveManyProjects() {
  return useMutation({
    mutationFn: (projectIds: string[]) =>
      request(removeManyProjects, { projectIds }),
    mutationKey: ["removeManyProjects"],
  });
}
