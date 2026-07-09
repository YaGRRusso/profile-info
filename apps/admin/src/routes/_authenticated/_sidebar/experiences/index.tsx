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
  ExperienceForm,
  type ExperienceSchema,
  experienceToForm,
  experienceToInput,
} from "@/forms/experience";
import { ExperienceMultiForm } from "@/forms/experience-multi";
import { usePageCopy } from "@/hooks/custom/use-page-copy";
import { usePageHelp } from "@/hooks/custom/use-page-help";
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
import { ExperiencesTable } from "./-components/table";

export const Route = createFileRoute("/_authenticated/_sidebar/experiences/")({
  component: RouteComponent,
});

function RouteComponent() {
  const page = usePageCopy("experiences");
  const help = usePageHelp("experiences");
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
              toast.success("Experience created successfully");
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
                toast.success("Experience updated successfully");
              },
            }
          );
          break;
        default:
          break;
      }
    },
    [
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
            toast.success("Experience deleted successfully");
          },
        });
        break;
      case "MULTI_DELETING":
        removeManyExperiences.mutate(selectedExperienceIds, {
          onSuccess: (data) => {
            closeAndRefetch();
            toast.success(
              `${data.removeManyExperiences.succeeded} experiences deleted successfully`
            );
          },
        });
        break;
      default:
        break;
    }
  }, [
    formValues?.state,
    removeOneExperience,
    selectedExperienceIds,
    closeAndRefetch,
    removeManyExperiences,
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
            label: "New Experience",
            className: "btn-soft",
            onClick: () => setFormValues({ state: "CREATING" }),
          },
        ]}
        description={page.manageDescription}
        help={help}
        title={page.manageTitle}
      />

      <Modal
        description={page.modalFillDetails}
        isOpen={
          formValues?.state === "CREATING" || formValues?.state === "UPDATING"
        }
        onClose={() => setFormValues(undefined)}
        title={page.modalManage}
      >
        <ExperienceForm
          customValues={formValues?.customValues}
          defaultValues={formValues?.defaultValues}
          isLoading={
            createOneExperience.isPending || updateOneExperience.isPending
          }
          onCancel={() => setFormValues(undefined)}
          onSubmit={handleSubmit}
          slugsList={findManyExperiences.data?.nodes.map(
            (experience) => experience.slug
          )}
          state={formValues?.state}
        />
      </Modal>

      <Modal
        description={page.batchUpdateDescription(
          formValues?.customValues?.length ?? 0
        )}
        isOpen={formValues?.state === "MULTI_UPDATING"}
        onClose={() => setFormValues(undefined)}
        title={page.modalBatchUpdate}
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
                    `${data.updateManyExperiences.succeeded} experiences updated successfully`
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
        description={page.modalReadDescription}
        isOpen={
          formValues?.state === "READING" ||
          formValues?.state === "MULTI_READING"
        }
        onClose={() => setFormValues(undefined)}
        title={page.modalRead}
      >
        {formValues?.customValues?.map((experience) => (
          <Json data={experience} key={experience?.id} />
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
            disabled:
              removeOneExperience.isPending || removeManyExperiences.isPending,
            onClick: () => handleDelete(),
          },
        ]}
        description={page.deleteDescription}
        isOpen={
          formValues?.state === "MULTI_DELETING" ||
          formValues?.state === "DELETING"
        }
        onClose={() => setFormValues(undefined)}
        title={page.deleteTitle}
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
            description={page.emptyDescription}
            icon={<WarningIcon weight="bold" />}
            title={page.emptyTitle}
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
