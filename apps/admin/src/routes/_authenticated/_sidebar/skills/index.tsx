import {
  ArrowsClockwiseIcon,
  PencilIcon,
  PlusIcon,
  TrashSimpleIcon,
  WarningIcon,
} from "@phosphor-icons/react";
import { createFileRoute } from "@tanstack/react-router";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useCallback, useMemo, useState } from "react";
import { Alert } from "@/components/display/alert";
import { Dialog } from "@/components/display/dialog";
import { Modal } from "@/components/display/modal";
import { PageTitle } from "@/components/display/page-title";
import { CommonFormValuesProps } from "@/forms/common";
import { SkillForm, type SkillSchema } from "@/forms/skill";
import type { SkillEntity } from "@/graphql/graphql";
import {
  useCreateOneSkill,
  useRemoveOneSkill,
  useUpdateOneSkill,
} from "@/hooks/mutations/skills";
import { useFindManySkills } from "@/hooks/queries/skills";
import { cn } from "@/lib/cn";

const RELEVANCE_COLORS: Record<number, string> = {
  0: "",
  1: "badge-error",
  2: "badge-error",
  3: "badge-warning",
  4: "badge-success",
  5: "badge-success",
};

const columnHelper = createColumnHelper<SkillEntity>();

export const Route = createFileRoute("/_authenticated/_sidebar/skills/")({
  component: RouteComponent,
});

function RouteComponent() {
  const findManySkills = useFindManySkills();
  const createOneSkill = useCreateOneSkill();
  const updateOneSkill = useUpdateOneSkill();
  const removeOneSkill = useRemoveOneSkill();

  const [formValues, setFormValues] = useState<CommonFormValuesProps>();

  const handleSubmit = useCallback(
    (data: SkillSchema) => {
      switch (formValues?.state) {
        case "CREATING":
          createOneSkill.mutate(data, {
            onSuccess: () => {
              setFormValues(undefined);
              findManySkills.refetch();
            },
          });
          break;
        case "UPDATING":
          updateOneSkill.mutate(
            {
              skillId: formValues.customValues?.id,
              updateSkillInput: {
                category: data.category,
                name: data.name,
                relevance: data.relevance,
                slug: data.slug,
              },
            },
            {
              onSuccess: () => {
                setFormValues(undefined);
                findManySkills.refetch();
              },
            }
          );
          break;
        default:
          console.log(formValues?.state, data);
          break;
      }
    },
    [
      createOneSkill.mutate,
      findManySkills.refetch,
      formValues?.customValues,
      formValues?.state,
      updateOneSkill.mutate,
    ]
  );

  const columns = useMemo(
    () => [
      columnHelper.accessor("name", {
        header: "Name",
      }),
      columnHelper.accessor("slug", {
        header: "Slug",
        cell: (info) => (
          <span className="font-mono text-sm opacity-60">
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor("category", {
        header: "Category",
        cell: (info) => (
          <span className="badge badge-soft">{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor("relevance", {
        header: "Relevance",
        cell: (info) => {
          const value = info.getValue();
          return value == null ? (
            <span className="opacity-40">—</span>
          ) : (
            <span className={cn("badge badge-soft", RELEVANCE_COLORS[value])}>
              {value}
            </span>
          );
        },
      }),
      columnHelper.accessor("createdAt", {
        header: "Created At",
        cell: (info) =>
          new Date(info.getValue()).toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }),
      }),
      columnHelper.accessor("updatedAt", {
        header: "Updated At",
        cell: (info) =>
          new Date(info.getValue()).toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }),
      }),
      columnHelper.display({
        id: "actions",
        header: "",
        cell: (info) => {
          const skill = info.row.original;
          return (
            <div className="flex items-center gap-2">
              <button
                className="btn btn-sm btn-square btn-soft"
                onClick={() =>
                  setFormValues({
                    defaultValues: skill,
                    state: "UPDATING",
                    customValues: { id: skill.id },
                  })
                }
                type="button"
              >
                <PencilIcon />
              </button>
              <button
                className="btn btn-sm btn-soft btn-square btn-error"
                onClick={() =>
                  setFormValues({
                    state: "DELETING",
                    customValues: { id: skill.id },
                  })
                }
                type="button"
              >
                <TrashSimpleIcon />
              </button>
            </div>
          );
        },
      }),
    ],
    []
  );

  const table = useReactTable({
    data: findManySkills.data?.nodes ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (findManySkills.isPending) {
    return (
      <main className="flex h-full items-center justify-center">
        <span className="loading loading-spinner loading-lg" />
      </main>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <PageTitle
          description="Create, update or delete skills that can be associated with your profile."
          title="Manage Skills"
        />
        <button
          className="btn btn-primary btn-soft"
          onClick={() => setFormValues({ state: "CREATING" })}
          type="button"
        >
          <PlusIcon />
          <span>Add New Skill</span>
        </button>
      </div>

      <Modal
        description="Fill the details below and submit."
        isOpen={
          formValues?.state === "CREATING" ||
          formValues?.state === "UPDATING" ||
          formValues?.state === "READING"
        }
        onClose={() => setFormValues(undefined)}
        title="Manage Skill"
      >
        <SkillForm
          customValues={formValues?.customValues}
          defaultValues={formValues?.defaultValues}
          isLoading={createOneSkill.isPending || updateOneSkill.isPending}
          onCancel={() => setFormValues(undefined)}
          onSubmit={handleSubmit}
          state={formValues?.state}
        />
      </Modal>

      <Dialog
        actions={[
          {
            label: "Cancel",
            className: "btn-ghost",
            onClick: () => setFormValues(undefined),
          },
          {
            label: "Confirm",
            className: "btn-soft btn-error",
            onClick: () =>
              removeOneSkill.mutate(formValues?.customValues?.id ?? "", {
                onSuccess: () => {
                  setFormValues(undefined);
                  findManySkills.refetch();
                },
              }),
          },
        ]}
        description="Are you sure you want to delete this skill?"
        isOpen={formValues?.state === "DELETING"}
        onClose={() => setFormValues(undefined)}
        title="Delete Skill"
      />

      <Alert
        actions={[
          {
            icon: <ArrowsClockwiseIcon />,
            label: "Refresh",
            onClick: () => findManySkills.refetch(),
          },
        ]}
        description="Try refreshing the page or create a new skill."
        icon={<WarningIcon weight="bold" />}
        title="Nothing found!"
      />

      <div className="skeleton h-96 w-full" />

      <div className="overflow-x-auto rounded bg-base-200">
        <table className="table">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id}>
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr className="hover:bg-base-300" key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
