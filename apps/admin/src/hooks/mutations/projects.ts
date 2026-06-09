import { useMutation } from "@tanstack/react-query";
import { graphql } from "@/generated/graphql";
import type {
  CreateProjectInput,
  UpdateProjectInput,
} from "@/generated/graphql/graphql";
import { execute } from "@/lib/execute";

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
      count
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
      count
    }
  }
`);

export function useCreateOneProject() {
  return useMutation({
    mutationKey: ["createOneProject"],
    mutationFn: (createProjectInput: CreateProjectInput) =>
      execute(createOneProject, { createProjectInput }),
  });
}

export function useUpdateOneProject() {
  return useMutation({
    mutationKey: ["updateOneProject"],
    mutationFn: ({
      projectId,
      updateProjectInput,
    }: {
      projectId: string;
      updateProjectInput: UpdateProjectInput;
    }) => execute(updateOneProject, { projectId, updateProjectInput }),
  });
}

export function useUpdateManyProjects() {
  return useMutation({
    mutationKey: ["updateManyProjects"],
    mutationFn: ({
      projectIds,
      updateProjectInput,
    }: {
      projectIds: string[];
      updateProjectInput: UpdateProjectInput;
    }) => execute(updateManyProjects, { projectIds, updateProjectInput }),
  });
}

export function useRemoveOneProject() {
  return useMutation({
    mutationKey: ["removeOneProject"],
    mutationFn: (projectId: string) => execute(removeOneProject, { projectId }),
  });
}

export function useRemoveManyProjects() {
  return useMutation({
    mutationKey: ["removeManyProjects"],
    mutationFn: (projectIds: string[]) =>
      execute(removeManyProjects, { projectIds }),
  });
}
