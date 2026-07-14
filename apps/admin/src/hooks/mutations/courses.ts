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
      succeeded
      failed
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
      succeeded
      failed
    }
  }
`);

export function useCreateOneCourse() {
  return useMutation({
    mutationFn: (createCourseInput: CreateCourseInput) =>
      execute(createOneCourse, { createCourseInput }),
    mutationKey: ["createOneCourse"],
  });
}

export function useUpdateOneCourse() {
  return useMutation({
    mutationFn: ({
      courseId,
      updateCourseInput,
    }: {
      courseId: string;
      updateCourseInput: UpdateCourseInput;
    }) => execute(updateOneCourse, { courseId, updateCourseInput }),
    mutationKey: ["updateOneCourse"],
  });
}

export function useUpdateManyCourses() {
  return useMutation({
    mutationFn: ({
      courseIds,
      updateCourseInput,
    }: {
      courseIds: string[];
      updateCourseInput: UpdateCourseInput;
    }) => execute(updateManyCourses, { courseIds, updateCourseInput }),
    mutationKey: ["updateManyCourses"],
  });
}

export function useRemoveOneCourse() {
  return useMutation({
    mutationFn: (courseId: string) => execute(removeOneCourse, { courseId }),
    mutationKey: ["removeOneCourse"],
  });
}

export function useRemoveManyCourses() {
  return useMutation({
    mutationFn: (courseIds: string[]) =>
      execute(removeManyCourses, { courseIds }),
    mutationKey: ["removeManyCourses"],
  });
}
