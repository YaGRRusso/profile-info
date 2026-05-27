import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import type { SkillEntity } from "@/graphql/graphql";

const columnHelper = createColumnHelper<SkillEntity>();

const columns = [
  columnHelper.accessor("name", { header: "Name" }),
  columnHelper.accessor("slug", { header: "Slug" }),
  columnHelper.accessor("category", { header: "Category" }),
  columnHelper.accessor("relevance", { header: "Relevance" }),
];

interface SkillsTableProps {
  data: SkillEntity[];
}

export function SkillsTable({ data }: SkillsTableProps) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="overflow-x-auto bg-base-200">
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
            <tr key={row.id}>
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
  );
}
