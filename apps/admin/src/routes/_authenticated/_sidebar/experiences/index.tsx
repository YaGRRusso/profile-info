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
  ExperienceForm,
  type ExperienceSchema,
  experienceToForm,
  experienceToInput,
} from "@/forms/experience";
import { ExperienceMultiForm } from "@/forms/experience-multi";
import { useQueryAllPages } from "@/hooks/custom/use-query-all-pages";
import {
  useCreateOneExperience,
  useRemoveManyExperiences,
  useRemoveOneExperience,
  useUpdateManyExperiences,
  useUpdateOneExperience,
} from "@/hooks/mutations/experiences";
import {
  type ExperienceRow,
  useFindManyExperiences,
} from "@/hooks/queries/experiences";
import { cn } from "@/lib/cn";
import { pageHelp } from "@/lib/page-help";
import { ExperiencesTable } from "./-components/table";

export const Route = createFileRoute("/_authenticated/_sidebar/experiences/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { t: tAction } = useTranslation("actions");
  const { t: tAlert } = useTranslation("alerts");
  const { t: tPage } = useTranslation("pages");
  const { t: tHelp } = useTranslation("help");
  const entity = tPage("experiences.entity");
  const entityPlural = tPage("experiences.entityPlural");
  const [formValues, setFormValues] =
    useState<CommonFormValuesProps<ExperienceSchema, ExperienceRow[]>>();

  const findManyExperiences = useFindManyExperiences();
  useQueryAllPages(findManyExperiences);

  const createOneExperience = useCreateOneExperience();
  const updateOneExperience = useUpdateOneExperience();
  const updateManyExperiences = useUpdateManyExperiences();
  const removeOneExperience = useRemoveOneExperience();
  const removeManyExperiences = useRemoveManyExperiences();

  const closeAndRefetch = useCallback(() => {
    setFormValues(undefined);
    findManyExperiences.refetch();
  }, [findManyExperiences.refetch]);

  const selectedExperienceIds = useMemo(
    () =>
      (formValues?.customValues ?? [])
        .map((experience) => experience?.id)
        .filter((experienceId): experienceId is string =>
          Boolean(experienceId)
        ),
    [formValues?.customValues]
  );

  const handleSubmit = useCallback(
    (data: ExperienceSchema) => {
      switch (formValues?.state) {
        case "CREATING":
          createOneExperience.mutate(experienceToInput(data), {
            onSuccess: () => {
              closeAndRefetch();
              toast.success(tAlert("created", { entity }));
            },
          });
          break;
        case "UPDATING":
          updateOneExperience.mutate(
            {
              experienceId: selectedExperienceIds[0],
              updateExperienceInput: experienceToInput(data),
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
      createOneExperience.mutate,
      closeAndRefetch,
      formValues?.state,
      updateOneExperience.mutate,
      selectedExperienceIds,
    ]
  );

  const handleDelete = useCallback(() => {
    switch (formValues?.state) {
      case "DELETING":
        removeOneExperience.mutate(selectedExperienceIds[0], {
          onSuccess: () => {
            closeAndRefetch();
            toast.success(tAlert("deleted", { entity }));
          },
        });
        break;
      case "MULTI_DELETING":
        removeManyExperiences.mutate(selectedExperienceIds, {
          onSuccess: (data) => {
            closeAndRefetch();
            toast.success(
              tAlert("batchDeleted", {
                count: data.removeManyExperiences.succeeded,
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
    removeOneExperience,
    selectedExperienceIds,
    closeAndRefetch,
    removeManyExperiences,
    entityPlural,
  ]);

  return (
    <div className="flex flex-col gap-4">
      <PageTitle
        actions={[
          {
            icon: (
              <ArrowsClockwiseIcon
                className={cn(findManyExperiences.isFetching && "animate-spin")}
              />
            ),
            className: "btn-ghost btn-square",
            onClick: () => findManyExperiences.refetch(),
            disabled: findManyExperiences.isFetching,
          },
          {
            icon: <PlusIcon />,
            label: tPage("experiences.newButton"),
            className: "btn-soft",
            onClick: () => setFormValues({ state: "CREATING" }),
          },
        ]}
        description={tPage("experiences.manageDescription")}
        help={pageHelp(tHelp, "experiences")}
        title={tPage("experiences.manageTitle")}
      />

      <Modal
        description={tPage("shared.modalFillDetails")}
        isOpen={
          formValues?.state === "CREATING" || formValues?.state === "UPDATING"
        }
        onClose={() => setFormValues(undefined)}
        title={tPage("experiences.modalManage")}
      >
        <ExperienceForm
          customValues={formValues?.customValues}
          defaultValues={formValues?.defaultValues}
          isLoading={
            createOneExperience.isPending || updateOneExperience.isPending
          }
          onCancel={() => setFormValues(undefined)}
          onSubmit={handleSubmit}
          // slugsList={findManyExperiences.data?.nodes
          //   .map((experience) => experience.slug)
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
        title={tPage("experiences.modalBatchUpdate")}
      >
        <ExperienceMultiForm
          isLoading={updateManyExperiences.isPending}
          onCancel={() => setFormValues(undefined)}
          onSubmit={(updateExperienceInput) =>
            updateManyExperiences.mutate(
              { experienceIds: selectedExperienceIds, updateExperienceInput },
              {
                onSuccess: (data) => {
                  closeAndRefetch();
                  toast.success(
                    tAlert("batchUpdated", {
                      count: data.updateManyExperiences.succeeded,
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
        title={tPage("experiences.modalRead")}
      >
        {formValues?.customValues?.map((experience) => (
          <Json data={experience} key={experience?.id} />
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
              removeOneExperience.isPending || removeManyExperiences.isPending,
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
          {formValues?.customValues?.map((experience) => (
            <li className="badge badge-sm badge-soft" key={experience?.id}>
              {experience?.slug}
            </li>
          ))}
        </ul>
      </Modal>

      <DataState
        isEmpty={findManyExperiences.data?.nodes.length === 0}
        isFetching={findManyExperiences.isFetching}
        isLoading={findManyExperiences.isPending}
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
          <ExperiencesTable
            data={findManyExperiences.data?.nodes ?? []}
            onDelete={(experience) =>
              setFormValues({
                state: "DELETING",
                customValues: [experience],
              })
            }
            onEdit={(experience) =>
              setFormValues({
                defaultValues: experienceToForm(experience),
                state: "UPDATING",
                customValues: [experience],
              })
            }
            onMultiDelete={(experiences) =>
              setFormValues({
                state: "MULTI_DELETING",
                customValues: experiences,
              })
            }
            onMultiEdit={(experiences) =>
              setFormValues({
                state: "MULTI_UPDATING",
                customValues: experiences,
              })
            }
            onMultiView={(experiences) =>
              setFormValues({
                state: "MULTI_READING",
                customValues: experiences,
              })
            }
            onView={(experience) =>
              setFormValues({
                state: "READING",
                customValues: [experience],
              })
            }
          />
        </DataState.Content>
      </DataState>
    </div>
  );
}
