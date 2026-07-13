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
import { pageHelp } from "@/lib/page-help";
import { OrganizationsTable } from "./-components/table";

export const Route = createFileRoute("/_authenticated/_sidebar/organizations/")(
  {
    component: RouteComponent,
  }
);

function RouteComponent() {
  const { t: tAction } = useTranslation("actions");
  const { t: tAlert } = useTranslation("alerts");
  const { t: tPage } = useTranslation("pages");
  const { t: tHelp } = useTranslation("help");
  const entity = tPage("organizations.entity");
  const entityPlural = tPage("organizations.entityPlural");
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
  const removeOneOrganization = useRemoveOneOrganization();
  const removeManyOrganizations = useRemoveManyOrganizations();

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
              toast.success(tAlert("created", { entity }));
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
            toast.success(tAlert("disabled", { entity }));
          },
        });
        break;
      case "MULTI_DISABLING":
        disableManyOrganizations.mutate(selectedOrganizationIds, {
          onSuccess: (data) => {
            closeForm();
            toast.success(
              tAlert("batchDisabled", {
                count: data.disableManyOrganizations.succeeded,
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
    disableOneOrganization,
    selectedOrganizationIds,
    closeForm,
    disableManyOrganizations,
    entityPlural,
  ]);

  const handleEnable = useCallback(() => {
    switch (formValues?.state) {
      case "ENABLING":
        enableOneOrganization.mutate(selectedOrganizationIds[0], {
          onSuccess: () => {
            closeForm();
            toast.success(tAlert("enabled", { entity }));
          },
        });
        break;
      case "MULTI_ENABLING":
        enableManyOrganizations.mutate(selectedOrganizationIds, {
          onSuccess: (data) => {
            closeForm();
            toast.success(
              tAlert("batchEnabled", {
                count: data.enableManyOrganizations.succeeded,
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
    enableOneOrganization,
    selectedOrganizationIds,
    closeForm,
    enableManyOrganizations,
    entityPlural,
  ]);

  const handleDelete = useCallback(() => {
    switch (formValues?.state) {
      case "DELETING":
        removeOneOrganization.mutate(selectedOrganizationIds[0], {
          onSuccess: () => {
            closeForm();
            toast.success(tAlert("deleted", { entity }));
          },
        });
        break;
      case "MULTI_DELETING":
        removeManyOrganizations.mutate(selectedOrganizationIds, {
          onSuccess: (data) => {
            closeForm();
            toast.success(
              tAlert("batchDeleted", {
                count: data.removeManyOrganizations.succeeded,
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
    removeOneOrganization,
    selectedOrganizationIds,
    closeForm,
    removeManyOrganizations,
    entityPlural,
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
            label: tPage("organizations.newButton"),
            className: "btn-soft",
            onClick: () => setFormValues({ state: "CREATING" }),
          },
        ]}
        description={tPage("organizations.manageDescription")}
        help={pageHelp(tHelp, "organizations")}
        title={tPage("organizations.manageTitle")}
      />

      <Modal
        description={tPage("shared.modalFillDetails")}
        isOpen={
          formValues?.state === "CREATING" || formValues?.state === "UPDATING"
        }
        onClose={() => setFormValues(undefined)}
        title={tPage("organizations.modalManage")}
      >
        <OrganizationForm
          customValues={formValues?.customValues}
          defaultValues={formValues?.defaultValues}
          isLoading={
            createOneOrganization.isPending || updateOneOrganization.isPending
          }
          onCancel={() => setFormValues(undefined)}
          onSubmit={handleSubmit}
          // slugsList={findManyOrganizations.data?.nodes
          //   .map((organization) => organization.slug)
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
        title={tPage("organizations.modalBatchUpdate")}
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
                    tAlert("batchUpdated", {
                      count: data.updateManyOrganizations.succeeded,
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
        title={tPage("organizations.modalRead")}
      >
        {formValues?.customValues?.map((organization) => (
          <Json data={organization} key={organization?.id} />
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
              disableOneOrganization.isPending ||
              disableManyOrganizations.isPending,
            onClick: () => handleDisable(),
          },
        ]}
        description={tPage("shared.disableDescription", { entityPlural })}
        isOpen={
          formValues?.state === "MULTI_DISABLING" ||
          formValues?.state === "DISABLING"
        }
        onClose={() => setFormValues(undefined)}
        title={tPage("shared.disableTitle", { entityPlural })}
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
            label: tAction("cancel"),
            className: "btn-ghost",
            onClick: () => setFormValues(undefined),
          },
          {
            label: tAction("confirm"),
            className: "btn-soft btn-success",
            disabled:
              enableOneOrganization.isPending ||
              enableManyOrganizations.isPending,
            onClick: () => handleEnable(),
          },
        ]}
        description={tPage("shared.enableDescription", { entityPlural })}
        isOpen={
          formValues?.state === "MULTI_ENABLING" ||
          formValues?.state === "ENABLING"
        }
        onClose={() => setFormValues(undefined)}
        title={tPage("shared.enableTitle", { entityPlural })}
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
            label: tAction("cancel"),
            className: "btn-ghost",
            onClick: () => setFormValues(undefined),
          },
          {
            label: tAction("confirm"),
            className: "btn-soft btn-error",
            disabled:
              removeOneOrganization.isPending ||
              removeManyOrganizations.isPending,
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
            description={tPage("shared.emptyDescription", { entity })}
            icon={<WarningIcon weight="bold" />}
            title={tPage("shared.emptyTitle")}
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
            onMultiRemove={(organizations) =>
              setFormValues({
                state: "MULTI_DELETING",
                customValues: organizations,
              })
            }
            onMultiView={(organizations) =>
              setFormValues({
                state: "MULTI_READING",
                customValues: organizations,
              })
            }
            onRemove={(organization) =>
              setFormValues({
                state: "DELETING",
                customValues: [organization],
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
