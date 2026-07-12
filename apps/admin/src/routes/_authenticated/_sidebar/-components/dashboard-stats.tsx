import {
  BriefcaseIcon,
  BuildingsIcon,
  CertificateIcon,
  GraduationCapIcon,
  PackageIcon,
  RocketLaunchIcon,
} from "@phosphor-icons/react";
import { useTranslation } from "react-i18next";
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

export function DashboardStats({ totals }: DashboardStatsProps) {
  const { t: tDashboard } = useTranslation("dashboard");

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
      <MetricCard
        href="/skills"
        icon={<PackageIcon weight="duotone" />}
        label={tDashboard("stats.skills")}
        value={totals.skills}
      />
      <MetricCard
        href="/courses"
        icon={<CertificateIcon weight="duotone" />}
        label={tDashboard("stats.courses")}
        value={totals.courses}
      />
      <MetricCard
        href="/educations"
        icon={<GraduationCapIcon weight="duotone" />}
        label={tDashboard("stats.educations")}
        value={totals.educations}
      />
      <MetricCard
        href="/organizations"
        icon={<BuildingsIcon weight="duotone" />}
        label={tDashboard("stats.organizations")}
        value={totals.organizations}
      />
      <MetricCard
        href="/projects"
        icon={<RocketLaunchIcon weight="duotone" />}
        label={tDashboard("stats.projects")}
        value={totals.projects}
      />
      <MetricCard
        href="/experiences"
        icon={<BriefcaseIcon weight="duotone" />}
        label={tDashboard("stats.experiences")}
        value={totals.experiences}
      />
    </div>
  );
}
