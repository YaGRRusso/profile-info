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
import { useTranslation } from "react-i18next";
import { formatRelativeTime } from "@/lib/dayjs";
import { i18nLabel } from "@/lib/i18n";

interface RecentActivityItem {
  i18n?: Array<{ locale: string; messages: { title: string } }>;
  slug?: string | null;
  type: string;
  updatedAt: string;
}

interface RecentActivityProps {
  items: RecentActivityItem[];
}

interface RecentActivityRowProps {
  href: string;
  icon: ReactNode;
  label: string;
  typeLabel: string;
  updatedAt: string;
}

function RecentActivityRow({
  href,
  icon,
  label,
  typeLabel,
  updatedAt,
}: RecentActivityRowProps) {
  return (
    <li>
      <Link to={href}>
        <div className="flex items-center justify-center rounded bg-primary/10 p-1 text-primary">
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <span className="block truncate">{label}</span>
          <span className="text-xs opacity-md">
            {typeLabel}
            {" · "}
            {formatRelativeTime(updatedAt)}
          </span>
        </div>
      </Link>
    </li>
  );
}

export function RecentActivity({ items }: RecentActivityProps) {
  const { t: tDashboard } = useTranslation("dashboard");

  return (
    <section className="flex flex-col gap-4 rounded-box bg-base-200 p-4">
      <div className="flex items-center gap-2">
        <ClockCounterClockwiseIcon size={20} weight="duotone" />
        <h2 className="font-semibold">{tDashboard("recentActivity.title")}</h2>
      </div>

      {items.length === 0 ? (
        <p className="text-sm opacity-md">
          {tDashboard("recentActivity.empty")}
        </p>
      ) : (
        <ul className="menu w-full rounded-box p-0">
          {items.map((item) => {
            const key = `${item.type}-${item.slug}-${item.updatedAt}`;
            const label = i18nLabel(item);

            switch (item.type) {
              case "COURSE":
                return (
                  <RecentActivityRow
                    href="/courses"
                    icon={<CertificateIcon size={20} weight="duotone" />}
                    key={key}
                    label={label}
                    typeLabel={tDashboard("recentActivity.types.COURSE")}
                    updatedAt={item.updatedAt}
                  />
                );
              case "EDUCATION":
                return (
                  <RecentActivityRow
                    href="/educations"
                    icon={<GraduationCapIcon size={20} weight="duotone" />}
                    key={key}
                    label={label}
                    typeLabel={tDashboard("recentActivity.types.EDUCATION")}
                    updatedAt={item.updatedAt}
                  />
                );
              case "EXPERIENCE":
                return (
                  <RecentActivityRow
                    href="/experiences"
                    icon={<BriefcaseIcon size={20} weight="duotone" />}
                    key={key}
                    label={label}
                    typeLabel={tDashboard("recentActivity.types.EXPERIENCE")}
                    updatedAt={item.updatedAt}
                  />
                );
              case "ORGANIZATION":
                return (
                  <RecentActivityRow
                    href="/organizations"
                    icon={<BuildingsIcon size={20} weight="duotone" />}
                    key={key}
                    label={label}
                    typeLabel={tDashboard("recentActivity.types.ORGANIZATION")}
                    updatedAt={item.updatedAt}
                  />
                );
              case "PROJECT":
                return (
                  <RecentActivityRow
                    href="/projects"
                    icon={<RocketLaunchIcon size={20} weight="duotone" />}
                    key={key}
                    label={label}
                    typeLabel={tDashboard("recentActivity.types.PROJECT")}
                    updatedAt={item.updatedAt}
                  />
                );
              case "SKILL":
                return (
                  <RecentActivityRow
                    href="/skills"
                    icon={<PackageIcon size={20} weight="duotone" />}
                    key={key}
                    label={label}
                    typeLabel={tDashboard("recentActivity.types.SKILL")}
                    updatedAt={item.updatedAt}
                  />
                );
              default:
                return null;
            }
          })}
        </ul>
      )}
    </section>
  );
}
