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
import { ProjectsTable } from "./-components/table";

export const Route = createFileRoute("/_authenticated/_sidebar/projects/")({
  component: RouteComponent,
});

function RouteComponent() {
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
              toast.success("Project created successfully");
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
                toast.success("Project updated successfully");
              },
            }
          );
          break;
        default:
          break;
      }
    },
    [
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
            toast.success("Project deleted successfully");
          },
        });
        break;
      case "MULTI_DELETING":
        removeManyProjects.mutate(selectedProjectIds, {
          onSuccess: (data) => {
            closeAndRefetch();
            toast.success(
              `${data.removeManyProjects.succeeded} projects deleted successfully`
            );
          },
        });
        break;
      default:
        break;
    }
  }, [
    formValues?.state,
    removeOneProject,
    selectedProjectIds,
    closeAndRefetch,
    removeManyProjects,
  ]);

  return (
    <div className="flex flex-col gap-4">
      <PageTitle
        actions={[
          {
            icon: (
              <ArrowsClockwiseIcon
                className={cn(findManyProjects.isFetching && "animate-spin")}
              />
            ),
            className: "btn-ghost btn-square",
            onClick: () => findManyProjects.refetch(),
            disabled: findManyProjects.isFetching,
          },
          {
            icon: <PlusIcon />,
            label: "New Project",
            className: "btn-soft",
            onClick: () => setFormValues({ state: "CREATING" }),
          },
        ]}
        description="Create, update or delete projects of your profile."
        title="Manage Projects"
      />

      <Modal
        description="Fill the details below and submit."
        isOpen={
          formValues?.state === "CREATING" || formValues?.state === "UPDATING"
        }
        onClose={() => setFormValues(undefined)}
        title="Manage Project"
      >
        <ProjectForm
          customValues={formValues?.customValues}
          defaultValues={formValues?.defaultValues}
          isLoading={createOneProject.isPending || updateOneProject.isPending}
          onCancel={() => setFormValues(undefined)}
          onSubmit={handleSubmit}
          slugsList={findManyProjects.data?.nodes.map(
            (project) => project.slug
          )}
          state={formValues?.state}
        />
      </Modal>

      <Modal
        description={`Update the fields below to apply them to all ${formValues?.customValues?.length ?? 0} selected projects.`}
        isOpen={formValues?.state === "MULTI_UPDATING"}
        onClose={() => setFormValues(undefined)}
        title="Update Projects"
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
                    `${data.updateManyProjects.succeeded} projects updated successfully`
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
        description="Read only view of the project."
        isOpen={
          formValues?.state === "READING" ||
          formValues?.state === "MULTI_READING"
        }
        onClose={() => setFormValues(undefined)}
        title="Read Project"
      >
        {formValues?.customValues?.map((project) => (
          <Json data={project} key={project?.id} />
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
              removeOneProject.isPending || removeManyProjects.isPending,
            onClick: () => handleDelete(),
          },
        ]}
        description="Are you sure you want to delete the following projects?"
        isOpen={
          formValues?.state === "MULTI_DELETING" ||
          formValues?.state === "DELETING"
        }
        onClose={() => setFormValues(undefined)}
        title="Delete projects?"
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
            description="Try refreshing the page or create a new project."
            icon={<WarningIcon weight="bold" />}
            title="Nothing found!"
          />
        </DataState.Empty>

        <DataState.Content>
          <ProjectsTable
            data={findManyProjects.data?.nodes ?? []}
            onDelete={(project) =>
              setFormValues({
                state: "DELETING",
                customValues: [project],
              })
            }
            onEdit={(project) =>
              setFormValues({
                defaultValues: projectToForm(project),
                state: "UPDATING",
                customValues: [project],
              })
            }
            onMultiDelete={(projects) =>
              setFormValues({
                state: "MULTI_DELETING",
                customValues: projects,
              })
            }
            onMultiEdit={(projects) =>
              setFormValues({
                state: "MULTI_UPDATING",
                customValues: projects,
              })
            }
            onMultiView={(projects) =>
              setFormValues({
                state: "MULTI_READING",
                customValues: projects,
              })
            }
            onView={(project) =>
              setFormValues({
                state: "READING",
                customValues: [project],
              })
            }
          />
        </DataState.Content>
      </DataState>
    </div>
  );
}
