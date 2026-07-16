import {
  ArrowsClockwiseIcon,
  PlusIcon,
  WarningIcon,
} from "@phosphor-icons/react";
import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Alert } from "@/components/display/alert";
import { DataState } from "@/components/display/data-state";
import { Json } from "@/components/display/json";
import { Modal } from "@/components/display/modal";
import { PageTitle } from "@/components/display/page-title";
import type { CommonFormValuesProps } from "@/forms/common";
import {
  UserForm,
  type UserSchema,
  userToCreateInput,
  userToForm,
  userToUpdateInput,
} from "@/forms/user";
import { UserMultiForm } from "@/forms/user-multi";
import { UserRole } from "@/generated/graphql/graphql";
import { useQueryAllPages } from "@/hooks/custom/use-query-all-pages";
import {
  useCreateOneUser,
  useDisableManyUsers,
  useDisableOneUser,
  useEnableManyUsers,
  useEnableOneUser,
  useRemoveManyUsers,
  useRemoveOneUser,
  useUpdateManyUsers,
  useUpdateOneUser,
} from "@/hooks/mutations/users";
import { type UserRow, useFindManyUsers } from "@/hooks/queries/users";
import { cn } from "@/lib/cn";
import { pageHelp } from "@/lib/page-help";
import { requireRoles } from "@/lib/require-roles";
import { UsersTable } from "./-components/table";

export const Route = createFileRoute("/_authenticated/_sidebar/users/")({
  beforeLoad: requireRoles(UserRole.SuperAdmin),
  component: RouteComponent,
});

