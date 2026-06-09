import { useMutation } from "@tanstack/react-query";
import { graphql } from "@/generated/graphql";
import type {
  CreateCourseInput,
  UpdateCourseInput,
} from "@/generated/graphql/graphql";
import { execute } from "@/lib/execute";

const createOneCourse = graphql(`
  mutation CreateOneCourse($createCourseInput: CreateCourseInput!) {
    createOneCourse(createCourseInput: $createCourseInput) {
      id
      slug
    }
  }
`);

const updateOneCourse = graphql(`
  mutation UpdateOneCourse(
    $courseId: ID!
    $updateCourseInput: UpdateCourseInput!
  ) {
    updateOneCourse(courseId: $courseId, updateCourseInput: $updateCourseInput) {
      id
      slug
    }
  }
`);

const updateManyCourses = graphql(`
  mutation UpdateManyCourses(
    $courseIds: [ID!]!
    $updateCourseInput: UpdateCourseInput!
  ) {
    updateManyCourses(
      courseIds: $courseIds
      updateCourseInput: $updateCourseInput
    ) {
      count
    }
  }
`);

const removeOneCourse = graphql(`
  mutation RemoveOneCourse($courseId: ID!) {
    removeOneCourse(courseId: $courseId) {
      id
      slug
    }
  }
`);

const removeManyCourses = graphql(`
  mutation RemoveManyCourses($courseIds: [ID!]!) {
    removeManyCourses(courseIds: $courseIds) {
      count
    }
  }
`);

export function useCreateOneCourse() {
  return useMutation({
    mutationKey: ["createOneCourse"],
    mutationFn: (createCourseInput: CreateCourseInput) =>
      execute(createOneCourse, { createCourseInput }),
  });
}

export function useUpdateOneCourse() {
  return useMutation({
    mutationKey: ["updateOneCourse"],
    mutationFn: ({
      courseId,
      updateCourseInput,
    }: {
      courseId: string;
      updateCourseInput: UpdateCourseInput;
    }) => execute(updateOneCourse, { courseId, updateCourseInput }),
  });
}

export function useUpdateManyCourses() {
  return useMutation({
    mutationKey: ["updateManyCourses"],
    mutationFn: ({
      courseIds,
      updateCourseInput,
    }: {
      courseIds: string[];
      updateCourseInput: UpdateCourseInput;
    }) => execute(updateManyCourses, { courseIds, updateCourseInput }),
  });
}

export function useRemoveOneCourse() {
  return useMutation({
    mutationKey: ["removeOneCourse"],
    mutationFn: (courseId: string) => execute(removeOneCourse, { courseId }),
  });
}

export function useRemoveManyCourses() {
  return useMutation({
    mutationKey: ["removeManyCourses"],
    mutationFn: (courseIds: string[]) =>
      execute(removeManyCourses, { courseIds }),
  });
}
