import {
  BriefcaseIcon,
  BuildingsIcon,
  CertificateIcon,
  ClockCounterClockwiseIcon,
  GraduationCapIcon,
  PackageIcon,
  RocketLaunchIcon,
} from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import type { DashboardActivityType } from "@/generated/graphql/graphql";
import { formatRelativeTime } from "@/lib/dayjs";
import { useLocaleStore } from "@/stores/locale";

interface RecentActivityItem {
  label: string;
  type: DashboardActivityType;
  updatedAt: string;
}

interface RecentActivityProps {
  items: RecentActivityItem[];
}

const ACTIVITY_ROUTES: Record<DashboardActivityType, string> = {
  COURSE: "/courses",
  EDUCATION: "/educations",
  EXPERIENCE: "/experiences",
  ORGANIZATION: "/organizations",
  PROJECT: "/projects",
  SKILL: "/skills",
};

const ACTIVITY_ICONS: Record<DashboardActivityType, ReactNode> = {
  COURSE: <CertificateIcon size={20} weight="duotone" />,
  EDUCATION: <GraduationCapIcon size={20} weight="duotone" />,
  EXPERIENCE: <BriefcaseIcon size={20} weight="duotone" />,
  ORGANIZATION: <BuildingsIcon size={20} weight="duotone" />,
  PROJECT: <RocketLaunchIcon size={20} weight="duotone" />,
  SKILL: <PackageIcon size={20} weight="duotone" />,
};

function formatActivityType(type: DashboardActivityType): string {
  return type.charAt(0) + type.slice(1).toLowerCase();
}

export function RecentActivity({ items }: RecentActivityProps) {
  const locale = useLocaleStore((state) => state.locale);
  return (
    <section className="flex flex-col gap-4 rounded-box bg-base-200 p-4">
      <div className="flex items-center gap-2">
        <ClockCounterClockwiseIcon size={20} weight="duotone" />
        <h2 className="font-semibold">Recent activity</h2>
      </div>

      {items.length === 0 ? (
        <p className="text-sm opacity-md">No recent updates yet.</p>
      ) : (
        <ul className="menu w-full rounded-box p-0">
          {items.map((item) => (
            <li key={`${item.type}-${item.label}-${item.updatedAt}-${locale}`}>
              <Link to={ACTIVITY_ROUTES[item.type]}>
                <div className="flex items-center justify-center rounded bg-primary/10 p-1 text-primary">
                  {ACTIVITY_ICONS[item.type]}
                </div>
                <div className="min-w-0 flex-1">
                  <span className="block truncate">{item.label}</span>
                  <span className="text-xs opacity-md">
                    {formatActivityType(item.type)}
                    {" · "}
                    {formatRelativeTime(item.updatedAt)}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
