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
import { EducationForm, type EducationSchema } from "@/forms/education";
import { EducationMultiForm } from "@/forms/education-multi";
import type { CreateEducationInput } from "@/graphql/graphql";
import { useQueryAllPages } from "@/hooks/custom/use-query-all-pages";
import {
  useCreateOneEducation,
  useRemoveManyEducations,
  useRemoveOneEducation,
  useUpdateManyEducations,
  useUpdateOneEducation,
} from "@/hooks/mutations/educations";
import { useFindManyEducations } from "@/hooks/queries/educations";
import { cn } from "@/lib/cn";
import { type EducationRow, EducationsTable } from "./-components/table";

export const Route = createFileRoute("/_authenticated/_sidebar/educations/")({
  component: RouteComponent,
});

function toEducationInput(data: EducationSchema): CreateEducationInput {
  return {
    slug: data.slug,
    organization: data.organization,
    level: data.level,
    status: data.status,
    relevance: data.relevance,
    url: data.url || undefined,
    image: data.image || undefined,
    i18n: [
      {
        locale: data.locale,
        messages: { title: data.title, description: data.description },
      },
    ],
  };
}

function toEducationDefaults(
  education: EducationRow
): Partial<EducationSchema> {
  return {
    slug: education.slug,
    organization: education.organization?.id ?? "",
    level: education.level,
    status: education.status,
    relevance: education.relevance ?? 1,
    url: education.url ?? "",
    image: education.image ?? "",
    locale: education.i18n?.[0]?.locale ?? "en",
    title: education.i18n?.[0]?.messages?.title ?? "",
    description: education.i18n?.[0]?.messages?.description ?? "",
  };
}

function RouteComponent() {
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
          createOneEducation.mutate(toEducationInput(data), {
            onSuccess: () => {
              closeAndRefetch();
              toast.success("Education created successfully");
            },
          });
          break;
        case "UPDATING":
          updateOneEducation.mutate(
            {
              educationId: selectedEducationIds[0],
              updateEducationInput: toEducationInput(data),
            },
            {
              onSuccess: () => {
                closeAndRefetch();
                toast.success("Education updated successfully");
              },
            }
          );
          break;
        default:
          break;
      }
    },
    [
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
            toast.success("Education deleted successfully");
          },
        });
        break;
      case "MULTI_DELETING":
        removeManyEducations.mutate(selectedEducationIds, {
          onSuccess: (data) => {
            closeAndRefetch();
            toast.success(
              `${data.removeManyEducations.count} educations deleted successfully`
            );
          },
        });
        break;
      default:
        break;
    }
  }, [
    formValues?.state,
    removeOneEducation,
    selectedEducationIds,
    closeAndRefetch,
    removeManyEducations,
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
            label: "New Education",
            className: "btn-soft",
            onClick: () => setFormValues({ state: "CREATING" }),
          },
        ]}
        description="Create, update or delete academic degrees of your profile."
        title="Manage Educations"
      />

      <Modal
        description="Fill the details below and submit."
        isOpen={
          formValues?.state === "CREATING" || formValues?.state === "UPDATING"
        }
        onClose={() => setFormValues(undefined)}
        title="Manage Education"
      >
        <EducationForm
          customValues={formValues?.customValues}
          defaultValues={formValues?.defaultValues}
          isLoading={
            createOneEducation.isPending || updateOneEducation.isPending
          }
          onCancel={() => setFormValues(undefined)}
          onSubmit={handleSubmit}
          state={formValues?.state}
        />
      </Modal>

      <Modal
        description={`Update the fields below to apply them to all ${formValues?.customValues?.length ?? 0} selected educations.`}
        isOpen={formValues?.state === "MULTI_UPDATING"}
        onClose={() => setFormValues(undefined)}
        title="Update Educations"
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
                    `${data.updateManyEducations.count} educations updated successfully`
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
        description="Read only view of the education."
        isOpen={
          formValues?.state === "READING" ||
          formValues?.state === "MULTI_READING"
        }
        onClose={() => setFormValues(undefined)}
        title="Read Education"
      >
        {formValues?.customValues?.map((education) => (
          <Json data={education} key={education?.id} />
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
              removeOneEducation.isPending || removeManyEducations.isPending,
            onClick: () => handleDelete(),
          },
        ]}
        description="Are you sure you want to delete the following educations?"
        isOpen={
          formValues?.state === "MULTI_DELETING" ||
          formValues?.state === "DELETING"
        }
        onClose={() => setFormValues(undefined)}
        title="Delete educations?"
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
            description="Try refreshing the page or create a new education."
            icon={<WarningIcon weight="bold" />}
            title="Nothing found!"
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
                defaultValues: toEducationDefaults(education),
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
