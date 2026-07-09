import {
  ArrowsClockwiseIcon,
  CopyIcon,
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
import { TextInput } from "@/components/inputs/text";
import { PAGE_HELP } from "@/consts/page-help";
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
import { ApiTokensTable } from "./-components/table";

export const Route = createFileRoute("/_authenticated/_sidebar/api-tokens/")({
  component: RouteComponent,
});

function RouteComponent() {
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
              toast.success("API token created successfully");
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
                toast.success("API token updated successfully");
              },
            }
          );
          break;
        default:
          break;
      }
    },
    [
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
            toast.success("API token deleted successfully");
          },
        });
        break;
      case "MULTI_DELETING":
        removeManyApiTokens.mutate(selectedApiTokenIds, {
          onSuccess: (data) => {
            closeAndRefetch();
            toast.success(
              `${data.removeManyApiTokens.succeeded} API tokens deleted successfully`
            );
          },
        });
        break;
      default:
        break;
    }
  }, [
    formValues?.state,
    removeOneApiToken,
    selectedApiTokenIds,
    closeAndRefetch,
    removeManyApiTokens,
  ]);

  const copyCreatedToken = useCallback(async () => {
    if (!createdToken) return;

    try {
      await navigator.clipboard.writeText(createdToken);
      toast.success("Token copied to clipboard");
    } catch {
      toast.error("Failed to copy token to clipboard");
    }
  }, [createdToken]);

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
            label: "New API Token",
            className: "btn-soft",
            onClick: () => setFormValues({ state: "CREATING" }),
          },
        ]}
        description="Create, update or delete API tokens for programmatic access to your data."
        help={PAGE_HELP.apiTokens}
        title="Manage API Tokens"
      />

      <Modal
        description="Fill the details below and submit."
        isOpen={
          formValues?.state === "CREATING" || formValues?.state === "UPDATING"
        }
        onClose={() => setFormValues(undefined)}
        title="Manage API Token"
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
            label: "Close",
            className: "btn-ghost",
            onClick: () => setCreatedToken(undefined),
          },
          {
            label: "Copy token",
            className: "btn-soft btn-primary",
            icon: <CopyIcon />,
            onClick: () => copyCreatedToken(),
          },
        ]}
        description="Copy this token now. You will not be able to see it again."
        isOpen={Boolean(createdToken)}
        onClose={() => setCreatedToken(undefined)}
        title="Your new API token"
      >
        <TextInput
          className="font-mono text-xs"
          readOnly
          value={createdToken ?? ""}
        />
      </Modal>

      <Modal
        description={`Update the fields below to apply them to all ${formValues?.customValues?.length ?? 0} selected API tokens.`}
        isOpen={formValues?.state === "MULTI_UPDATING"}
        onClose={() => setFormValues(undefined)}
        title="Update API Tokens"
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
                    `${data.updateManyApiTokens.succeeded} API tokens updated successfully`
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
        description="Read only view of the API token."
        isOpen={
          formValues?.state === "READING" ||
          formValues?.state === "MULTI_READING"
        }
        onClose={() => setFormValues(undefined)}
        title="Read API Token"
      >
        {formValues?.customValues?.map((token) => (
          <Json data={token} key={token?.id} />
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
              removeOneApiToken.isPending || removeManyApiTokens.isPending,
            onClick: () => handleDelete(),
          },
        ]}
        description="Are you sure you want to delete the following API tokens?"
        isOpen={
          formValues?.state === "MULTI_DELETING" ||
          formValues?.state === "DELETING"
        }
        onClose={() => setFormValues(undefined)}
        title="Delete API tokens?"
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
            description="Try refreshing the page or create a new API token."
            icon={<WarningIcon weight="bold" />}
            title="Nothing found!"
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
