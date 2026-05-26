import { PlusIcon, XIcon } from "@phosphor-icons/react";
import { createFileRoute } from "@tanstack/react-router";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useState } from "react";
import { CommonFormValuesProps } from "@/forms/common";
import { SkillForm } from "@/forms/skill";
import type { SkillEntity } from "@/graphql/graphql";
import { useCreateOneSkill, useUpdateOneSkill } from "@/hooks/mutations/skills";
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

const columns = [
  columnHelper.accessor("name", {
    header: "Name",
  }),
  columnHelper.accessor("slug", {
    header: "Slug",
    cell: (info) => (
      <span className="font-mono text-sm opacity-60">{info.getValue()}</span>
    ),
  }),
  columnHelper.accessor("category", {
    header: "Category",
    cell: (info) => <span className="badge badge-soft">{info.getValue()}</span>,
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
  // columnHelper.display({
  //   id: "actions",
  //   header: "",
  //   cell: (info) => {
  //     const skill = info.row.original;
  //     return (
  //       <div className="flex items-center gap-2">
  //         <button
  //           className="btn btn-sm btn-square btn-soft"
  //           onClick={() => console.log("Edit", skill.id)}
  //           type="button"
  //         >
  //           <PencilIcon />
  //         </button>
  //         <button
  //           className="btn btn-sm btn-soft btn-square btn-error"
  //           onClick={() => console.log("Delete", skill.id)}
  //           type="button"
  //         >
  //           <TrashSimpleIcon />
  //         </button>
  //       </div>
  //     );
  //   },
  // }),
];

export const Route = createFileRoute("/_authenticated/_sidebar/skills/")({
  component: RouteComponent,
});

function RouteComponent() {
  const findManySkills = useFindManySkills();
  const createOneSkill = useCreateOneSkill();
  const updateOneSkill = useUpdateOneSkill();
  // const removeOneSkill = useRemoveOneSkill();
  // const removeManySkills = useRemoveManySkills();

  const [formValues, setFormValues] = useState<CommonFormValuesProps>();

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
        <div className="flex flex-col">
          <h1 className="font-semibold text-2xl">Skills</h1>
          <p className="text-sm opacity-60">
            {findManySkills.data?.found ?? 0} total
          </p>
        </div>
        <button
          className="btn btn-primary btn-soft btn-sm"
          onClick={() => setFormValues({ state: "CREATING" })}
          type="button"
        >
          <PlusIcon />
          <span>Add Skill</span>
        </button>
      </div>

      <dialog className={cn("modal", formValues?.state && "modal-open")}>
        <div className="modal-box flex flex-col gap-4">
          <div className="flex flex-col">
            <h2 className="font-semibold text-lg">Create Skill</h2>
            <p className="text-sm opacity-60">
              Fill in the details to create a new skill.
            </p>
          </div>
          <SkillForm
            customValues={formValues?.customValues}
            defaultValues={formValues?.defaultValues}
            isLoading={createOneSkill.isPending || updateOneSkill.isPending}
            onCancel={() => setFormValues(undefined)}
            onSubmit={(ev) => console.log(ev)}
            state={formValues?.state}
          />
          <button
            className="btn btn-sm btn-circle btn-ghost absolute top-2 right-2"
            onClick={() => setFormValues(undefined)}
            type="button"
          >
            <XIcon />
          </button>
        </div>
        <button
          className="modal-backdrop"
          onClick={() => setFormValues(undefined)}
          type="button"
        >
          close
        </button>
      </dialog>

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
