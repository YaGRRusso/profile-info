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
  EducationForm,
  type EducationSchema,
  educationToForm,
  educationToInput,
} from "@/forms/education";
import { EducationMultiForm } from "@/forms/education-multi";
import { useQueryAllPages } from "@/hooks/custom/use-query-all-pages";
import {
  useCreateOneEducation,
  useRemoveManyEducations,
  useRemoveOneEducation,
  useUpdateManyEducations,
  useUpdateOneEducation,
} from "@/hooks/mutations/educations";
import {
  type EducationRow,
  useFindManyEducations,
} from "@/hooks/queries/educations";
import { cn } from "@/lib/cn";
import { pageHelp } from "@/lib/page-help";
import { EducationsTable } from "./-components/table";

export const Route = createFileRoute("/_authenticated/_sidebar/educations/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { t: tAction } = useTranslation("actions");
  const { t: tAlert } = useTranslation("alerts");
  const { t: tPage } = useTranslation("pages");
  const { t: tHelp } = useTranslation("help");
  const entity = tPage("educations.entity");
  const entityPlural = tPage("educations.entityPlural");
  const [formValues, setFormValues] =
    useState<CommonFormValuesProps<EducationSchema, EducationRow[]>>();

  const findManyEducations = useFindManyEducations();
  useQueryAllPages(findManyEducations);

  const createOneEducation = useCreateOneEducation();
  const updateOneEducation = useUpdateOneEducation();
  const updateManyEducations = useUpdateManyEducations();
  const removeOneEducation = useRemoveOneEducation();
  const removeManyEducations = useRemoveManyEducations();

  const closeAndRefetch = useCallback(() => {
    setFormValues(undefined);
    findManyEducations.refetch();
  }, [findManyEducations.refetch]);

  const selectedEducationIds = useMemo(
    () =>
      (formValues?.customValues ?? [])
        .map((education) => education?.id)
        .filter((educationId): educationId is string => Boolean(educationId)),
    [formValues?.customValues]
  );

  const handleSubmit = useCallback(
    (data: EducationSchema) => {
      switch (formValues?.state) {
        case "CREATING":
          createOneEducation.mutate(educationToInput(data), {
            onSuccess: () => {
              closeAndRefetch();
              toast.success(tAlert("created", { entity }));
            },
          });
          break;
        case "UPDATING":
          updateOneEducation.mutate(
            {
              educationId: selectedEducationIds[0],
              updateEducationInput: educationToInput(data),
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
      createOneEducation.mutate,
      closeAndRefetch,
      formValues?.state,
      updateOneEducation.mutate,
      selectedEducationIds,
    ]
  );

  const handleDelete = useCallback(() => {
    switch (formValues?.state) {
      case "DELETING":
        removeOneEducation.mutate(selectedEducationIds[0], {
          onSuccess: () => {
            closeAndRefetch();
            toast.success(tAlert("deleted", { entity }));
          },
        });
        break;
      case "MULTI_DELETING":
        removeManyEducations.mutate(selectedEducationIds, {
          onSuccess: (data) => {
            closeAndRefetch();
            toast.success(
              tAlert("batchDeleted", {
                count: data.removeManyEducations.succeeded,
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
    removeOneEducation,
    selectedEducationIds,
    closeAndRefetch,
    removeManyEducations,
    entityPlural,
  ]);

  return (
    <div className="flex flex-col gap-4">
      <PageTitle
        actions={[
          {
            icon: (
              <ArrowsClockwiseIcon
                className={cn(findManyEducations.isFetching && "animate-spin")}
              />
            ),
            className: "btn-ghost btn-square",
            onClick: () => findManyEducations.refetch(),
            disabled: findManyEducations.isFetching,
          },
          {
            icon: <PlusIcon />,
            label: tPage("educations.newButton"),
            className: "btn-soft",
            onClick: () => setFormValues({ state: "CREATING" }),
          },
        ]}
        description={tPage("educations.manageDescription")}
        help={pageHelp(tHelp, "educations")}
        title={tPage("educations.manageTitle")}
      />

      <Modal
        description={tPage("shared.modalFillDetails")}
        isOpen={
          formValues?.state === "CREATING" || formValues?.state === "UPDATING"
        }
        onClose={() => setFormValues(undefined)}
        title={tPage("educations.modalManage")}
      >
        <EducationForm
          customValues={formValues?.customValues}
          defaultValues={formValues?.defaultValues}
          isLoading={
            createOneEducation.isPending || updateOneEducation.isPending
          }
          onCancel={() => setFormValues(undefined)}
          onSubmit={handleSubmit}
          // slugsList={findManyEducations.data?.nodes
          //   .map((education) => education.slug)
          //   .filter((slug): slug is string => slug != null && slug !== "")}
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
        title={tPage("educations.modalBatchUpdate")}
      >
        <EducationMultiForm
          isLoading={updateManyEducations.isPending}
          onCancel={() => setFormValues(undefined)}
          onSubmit={(updateEducationInput) =>
            updateManyEducations.mutate(
              { educationIds: selectedEducationIds, updateEducationInput },
              {
                onSuccess: (data) => {
                  closeAndRefetch();
                  toast.success(
                    tAlert("batchUpdated", {
                      count: data.updateManyEducations.succeeded,
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
            label: tAction("close"),
            className: "btn-ghost",
            onClick: () => setFormValues(undefined),
          },
        ]}
        description={tPage("shared.modalReadDescription", { entity })}
        isOpen={
          formValues?.state === "READING" ||
          formValues?.state === "MULTI_READING"
        }
        onClose={() => setFormValues(undefined)}
        title={tPage("educations.modalRead")}
      >
        {formValues?.customValues?.map((education) => (
          <Json data={education} key={education?.id} />
        ))}
      </Modal>

      <Modal
        actions={[
          {
            label: tAction("cancel"),
            className: "btn-ghost",
            onClick: () => setFormValues(undefined),
          },
          {
            label: tAction("confirm"),
            className: "btn-soft btn-error",
            disabled:
              removeOneEducation.isPending || removeManyEducations.isPending,
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
          {formValues?.customValues?.map((education) => (
            <li className="badge badge-sm badge-soft" key={education?.id}>
              {education?.slug}
            </li>
          ))}
        </ul>
      </Modal>

      <DataState
        isEmpty={findManyEducations.data?.nodes.length === 0}
        isFetching={findManyEducations.isFetching}
        isLoading={findManyEducations.isPending}
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
          <EducationsTable
            data={findManyEducations.data?.nodes ?? []}
            onDelete={(education) =>
              setFormValues({
                state: "DELETING",
                customValues: [education],
              })
            }
            onEdit={(education) =>
              setFormValues({
                defaultValues: educationToForm(education),
                state: "UPDATING",
                customValues: [education],
              })
            }
            onMultiDelete={(educations) =>
              setFormValues({
                state: "MULTI_DELETING",
                customValues: educations,
              })
            }
            onMultiEdit={(educations) =>
              setFormValues({
                state: "MULTI_UPDATING",
                customValues: educations,
              })
            }
            onMultiView={(educations) =>
              setFormValues({
                state: "MULTI_READING",
                customValues: educations,
              })
            }
            onView={(education) =>
              setFormValues({
                state: "READING",
                customValues: [education],
              })
            }
          />
        </DataState.Content>
      </DataState>
    </div>
  );
}
