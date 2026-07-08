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
  useDisableManyOrganizations,
  useDisableOneOrganization,
  useEnableManyOrganizations,
  useEnableOneOrganization,
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
  const disableOneOrganization = useDisableOneOrganization();
  const disableManyOrganizations = useDisableManyOrganizations();
  const enableOneOrganization = useEnableOneOrganization();
  const enableManyOrganizations = useEnableManyOrganizations();

  const closeForm = useCallback(() => {
    setFormValues(undefined);
  }, []);

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
              closeForm();
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
                closeForm();
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
      closeForm,
      formValues?.state,
      updateOneOrganization.mutate,
      selectedOrganizationIds,
    ]
  );

  const handleDisable = useCallback(() => {
    switch (formValues?.state) {
      case "DISABLING":
        disableOneOrganization.mutate(selectedOrganizationIds[0], {
          onSuccess: () => {
            closeForm();
            toast.success("Organization disabled successfully");
          },
        });
        break;
      case "MULTI_DISABLING":
        disableManyOrganizations.mutate(selectedOrganizationIds, {
          onSuccess: (data) => {
            closeForm();
            toast.success(
              `${data.disableManyOrganizations.succeeded} organizations disabled successfully`
            );
          },
        });
        break;
      default:
        break;
    }
  }, [
    formValues?.state,
    disableOneOrganization,
    selectedOrganizationIds,
    closeForm,
    disableManyOrganizations,
  ]);

  const handleEnable = useCallback(() => {
    switch (formValues?.state) {
      case "ENABLING":
        enableOneOrganization.mutate(selectedOrganizationIds[0], {
          onSuccess: () => {
            closeForm();
            toast.success("Organization enabled successfully");
          },
        });
        break;
      case "MULTI_ENABLING":
        enableManyOrganizations.mutate(selectedOrganizationIds, {
          onSuccess: (data) => {
            closeForm();
            toast.success(
              `${data.enableManyOrganizations.succeeded} organizations enabled successfully`
            );
          },
        });
        break;
      default:
        break;
    }
  }, [
    formValues?.state,
    enableOneOrganization,
    selectedOrganizationIds,
    closeForm,
    enableManyOrganizations,
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
        description="Create, update, disable or enable organizations referenced across your profile."
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
          slugsList={findManyOrganizations.data?.nodes.map(
            (organization) => organization.slug
          )}
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
                  closeForm();
                  toast.success(
                    `${data.updateManyOrganizations.succeeded} organizations updated successfully`
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
              disableOneOrganization.isPending ||
              disableManyOrganizations.isPending,
            onClick: () => handleDisable(),
          },
        ]}
        description="Are you sure you want to disable the following organizations?"
        isOpen={
          formValues?.state === "MULTI_DISABLING" ||
          formValues?.state === "DISABLING"
        }
        onClose={() => setFormValues(undefined)}
        title="Disable organizations?"
      >
        <ul className="flex flex-wrap items-center gap-1">
          {formValues?.customValues?.map((organization) => (
            <li className="badge badge-sm badge-soft" key={organization?.id}>
              {organization?.name}
            </li>
          ))}
        </ul>
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
            className: "btn-soft btn-success",
            disabled:
              enableOneOrganization.isPending ||
              enableManyOrganizations.isPending,
            onClick: () => handleEnable(),
          },
        ]}
        description="Are you sure you want to enable the following organizations?"
        isOpen={
          formValues?.state === "MULTI_ENABLING" ||
          formValues?.state === "ENABLING"
        }
        onClose={() => setFormValues(undefined)}
        title="Enable organizations?"
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
            onDisable={(organization) =>
              setFormValues({
                state: "DISABLING",
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
            onEnable={(organization) =>
              setFormValues({
                state: "ENABLING",
                customValues: [organization],
              })
            }
            onMultiDisable={(organizations) =>
              setFormValues({
                state: "MULTI_DISABLING",
                customValues: organizations,
              })
            }
            onMultiEdit={(organizations) =>
              setFormValues({
                state: "MULTI_UPDATING",
                customValues: organizations,
              })
            }
            onMultiEnable={(organizations) =>
              setFormValues({
                state: "MULTI_ENABLING",
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
