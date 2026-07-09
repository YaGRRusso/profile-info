import {
  ArrowsClockwiseIcon,
  PlusIcon,
  WarningIcon,
} from "@phosphor-icons/react";
import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { Alert } from "@/components/display/alert";
import { DataState } from "@/components/display/data-state";
import { Json } from "@/components/display/json";
import { Modal } from "@/components/display/modal";
import { PageTitle } from "@/components/display/page-title";
import type { CommonFormValuesProps } from "@/forms/common";
import {
  CourseForm,
  type CourseSchema,
  courseToForm,
  courseToInput,
} from "@/forms/course";
import { CourseMultiForm } from "@/forms/course-multi";
import { useQueryAllPages } from "@/hooks/custom/use-query-all-pages";
import {
  useCreateOneCourse,
  useRemoveManyCourses,
  useRemoveOneCourse,
  useUpdateManyCourses,
  useUpdateOneCourse,
} from "@/hooks/mutations/courses";
import { type CourseRow, useFindManyCourses } from "@/hooks/queries/courses";
import { cn } from "@/lib/cn";
import { CoursesTable } from "./-components/table";

export const Route = createFileRoute("/_authenticated/_sidebar/courses/")({
  component: RouteComponent,
});

function RouteComponent() {
  const [formValues, setFormValues] =
    useState<CommonFormValuesProps<CourseSchema, CourseRow[]>>();

  const findManyCourses = useFindManyCourses();
  useQueryAllPages(findManyCourses);

  const createOneCourse = useCreateOneCourse();
  const updateOneCourse = useUpdateOneCourse();
  const updateManyCourses = useUpdateManyCourses();
  const removeOneCourse = useRemoveOneCourse();
  const removeManyCourses = useRemoveManyCourses();

  const closeAndRefetch = useCallback(() => {
    setFormValues(undefined);
    findManyCourses.refetch();
  }, [findManyCourses.refetch]);

  const selectedCourseIds = useMemo(
    () =>
      (formValues?.customValues ?? [])
        .map((course) => course?.id)
        .filter((courseId): courseId is string => Boolean(courseId)),
    [formValues?.customValues]
  );

  const handleSubmit = useCallback(
    (data: CourseSchema) => {
      switch (formValues?.state) {
        case "CREATING":
          createOneCourse.mutate(courseToInput(data), {
            onSuccess: () => {
              closeAndRefetch();
              toast.success("Course created successfully");
            },
          });
          break;
        case "UPDATING":
          updateOneCourse.mutate(
            {
              courseId: selectedCourseIds[0],
              updateCourseInput: courseToInput(data),
            },
            {
              onSuccess: () => {
                closeAndRefetch();
                toast.success("Course updated successfully");
              },
            }
          );
          break;
        default:
          break;
      }
    },
    [
      createOneCourse.mutate,
      closeAndRefetch,
      formValues?.state,
      updateOneCourse.mutate,
      selectedCourseIds,
    ]
  );

  const handleDelete = useCallback(() => {
    switch (formValues?.state) {
      case "DELETING":
        removeOneCourse.mutate(selectedCourseIds[0], {
          onSuccess: () => {
            closeAndRefetch();
            toast.success("Course deleted successfully");
          },
        });
        break;
      case "MULTI_DELETING":
        removeManyCourses.mutate(selectedCourseIds, {
          onSuccess: (data) => {
            closeAndRefetch();
            toast.success(
              `${data.removeManyCourses.succeeded} courses deleted successfully`
            );
          },
        });
        break;
      default:
        break;
    }
  }, [
    formValues?.state,
    removeOneCourse,
    selectedCourseIds,
    closeAndRefetch,
    removeManyCourses,
  ]);

  return (
    <div className="flex flex-col gap-4">
      <PageTitle
        actions={[
          {
            icon: (
              <ArrowsClockwiseIcon
                className={cn(findManyCourses.isFetching && "animate-spin")}
              />
            ),
            className: "btn-ghost btn-square",
            onClick: () => findManyCourses.refetch(),
            disabled: findManyCourses.isFetching,
          },
          {
            icon: <PlusIcon />,
            label: "New Course",
            className: "btn-soft",
            onClick: () => setFormValues({ state: "CREATING" }),
          },
        ]}
        description="Create, update or delete courses, bootcamps and certificates of your profile."
        title="Manage Courses"
      />

      <Modal
        description="Fill the details below and submit."
        isOpen={
          formValues?.state === "CREATING" || formValues?.state === "UPDATING"
        }
        onClose={() => setFormValues(undefined)}
        title="Manage Course"
      >
        <CourseForm
          customValues={formValues?.customValues}
          defaultValues={formValues?.defaultValues}
          isLoading={createOneCourse.isPending || updateOneCourse.isPending}
          onCancel={() => setFormValues(undefined)}
          onSubmit={handleSubmit}
          slugsList={findManyCourses.data?.nodes.map((course) => course.slug)}
          state={formValues?.state}
        />
      </Modal>

      <Modal
        description={`Update the fields below to apply them to all ${formValues?.customValues?.length ?? 0} selected courses.`}
        isOpen={formValues?.state === "MULTI_UPDATING"}
        onClose={() => setFormValues(undefined)}
        title="Update Courses"
      >
        <CourseMultiForm
          isLoading={updateManyCourses.isPending}
          onCancel={() => setFormValues(undefined)}
          onSubmit={(updateCourseInput) =>
            updateManyCourses.mutate(
              { courseIds: selectedCourseIds, updateCourseInput },
              {
                onSuccess: (data) => {
                  closeAndRefetch();
                  toast.success(
                    `${data.updateManyCourses.succeeded} courses updated successfully`
                  );
                },
              }
            )
          }
          state={formValues?.state}
        />
      </Modal>

      <Modal
        actions={[
          {
            label: "Close",
            className: "btn-ghost",
            onClick: () => setFormValues(undefined),
          },
        ]}
        description="Read only view of the course."
        isOpen={
          formValues?.state === "READING" ||
          formValues?.state === "MULTI_READING"
        }
        onClose={() => setFormValues(undefined)}
        title="Read Course"
      >
        {formValues?.customValues?.map((course) => (
          <Json data={course} key={course?.id} />
        ))}
      </Modal>

      <Modal
        actions={[
          {
            label: "Cancel",
            className: "btn-ghost",
            onClick: () => setFormValues(undefined),
          },
          {
            label: "Confirm",
            className: "btn-soft btn-error",
            disabled: removeOneCourse.isPending || removeManyCourses.isPending,
            onClick: () => handleDelete(),
          },
        ]}
        description="Are you sure you want to delete the following courses?"
        isOpen={
          formValues?.state === "MULTI_DELETING" ||
          formValues?.state === "DELETING"
        }
        onClose={() => setFormValues(undefined)}
        title="Delete courses?"
      >
        <ul className="flex flex-wrap items-center gap-1">
          {formValues?.customValues?.map((course) => (
            <li className="badge badge-sm badge-soft" key={course?.id}>
              {course?.slug}
            </li>
          ))}
        </ul>
      </Modal>

      <DataState
        isEmpty={findManyCourses.data?.nodes.length === 0}
        isFetching={findManyCourses.isFetching}
        isLoading={findManyCourses.isPending}
      >
        <DataState.Loading>
          <div className="skeleton h-96 w-full" />
        </DataState.Loading>

        <DataState.Empty>
          <Alert
            description="Try refreshing the page or create a new course."
            icon={<WarningIcon weight="bold" />}
            title="Nothing found!"
          />
        </DataState.Empty>

        <DataState.Content>
          <CoursesTable
            data={findManyCourses.data?.nodes ?? []}
            onDelete={(course) =>
              setFormValues({
                state: "DELETING",
                customValues: [course],
              })
            }
            onEdit={(course) =>
              setFormValues({
                defaultValues: courseToForm(course),
                state: "UPDATING",
                customValues: [course],
              })
            }
            onMultiDelete={(courses) =>
              setFormValues({
                state: "MULTI_DELETING",
                customValues: courses,
              })
            }
            onMultiEdit={(courses) =>
              setFormValues({
                state: "MULTI_UPDATING",
                customValues: courses,
              })
            }
            onMultiView={(courses) =>
              setFormValues({
                state: "MULTI_READING",
                customValues: courses,
              })
            }
            onView={(course) =>
              setFormValues({
                state: "READING",
                customValues: [course],
              })
            }
          />
        </DataState.Content>
      </DataState>
    </div>
  );
}
