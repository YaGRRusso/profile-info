import { compact, uniq } from "lodash";
import { EmptyValue } from "@/components/display/empty-value";
import { isEmptyValue } from "@/lib/empty-value";

export interface BadgeListProps {
  values: string[];
}

export function BadgeList({ values }: BadgeListProps) {
  const unique = uniq(compact(values));

  if (isEmptyValue(unique)) {
    return <EmptyValue />;
  }

  return (
    <div className="flex items-center gap-1">
      {[...unique].splice(0, 3).map((value) => (
        <span className="badge badge-soft badge-sm line-clamp-1" key={value}>
          {value}
        </span>
      ))}
      {unique.length > 3 && <span className="badge badge-sm">+</span>}
    </div>
  );
}
