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
  OrganizationForm,
  type OrganizationSchema,
  organizationToForm,
  organizationToInput,
} from "@/forms/organization";
import { OrganizationMultiForm } from "@/forms/organization-multi";
import { useQueryAllPages } from "@/hooks/custom/use-query-all-pages";
import {
  useCreateOneOrganization,
  useRemoveManyOrganizations,
  useRemoveOneOrganization,
  useUpdateManyOrganizations,
  useUpdateOneOrganization,
} from "@/hooks/mutations/organizations";
import {
  type OrganizationRow,
  useFindManyOrganizations,
} from "@/hooks/queries/organizations";
import { cn } from "@/lib/cn";
import { OrganizationsTable } from "./-components/table";

export const Route = createFileRoute("/_authenticated/_sidebar/organizations/")(
  {
    component: RouteComponent,
  }
);

function RouteComponent() {
  const [formValues, setFormValues] =
    useState<CommonFormValuesProps<OrganizationSchema, OrganizationRow[]>>();

  const findManyOrganizations = useFindManyOrganizations();
  useQueryAllPages(findManyOrganizations);

  const createOneOrganization = useCreateOneOrganization();
  const updateOneOrganization = useUpdateOneOrganization();
  const updateManyOrganizations = useUpdateManyOrganizations();
  const removeOneOrganization = useRemoveOneOrganization();
  const removeManyOrganizations = useRemoveManyOrganizations();

  const closeAndRefetch = useCallback(() => {
    setFormValues(undefined);
    findManyOrganizations.refetch();
  }, [findManyOrganizations.refetch]);

  const selectedOrganizationIds = useMemo(
    () =>
      (formValues?.customValues ?? [])
        .map((organization) => organization?.id)
        .filter((organizationId): organizationId is string =>
          Boolean(organizationId)
        ),
    [formValues?.customValues]
  );

  const handleSubmit = useCallback(
    (data: OrganizationSchema) => {
      switch (formValues?.state) {
        case "CREATING":
          createOneOrganization.mutate(organizationToInput(data), {
            onSuccess: () => {
              closeAndRefetch();
              toast.success("Organization created successfully");
            },
          });
          break;
        case "UPDATING":
          updateOneOrganization.mutate(
            {
              organizationId: selectedOrganizationIds[0],
              updateOrganizationInput: organizationToInput(data),
            },
            {
              onSuccess: () => {
                closeAndRefetch();
                toast.success("Organization updated successfully");
              },
            }
          );
          break;
        default:
          break;
      }
    },
    [
      createOneOrganization.mutate,
      closeAndRefetch,
      formValues?.state,
      updateOneOrganization.mutate,
      selectedOrganizationIds,
    ]
  );

  const handleDelete = useCallback(() => {
    switch (formValues?.state) {
      case "DELETING":
        removeOneOrganization.mutate(selectedOrganizationIds[0], {
          onSuccess: () => {
            closeAndRefetch();
            toast.success("Organization deleted successfully");
          },
        });
        break;
      case "MULTI_DELETING":
        removeManyOrganizations.mutate(selectedOrganizationIds, {
          onSuccess: (data) => {
            closeAndRefetch();
            toast.success(
              `${data.removeManyOrganizations.count} organizations deleted successfully`
            );
          },
        });
        break;
      default:
        break;
    }
  }, [
    formValues?.state,
    removeOneOrganization,
    selectedOrganizationIds,
    closeAndRefetch,
    removeManyOrganizations,
  ]);

  return (
    <div className="flex flex-col gap-4">
      <PageTitle
        actions={[
          {
            icon: (
              <ArrowsClockwiseIcon
                className={cn(
                  findManyOrganizations.isFetching && "animate-spin"
                )}
              />
            ),
            className: "btn-ghost btn-square",
            onClick: () => findManyOrganizations.refetch(),
            disabled: findManyOrganizations.isFetching,
          },
          {
            icon: <PlusIcon />,
            label: "New Organization",
            className: "btn-soft",
            onClick: () => setFormValues({ state: "CREATING" }),
          },
        ]}
        description="Create, update or delete organizations referenced across your profile."
        title="Manage Organizations"
      />

      <Modal
        description="Fill the details below and submit."
        isOpen={
          formValues?.state === "CREATING" || formValues?.state === "UPDATING"
        }
        onClose={() => setFormValues(undefined)}
        title="Manage Organization"
      >
        <OrganizationForm
          customValues={formValues?.customValues}
          defaultValues={formValues?.defaultValues}
          isLoading={
            createOneOrganization.isPending || updateOneOrganization.isPending
          }
          onCancel={() => setFormValues(undefined)}
          onSubmit={handleSubmit}
          state={formValues?.state}
        />
      </Modal>

      <Modal
        description={`Update the fields below to apply them to all ${formValues?.customValues?.length ?? 0} selected organizations.`}
        isOpen={formValues?.state === "MULTI_UPDATING"}
        onClose={() => setFormValues(undefined)}
        title="Update Organizations"
      >
        <OrganizationMultiForm
          isLoading={updateManyOrganizations.isPending}
          onCancel={() => setFormValues(undefined)}
          onSubmit={(updateOrganizationInput) =>
            updateManyOrganizations.mutate(
              {
                organizationIds: selectedOrganizationIds,
                updateOrganizationInput,
              },
              {
                onSuccess: (data) => {
                  closeAndRefetch();
                  toast.success(
                    `${data.updateManyOrganizations.count} organizations updated successfully`
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
        description="Read only view of the organization."
        isOpen={
          formValues?.state === "READING" ||
          formValues?.state === "MULTI_READING"
        }
        onClose={() => setFormValues(undefined)}
        title="Read Organization"
      >
        {formValues?.customValues?.map((organization) => (
          <Json data={organization} key={organization?.id} />
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
              removeOneOrganization.isPending ||
              removeManyOrganizations.isPending,
            onClick: () => handleDelete(),
          },
        ]}
        description="Are you sure you want to delete the following organizations?"
        isOpen={
          formValues?.state === "MULTI_DELETING" ||
          formValues?.state === "DELETING"
        }
        onClose={() => setFormValues(undefined)}
        title="Delete organizations?"
      >
        <ul className="flex flex-wrap items-center gap-1">
          {formValues?.customValues?.map((organization) => (
            <li className="badge badge-sm badge-soft" key={organization?.id}>
              {organization?.name}
            </li>
          ))}
        </ul>
      </Modal>

      <DataState
        isEmpty={findManyOrganizations.data?.nodes.length === 0}
        isFetching={findManyOrganizations.isFetching}
        isLoading={findManyOrganizations.isPending}
      >
        <DataState.Loading>
          <div className="skeleton h-96 w-full" />
        </DataState.Loading>

        <DataState.Empty>
          <Alert
            description="Try refreshing the page or create a new organization."
            icon={<WarningIcon weight="bold" />}
            title="Nothing found!"
          />
        </DataState.Empty>

        <DataState.Content>
          <OrganizationsTable
            data={findManyOrganizations.data?.nodes ?? []}
            onDelete={(organization) =>
              setFormValues({
                state: "DELETING",
                customValues: [organization],
              })
            }
            onEdit={(organization) =>
              setFormValues({
                defaultValues: organizationToForm(organization),
                state: "UPDATING",
                customValues: [organization],
              })
            }
            onMultiDelete={(organizations) =>
              setFormValues({
                state: "MULTI_DELETING",
                customValues: organizations,
              })
            }
            onMultiEdit={(organizations) =>
              setFormValues({
                state: "MULTI_UPDATING",
                customValues: organizations,
              })
            }
            onMultiView={(organizations) =>
              setFormValues({
                state: "MULTI_READING",
                customValues: organizations,
              })
            }
            onView={(organization) =>
              setFormValues({
                state: "READING",
                customValues: [organization],
              })
            }
          />
        </DataState.Content>
      </DataState>
    </div>
  );
}
