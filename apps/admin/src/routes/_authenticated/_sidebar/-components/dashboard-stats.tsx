import {
  BriefcaseIcon,
  BuildingsIcon,
  CertificateIcon,
  GraduationCapIcon,
  PackageIcon,
  RocketLaunchIcon,
} from "@phosphor-icons/react";
import { MetricCard } from "@/components/display/metric-card";

interface DashboardStatsProps {
  totals: {
    skills: number;
    courses: number;
    educations: number;
    organizations: number;
    projects: number;
    experiences: number;
  };
}

const STAT_ITEMS = [
  {
    href: "/skills" as const,
    icon: <PackageIcon weight="duotone" />,
    key: "skills" as const,
    label: "Skills",
  },
  {
    href: "/courses" as const,
    icon: <CertificateIcon weight="duotone" />,
    key: "courses" as const,
    label: "Courses",
  },
  {
    href: "/educations" as const,
    icon: <GraduationCapIcon weight="duotone" />,
    key: "educations" as const,
    label: "Educations",
  },
  {
    href: "/organizations" as const,
    icon: <BuildingsIcon weight="duotone" />,
    key: "organizations" as const,
    label: "Organizations",
  },
  {
    href: "/projects" as const,
    icon: <RocketLaunchIcon weight="duotone" />,
    key: "projects" as const,
    label: "Projects",
  },
  {
    href: "/experiences" as const,
    icon: <BriefcaseIcon weight="duotone" />,
    key: "experiences" as const,
    label: "Experiences",
  },
];

export function DashboardStats({ totals }: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
      {STAT_ITEMS.map((item) => (
        <MetricCard
          href={item.href}
          icon={item.icon}
          key={item.key}
          label={item.label}
          value={totals[item.key]}
        />
      ))}
    </div>
  );
}