function RouteComponent() {
  const { t: tAction } = useTranslation("actions");
  const { t: tAlert } = useTranslation("alerts");
  const { t: tPage } = useTranslation("pages");
  const { t: tHelp } = useTranslation("help");
  const entity = tPage("users.entity");
  const entityPlural = tPage("users.entityPlural");
  const [formValues, setFormValues] =
    useState<CommonFormValuesProps<UserSchema, UserRow[]>>();
  const findManyUsers = useFindManyUsers();
  useQueryAllPages(findManyUsers);
  const createOneUser = useCreateOneUser();
  const updateOneUser = useUpdateOneUser();
  const updateManyUsers = useUpdateManyUsers();
  const enableOneUser = useEnableOneUser();
  const enableManyUsers = useEnableManyUsers();
  const disableOneUser = useDisableOneUser();
  const disableManyUsers = useDisableManyUsers();
  const removeOneUser = useRemoveOneUser();
  const removeManyUsers = useRemoveManyUsers();
  const closeForm = useCallback(() => setFormValues(undefined), []);
  const selectedUserIds = useMemo(
    () =>
      (formValues?.customValues ?? [])
        .map((user) => user?.id)
        .filter((userId): userId is string => Boolean(userId)),
    [formValues?.customValues]
  );
  const onSuccess = useCallback(
    (key: "created" | "updated" | "deleted" | "enabled" | "disabled") => {
      closeForm();
      toast.success(tAlert(key, { entity }));
    },
    [closeForm, entity, tAlert]
  );

  const handleSubmit = (data: UserSchema) => {
    if (formValues?.state === "CREATING") {
      createOneUser.mutate(userToCreateInput(data), {
        onSuccess: () => onSuccess("created"),
      });
    }
    if (formValues?.state === "UPDATING") {
      updateOneUser.mutate(
        {
          updateUserInput: userToUpdateInput(data),
          userId: selectedUserIds[0],
        },
        { onSuccess: () => onSuccess("updated") }
      );
    }
  };

  const handleLifecycle = (kind: "enable" | "disable" | "remove") => {
    const isMany = formValues?.state?.startsWith("MULTI_");

    if (kind === "enable" && isMany) {
      enableManyUsers.mutate(selectedUserIds, {
        onSuccess: (data) => {
          closeForm();
          toast.success(
            tAlert("batchEnabled", {
              count: data.updateManyUsers.succeeded,
              entityPlural,
            })
          );
        },
      });
      return;
    }
    if (kind === "disable" && isMany) {
      disableManyUsers.mutate(selectedUserIds, {
        onSuccess: (data) => {
          closeForm();
          toast.success(
            tAlert("batchDisabled", {
              count: data.updateManyUsers.succeeded,
              entityPlural,
            })
          );
        },
      });
      return;
    }
    if (kind === "remove" && isMany) {
      removeManyUsers.mutate(selectedUserIds, {
        onSuccess: (data) => {
          closeForm();
          toast.success(
            tAlert("batchDeleted", {
              count: data.removeManyUsers.succeeded,
              entityPlural,
            })
          );
        },
      });
      return;
    }
    if (kind === "enable") {
      enableOneUser.mutate(selectedUserIds[0], {
        onSuccess: () => onSuccess("enabled"),
      });
      return;
    }
    if (kind === "disable") {
      disableOneUser.mutate(selectedUserIds[0], {
        onSuccess: () => onSuccess("disabled"),
      });
      return;
    }
    removeOneUser.mutate(selectedUserIds[0], {
      onSuccess: () => onSuccess("deleted"),
    });
  };

  const lifecycleUsers = (
    <ul className="flex flex-wrap gap-1">
      {formValues?.customValues?.map((user) => (
        <li className="badge badge-sm badge-soft" key={user?.id}>
          {user?.name}
        </li>
      ))}
    </ul>
  );

  return (
    <div className="flex flex-col gap-4">
      <PageTitle
        actions={[
          {
            className: "btn-ghost btn-square",
            disabled: findManyUsers.isFetching,
            icon: (
              <ArrowsClockwiseIcon
                className={cn(findManyUsers.isFetching && "animate-spin")}
              />
            ),
            onClick: () => findManyUsers.refetch(),
          },
          {
            className: "btn-soft",
            icon: <PlusIcon />,
            label: tPage("users.newButton"),
            onClick: () => setFormValues({ state: "CREATING" }),
          },
        ]}
        description={tPage("users.manageDescription")}
        help={pageHelp(tHelp, "users")}
        title={tPage("users.manageTitle")}
      />
      <Modal
        description={tPage("shared.modalFillDetails")}
        isOpen={
          formValues?.state === "CREATING" || formValues?.state === "UPDATING"
        }
        onClose={closeForm}
        title={tPage("users.modalManage")}
      >
        <UserForm
          defaultValues={formValues?.defaultValues}
          isLoading={createOneUser.isPending || updateOneUser.isPending}
          onCancel={closeForm}
          onSubmit={handleSubmit}
          state={formValues?.state}
        />
      </Modal>
      <Modal
        description={tPage("shared.modalBatchUpdateDescription", {
          count: selectedUserIds.length,
          entityPlural,
        })}
        isOpen={formValues?.state === "MULTI_UPDATING"}
        onClose={closeForm}
        title={tPage("users.modalBatchUpdate")}
      >
        <UserMultiForm
          isLoading={updateManyUsers.isPending}
          onCancel={closeForm}
          onSubmit={(updateUserInput) =>
            updateManyUsers.mutate(
              { updateUserInput, userIds: selectedUserIds },
              {
                onSuccess: (data) => {
                  closeForm();
                  toast.success(
                    tAlert("batchUpdated", {
                      count: data.updateManyUsers.succeeded,
                      entityPlural,
                    })
                  );
                },
              }
            )
          }
        />
      </Modal>
      <Modal
        actions={[
          {
            className: "btn-ghost",
            label: tAction("close"),
            onClick: closeForm,
          },
        ]}
        description={tPage("shared.modalReadDescription", { entity })}
        isOpen={
          formValues?.state === "READING" ||
          formValues?.state === "MULTI_READING"
        }
        onClose={closeForm}
        title={tPage("users.modalRead")}
      >
        {formValues?.customValues?.map((user) => (
          <Json data={user} key={user?.id} />
        ))}
      </Modal>
      <Modal
        actions={[
          {
            className: "btn-ghost",
            label: tAction("cancel"),
            onClick: closeForm,
          },
          {
            className: "btn-soft btn-success",
            disabled: enableOneUser.isPending || enableManyUsers.isPending,
            label: tAction("confirm"),
            onClick: () => handleLifecycle("enable"),
          },
        ]}
        description={tPage("shared.enableDescription", { entityPlural })}
        isOpen={
          formValues?.state === "ENABLING" ||
          formValues?.state === "MULTI_ENABLING"
        }
        onClose={closeForm}
        title={tPage("shared.enableTitle", { entityPlural })}
      >
        {lifecycleUsers}
      </Modal>
      <Modal
        actions={[
          {
            className: "btn-ghost",
            label: tAction("cancel"),
            onClick: closeForm,
          },
          {
            className: "btn-soft btn-error",
            disabled: disableOneUser.isPending || disableManyUsers.isPending,
            label: tAction("confirm"),
            onClick: () => handleLifecycle("disable"),
          },
        ]}
        description={tPage("shared.disableDescription", { entityPlural })}
        isOpen={
          formValues?.state === "DISABLING" ||
          formValues?.state === "MULTI_DISABLING"
        }
        onClose={closeForm}
        title={tPage("shared.disableTitle", { entityPlural })}
      >
        {lifecycleUsers}
      </Modal>
      <Modal
        actions={[
          {
            className: "btn-ghost",
            label: tAction("cancel"),
            onClick: closeForm,
          },
          {
            className: "btn-soft btn-error",
            disabled: removeOneUser.isPending || removeManyUsers.isPending,
            label: tAction("confirm"),
            onClick: () => handleLifecycle("remove"),
          },
        ]}
        description={tPage("shared.deleteDescription", { entityPlural })}
        isOpen={
          formValues?.state === "DELETING" ||
          formValues?.state === "MULTI_DELETING"
        }
        onClose={closeForm}
        title={tPage("shared.deleteTitle", { entityPlural })}
      >
        {lifecycleUsers}
      </Modal>
      <DataState
        isEmpty={findManyUsers.data?.nodes.length === 0}
        isFetching={findManyUsers.isFetching}
        isLoading={findManyUsers.isPending}
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
          <UsersTable
            data={findManyUsers.data?.nodes ?? []}
            onDisable={(user) =>
              setFormValues({ customValues: [user], state: "DISABLING" })
            }
            onEdit={(user) =>
              setFormValues({
                customValues: [user],
                defaultValues: userToForm(user),
                state: "UPDATING",
              })
            }
            onEnable={(user) =>
              setFormValues({ customValues: [user], state: "ENABLING" })
            }
            onMultiDisable={(users) =>
              setFormValues({ customValues: users, state: "MULTI_DISABLING" })
            }
            onMultiEdit={(users) =>
              setFormValues({ customValues: users, state: "MULTI_UPDATING" })
            }
            onMultiEnable={(users) =>
              setFormValues({ customValues: users, state: "MULTI_ENABLING" })
            }
            onMultiRemove={(users) =>
              setFormValues({ customValues: users, state: "MULTI_DELETING" })
            }
            onMultiView={(users) =>
              setFormValues({ customValues: users, state: "MULTI_READING" })
            }
            onRemove={(user) =>
              setFormValues({ customValues: [user], state: "DELETING" })
            }
            onView={(user) =>
              setFormValues({ customValues: [user], state: "READING" })
            }
          />
        </DataState.Content>
      </DataState>
    </div>
  );
}
