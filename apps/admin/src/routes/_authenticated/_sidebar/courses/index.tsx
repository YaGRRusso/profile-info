import {
  ArrowsClockwiseIcon,
  PlusIcon,
  WarningIcon,
} from "@phosphor-icons/react";
import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
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
import { pageHelp } from "@/lib/page-help";
import { CoursesTable } from "./-components/table";

export const Route = createFileRoute("/_authenticated/_sidebar/courses/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { t: tAction } = useTranslation("actions");
  const { t: tAlert } = useTranslation("alerts");
  const { t: tPage } = useTranslation("pages");
  const { t: tHelp } = useTranslation("help");
  const entity = tPage("courses.entity");
  const entityPlural = tPage("courses.entityPlural");
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
              toast.success(tAlert("created", { entity }));
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
                toast.success(tAlert("updated", { entity }));
              },
            }
          );
          break;
        default:
          break;
      }
    },
    [
      tAlert,
      entity,
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
            toast.success(tAlert("deleted", { entity }));
          },
        });
        break;
      case "MULTI_DELETING":
        removeManyCourses.mutate(selectedCourseIds, {
          onSuccess: (data) => {
            closeAndRefetch();
            toast.success(
              tAlert("batchDeleted", {
                count: data.removeManyCourses.succeeded,
                entityPlural,
              })
            );
          },
        });
        break;
      default:
        break;
    }
  }, [
    tAlert,
    entity,
    formValues?.state,
    removeOneCourse,
    selectedCourseIds,
    closeAndRefetch,
    removeManyCourses,
    entityPlural,
  ]);

  return (
    <div className="flex flex-col gap-4">
      <PageTitle
        actions={[
          {
            className: "btn-ghost btn-square",
            disabled: findManyCourses.isFetching,
            icon: (
              <ArrowsClockwiseIcon
                className={cn(findManyCourses.isFetching && "animate-spin")}
              />
            ),
            onClick: () => findManyCourses.refetch(),
          },
          {
            className: "btn-soft",
            icon: <PlusIcon />,
            label: tPage("courses.newButton"),
            onClick: () => setFormValues({ state: "CREATING" }),
          },
        ]}
        description={tPage("courses.manageDescription")}
        help={pageHelp(tHelp, "courses")}
        title={tPage("courses.manageTitle")}
      />

      <Modal
        description={tPage("shared.modalFillDetails")}
        isOpen={
          formValues?.state === "CREATING" || formValues?.state === "UPDATING"
        }
        onClose={() => setFormValues(undefined)}
        title={tPage("courses.modalManage")}
      >
        <CourseForm
          customValues={formValues?.customValues}
          defaultValues={formValues?.defaultValues}
          isLoading={createOneCourse.isPending || updateOneCourse.isPending}
          onCancel={() => setFormValues(undefined)}
          onSubmit={handleSubmit}
          slugsList={findManyCourses.data?.nodes
            .map((course) => course.slug)
            .filter((slug): slug is string => slug !== null && slug !== "")}
          state={formValues?.state}
        />
      </Modal>

      <Modal
        description={tPage("shared.modalBatchUpdateDescription", {
          count: formValues?.customValues?.length ?? 0,
          entityPlural,
        })}
        isOpen={formValues?.state === "MULTI_UPDATING"}
        onClose={() => setFormValues(undefined)}
        title={tPage("courses.modalBatchUpdate")}
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
                    tAlert("batchUpdated", {
                      count: data.updateManyCourses.succeeded,
                      entityPlural,
                    })
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
            className: "btn-ghost",
            label: tAction("close"),
            onClick: () => setFormValues(undefined),
          },
        ]}
        description={tPage("shared.modalReadDescription", { entity })}
        isOpen={
          formValues?.state === "READING" ||
          formValues?.state === "MULTI_READING"
        }
        onClose={() => setFormValues(undefined)}
        title={tPage("courses.modalRead")}
      >
        {formValues?.customValues?.map((course) => (
          <Json data={course} key={course?.id} />
        ))}
      </Modal>

      <Modal
        actions={[
          {
            className: "btn-ghost",
            label: tAction("cancel"),
            onClick: () => setFormValues(undefined),
          },
          {
            className: "btn-soft btn-error",
            disabled: removeOneCourse.isPending || removeManyCourses.isPending,
            label: tAction("confirm"),
            onClick: () => handleDelete(),
          },
        ]}
        description={tPage("shared.deleteDescription", { entityPlural })}
        isOpen={
          formValues?.state === "MULTI_DELETING" ||
          formValues?.state === "DELETING"
        }
        onClose={() => setFormValues(undefined)}
        title={tPage("shared.deleteTitle", { entityPlural })}
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
            description={tPage("shared.emptyDescription", { entity })}
            icon={<WarningIcon weight="bold" />}
            title={tPage("shared.emptyTitle")}
          />
        </DataState.Empty>

        <DataState.Content>
          <CoursesTable
            data={findManyCourses.data?.nodes ?? []}
            onDelete={(course) =>
              setFormValues({
                customValues: [course],
                state: "DELETING",
              })
            }
            onEdit={(course) =>
              setFormValues({
                customValues: [course],
                defaultValues: courseToForm(course),
                state: "UPDATING",
              })
            }
            onMultiDelete={(courses) =>
              setFormValues({
                customValues: courses,
                state: "MULTI_DELETING",
              })
            }
            onMultiEdit={(courses) =>
              setFormValues({
                customValues: courses,
                state: "MULTI_UPDATING",
              })
            }
            onMultiView={(courses) =>
              setFormValues({
                customValues: courses,
                state: "MULTI_READING",
              })
            }
            onView={(course) =>
              setFormValues({
                customValues: [course],
                state: "READING",
              })
            }
          />
        </DataState.Content>
      </DataState>
    </div>
  );
}
