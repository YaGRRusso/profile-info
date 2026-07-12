import {
  ArrowsClockwiseIcon,
  CopyIcon,
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
import { TextInput } from "@/components/inputs/text";
import {
  ApiTokenForm,
  type ApiTokenSchema,
  apiTokenToForm,
  apiTokenToInput,
} from "@/forms/api-token";
import { ApiTokenMultiForm } from "@/forms/api-token-multi";
import type { CommonFormValuesProps } from "@/forms/common";
import { useQueryAllPages } from "@/hooks/custom/use-query-all-pages";
import {
  useCreateOneApiToken,
  useRemoveManyApiTokens,
  useRemoveOneApiToken,
  useUpdateManyApiTokens,
  useUpdateOneApiToken,
} from "@/hooks/mutations/api-tokens";
import {
  type ApiTokenRow,
  useFindManyApiTokens,
} from "@/hooks/queries/api-tokens";
import { cn } from "@/lib/cn";
import { pageHelp } from "@/lib/page-help";
import { ApiTokensTable } from "./-components/table";

export const Route = createFileRoute("/_authenticated/_sidebar/api-tokens/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { t: tAction } = useTranslation("actions");
  const { t: tAlert } = useTranslation("alerts");
  const { t: tPage } = useTranslation("pages");
  const { t: tHelp } = useTranslation("help");
  const entity = tPage("apiTokens.entity");
  const entityPlural = tPage("apiTokens.entityPlural");
  const [formValues, setFormValues] =
    useState<CommonFormValuesProps<ApiTokenSchema, ApiTokenRow[]>>();
  const [createdToken, setCreatedToken] = useState<string>();

  const findManyApiTokens = useFindManyApiTokens();
  useQueryAllPages(findManyApiTokens);

  const createOneApiToken = useCreateOneApiToken();
  const updateOneApiToken = useUpdateOneApiToken();
  const updateManyApiTokens = useUpdateManyApiTokens();
  const removeOneApiToken = useRemoveOneApiToken();
  const removeManyApiTokens = useRemoveManyApiTokens();

  const closeAndRefetch = useCallback(() => {
    setFormValues(undefined);
    findManyApiTokens.refetch();
  }, [findManyApiTokens.refetch]);

  const selectedApiTokenIds = useMemo(
    () =>
      (formValues?.customValues ?? [])
        .map((token) => token?.id)
        .filter((tokenId): tokenId is string => Boolean(tokenId)),
    [formValues?.customValues]
  );

  const handleSubmit = useCallback(
    (data: ApiTokenSchema) => {
      switch (formValues?.state) {
        case "CREATING":
          createOneApiToken.mutate(apiTokenToInput(data), {
            onSuccess: (response) => {
              closeAndRefetch();
              setCreatedToken(response.createOneApiToken.token);
              toast.success(tAlert("created", { entity }));
            },
          });
          break;
        case "UPDATING":
          updateOneApiToken.mutate(
            {
              apiTokenId: selectedApiTokenIds[0],
              updateApiTokenInput: apiTokenToInput(data),
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
      createOneApiToken.mutate,
      closeAndRefetch,
      formValues?.state,
      updateOneApiToken.mutate,
      selectedApiTokenIds,
    ]
  );

  const handleDelete = useCallback(() => {
    switch (formValues?.state) {
      case "DELETING":
        removeOneApiToken.mutate(selectedApiTokenIds[0], {
          onSuccess: () => {
            closeAndRefetch();
            toast.success(tAlert("deleted", { entity }));
          },
        });
        break;
      case "MULTI_DELETING":
        removeManyApiTokens.mutate(selectedApiTokenIds, {
          onSuccess: (data) => {
            closeAndRefetch();
            toast.success(
              tAlert("batchDeleted", {
                count: data.removeManyApiTokens.succeeded,
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
    removeOneApiToken,
    selectedApiTokenIds,
    closeAndRefetch,
    removeManyApiTokens,
    entityPlural,
  ]);

  const copyCreatedToken = useCallback(async () => {
    if (!createdToken) return;

    try {
      await navigator.clipboard.writeText(createdToken);
      toast.success(tAlert("tokenCopySuccess"));
    } catch {
      toast.error(tAlert("tokenCopyFailed"));
    }
  }, [createdToken, tAlert]);

  return (
    <div className="flex flex-col gap-4">
      <PageTitle
        actions={[
          {
            icon: (
              <ArrowsClockwiseIcon
                className={cn(findManyApiTokens.isFetching && "animate-spin")}
              />
            ),
            className: "btn-ghost btn-square",
            onClick: () => findManyApiTokens.refetch(),
            disabled: findManyApiTokens.isFetching,
          },
          {
            icon: <PlusIcon />,
            label: tPage("apiTokens.newButton"),
            className: "btn-soft",
            onClick: () => setFormValues({ state: "CREATING" }),
          },
        ]}
        description={tPage("apiTokens.manageDescription")}
        help={pageHelp(tHelp, "apiTokens")}
        title={tPage("apiTokens.manageTitle")}
      />

      <Modal
        description={tPage("shared.modalFillDetails")}
        isOpen={
          formValues?.state === "CREATING" || formValues?.state === "UPDATING"
        }
        onClose={() => setFormValues(undefined)}
        title={tPage("apiTokens.modalManage")}
      >
        <ApiTokenForm
          customValues={formValues?.customValues}
          defaultValues={formValues?.defaultValues}
          isLoading={createOneApiToken.isPending || updateOneApiToken.isPending}
          onCancel={() => setFormValues(undefined)}
          onSubmit={handleSubmit}
          state={formValues?.state}
        />
      </Modal>

      <Modal
        actions={[
          {
            label: tAction("close"),
            className: "btn-ghost",
            onClick: () => setCreatedToken(undefined),
          },
          {
            label: tAction("copyToken"),
            className: "btn-soft btn-primary",
            icon: <CopyIcon />,
            onClick: () => copyCreatedToken(),
          },
        ]}
        description={tPage("shared.newApiTokenDescription")}
        isOpen={Boolean(createdToken)}
        onClose={() => setCreatedToken(undefined)}
        title={tPage("shared.newApiTokenTitle")}
      >
        <TextInput
          className="font-mono text-xs"
          readOnly
          value={createdToken ?? ""}
        />
      </Modal>

      <Modal
        description={tPage("shared.modalBatchUpdateDescription", {
          count: formValues?.customValues?.length ?? 0,
          entityPlural,
        })}
        isOpen={formValues?.state === "MULTI_UPDATING"}
        onClose={() => setFormValues(undefined)}
        title={tPage("apiTokens.modalBatchUpdate")}
      >
        <ApiTokenMultiForm
          isLoading={updateManyApiTokens.isPending}
          onCancel={() => setFormValues(undefined)}
          onSubmit={(updateApiTokenInput) =>
            updateManyApiTokens.mutate(
              { apiTokenIds: selectedApiTokenIds, updateApiTokenInput },
              {
                onSuccess: (data) => {
                  closeAndRefetch();
                  toast.success(
                    tAlert("batchUpdated", {
                      count: data.updateManyApiTokens.succeeded,
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
        title={tPage("apiTokens.modalRead")}
      >
        {formValues?.customValues?.map((token) => (
          <Json data={token} key={token?.id} />
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
              removeOneApiToken.isPending || removeManyApiTokens.isPending,
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
          {formValues?.customValues?.map((token) => (
            <li className="badge badge-sm badge-soft" key={token?.id}>
              {token?.name}
            </li>
          ))}
        </ul>
      </Modal>

      <DataState
        isEmpty={findManyApiTokens.data?.nodes.length === 0}
        isFetching={findManyApiTokens.isFetching}
        isLoading={findManyApiTokens.isPending}
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
          <ApiTokensTable
            data={findManyApiTokens.data?.nodes ?? []}
            onDelete={(token) =>
              setFormValues({
                state: "DELETING",
                customValues: [token],
              })
            }
            onEdit={(token) =>
              setFormValues({
                defaultValues: apiTokenToForm(token),
                state: "UPDATING",
                customValues: [token],
              })
            }
            onMultiDelete={(tokens) =>
              setFormValues({
                state: "MULTI_DELETING",
                customValues: tokens,
              })
            }
            onMultiEdit={(tokens) =>
              setFormValues({
                state: "MULTI_UPDATING",
                customValues: tokens,
              })
            }
            onMultiView={(tokens) =>
              setFormValues({
                state: "MULTI_READING",
                customValues: tokens,
              })
            }
            onView={(token) =>
              setFormValues({
                state: "READING",
                customValues: [token],
              })
            }
          />
        </DataState.Content>
      </DataState>
    </div>
  );
}
