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
  ProjectForm,
  type ProjectSchema,
  projectToForm,
  projectToInput,
} from "@/forms/project";
import { ProjectMultiForm } from "@/forms/project-multi";
import { useQueryAllPages } from "@/hooks/custom/use-query-all-pages";
import {
  useCreateOneProject,
  useRemoveManyProjects,
  useRemoveOneProject,
  useUpdateManyProjects,
  useUpdateOneProject,
} from "@/hooks/mutations/projects";
import { type ProjectRow, useFindManyProjects } from "@/hooks/queries/projects";
import { cn } from "@/lib/cn";
import { isNonEmptyString } from "@/lib/empty-value";
import { pageHelp } from "@/lib/page-help";
import { ProjectsTable } from "./-components/table";

export const Route = createFileRoute("/_authenticated/_sidebar/projects/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { t: tAction } = useTranslation("actions");
  const { t: tAlert } = useTranslation("alerts");
  const { t: tPage } = useTranslation("pages");
  const { t: tHelp } = useTranslation("help");
  const entity = tPage("projects.entity");
  const entityPlural = tPage("projects.entityPlural");
  const [formValues, setFormValues] =
    useState<CommonFormValuesProps<ProjectSchema, ProjectRow[]>>();

  const findManyProjects = useFindManyProjects();
  useQueryAllPages(findManyProjects);

  const createOneProject = useCreateOneProject();
  const updateOneProject = useUpdateOneProject();
  const updateManyProjects = useUpdateManyProjects();
  const removeOneProject = useRemoveOneProject();
  const removeManyProjects = useRemoveManyProjects();

  const closeAndRefetch = useCallback(() => {
    setFormValues(undefined);
    findManyProjects.refetch();
  }, [findManyProjects.refetch]);

  const selectedProjectIds = useMemo(
    () =>
      (formValues?.customValues ?? [])
        .map((project) => project?.id)
        .filter((projectId): projectId is string => Boolean(projectId)),
    [formValues?.customValues]
  );

  const handleSubmit = useCallback(
    (data: ProjectSchema) => {
      switch (formValues?.state) {
        case "CREATING":
          createOneProject.mutate(projectToInput(data), {
            onSuccess: () => {
              closeAndRefetch();
              toast.success(tAlert("created", { entity }));
            },
          });
          break;
        case "UPDATING":
          updateOneProject.mutate(
            {
              projectId: selectedProjectIds[0],
              updateProjectInput: projectToInput(data),
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
      createOneProject.mutate,
      closeAndRefetch,
      formValues?.state,
      updateOneProject.mutate,
      selectedProjectIds,
    ]
  );

  const handleDelete = useCallback(() => {
    switch (formValues?.state) {
      case "DELETING":
        removeOneProject.mutate(selectedProjectIds[0], {
          onSuccess: () => {
            closeAndRefetch();
            toast.success(tAlert("deleted", { entity }));
          },
        });
        break;
      case "MULTI_DELETING":
        removeManyProjects.mutate(selectedProjectIds, {
          onSuccess: (data) => {
            closeAndRefetch();
            toast.success(
              tAlert("batchDeleted", {
                count: data.removeManyProjects.succeeded,
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
    removeOneProject,
    selectedProjectIds,
    closeAndRefetch,
    removeManyProjects,
    entityPlural,
  ]);

  return (
    <div className="flex flex-col gap-4">
      <PageTitle
        actions={[
          {
            className: "btn-ghost btn-square",
            disabled: findManyProjects.isFetching,
            icon: (
              <ArrowsClockwiseIcon
                className={cn(findManyProjects.isFetching && "animate-spin")}
              />
            ),
            onClick: () => findManyProjects.refetch(),
          },
          {
            className: "btn-soft",
            icon: <PlusIcon />,
            label: tPage("projects.newButton"),
            onClick: () => setFormValues({ state: "CREATING" }),
          },
        ]}
        description={tPage("projects.manageDescription")}
        help={pageHelp(tHelp, "projects")}
        title={tPage("projects.manageTitle")}
      />

      <Modal
        description={tPage("shared.modalFillDetails")}
        isOpen={
          formValues?.state === "CREATING" || formValues?.state === "UPDATING"
        }
        onClose={() => setFormValues(undefined)}
        title={tPage("projects.modalManage")}
      >
        <ProjectForm
          customValues={formValues?.customValues}
          defaultValues={formValues?.defaultValues}
          isLoading={createOneProject.isPending || updateOneProject.isPending}
          onCancel={() => setFormValues(undefined)}
          onSubmit={handleSubmit}
          slugsList={findManyProjects.data?.nodes
            .map((project) => project.slug)
            .filter(isNonEmptyString)}
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
        title={tPage("projects.modalBatchUpdate")}
      >
        <ProjectMultiForm
          isLoading={updateManyProjects.isPending}
          onCancel={() => setFormValues(undefined)}
          onSubmit={(updateProjectInput) =>
            updateManyProjects.mutate(
              { projectIds: selectedProjectIds, updateProjectInput },
              {
                onSuccess: (data) => {
                  closeAndRefetch();
                  toast.success(
                    tAlert("batchUpdated", {
                      count: data.updateManyProjects.succeeded,
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
            className: "btn-ghost",
            label: tAction("close"),
            onClick: () => setFormValues(undefined),
          },
        ]}
        description={tPage("shared.modalReadDescription", { entity })}
        isOpen={
          formValues?.state === "READING" ||
          formValues?.state === "MULTI_READING"
        }
        onClose={() => setFormValues(undefined)}
        title={tPage("projects.modalRead")}
      >
        {formValues?.customValues?.map((project) => (
          <Json data={project} key={project?.id} />
        ))}
      </Modal>

      <Modal
        actions={[
          {
            className: "btn-ghost",
            label: tAction("cancel"),
            onClick: () => setFormValues(undefined),
          },
          {
            className: "btn-soft btn-error",
            disabled:
              removeOneProject.isPending || removeManyProjects.isPending,
            label: tAction("confirm"),
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
          {formValues?.customValues?.map((project) => (
            <li className="badge badge-sm badge-soft" key={project?.id}>
              {project?.slug}
            </li>
          ))}
        </ul>
      </Modal>

      <DataState
        isEmpty={findManyProjects.data?.nodes.length === 0}
        isFetching={findManyProjects.isFetching}
        isLoading={findManyProjects.isPending}
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
          <ProjectsTable
            data={findManyProjects.data?.nodes ?? []}
            onDelete={(project) =>
              setFormValues({
                customValues: [project],
                state: "DELETING",
              })
            }
            onEdit={(project) =>
              setFormValues({
                customValues: [project],
                defaultValues: projectToForm(project),
                state: "UPDATING",
              })
            }
            onMultiDelete={(projects) =>
              setFormValues({
                customValues: projects,
                state: "MULTI_DELETING",
              })
            }
            onMultiEdit={(projects) =>
              setFormValues({
                customValues: projects,
                state: "MULTI_UPDATING",
              })
            }
            onMultiView={(projects) =>
              setFormValues({
                customValues: projects,
                state: "MULTI_READING",
              })
            }
            onView={(project) =>
              setFormValues({
                customValues: [project],
                state: "READING",
              })
            }
          />
        </DataState.Content>
      </DataState>
    </div>
  );
}
