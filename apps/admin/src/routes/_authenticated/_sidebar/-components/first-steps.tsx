import type { Icon } from "@phosphor-icons/react";
import {
  BriefcaseIcon,
  BuildingsIcon,
  CertificateIcon,
  CheckCircleIcon,
  CircleIcon,
  FilePdfIcon,
  GraduationCapIcon,
  ListChecksIcon,
  PackageIcon,
  RocketLaunchIcon,
  UserCircleIcon,
} from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import { compact } from "lodash";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { UserRole } from "@/generated/graphql/graphql";
import { cn } from "@/lib/cn";
import {
  type AccountTotals,
  accountStepResults,
  computeAccountCompleteness,
  type ProfileUser,
} from "./completeness";

const TRACKABLE_STEPS: Array<{
  href: string;
  Icon: Icon;
  labelKey: string;
}> = [
  {
    href: "/settings",
    Icon: UserCircleIcon,
    labelKey: "firstSteps.steps.profile",
  },
  {
    href: "/skills",
    Icon: PackageIcon,
    labelKey: "firstSteps.steps.skills",
  },
  {
    href: "/organizations",
    Icon: BuildingsIcon,
    labelKey: "firstSteps.steps.organization",
  },
  {
    href: "/educations",
    Icon: GraduationCapIcon,
    labelKey: "firstSteps.steps.education",
  },
  {
    href: "/courses",
    Icon: CertificateIcon,
    labelKey: "firstSteps.steps.course",
  },
  {
    href: "/projects",
    Icon: RocketLaunchIcon,
    labelKey: "firstSteps.steps.project",
  },
  {
    href: "/experiences",
    Icon: BriefcaseIcon,
    labelKey: "firstSteps.steps.experience",
  },
];

interface FirstStepsProps {
  totals: AccountTotals;
  user?: ProfileUser | null;
}

interface FirstStepRowProps {
  done: boolean;
  href: string;
  icon: ReactNode;
  label: string;
  locked: boolean;
  trackable: boolean;
}

function FirstStepRow({
  done,
  href,
  icon,
  label,
  locked,
  trackable,
}: FirstStepRowProps) {
  const disabled = locked || done;

  return (
    <li className={cn(disabled && "menu-disabled")}>
      <Link className={cn(disabled && "disabled")} to={href}>
        <div
          className={cn(
            "flex items-center justify-center rounded p-1",
            done && "bg-success/10 text-success",
            locked && "bg-base-300/50 text-base-content/40",
            !(done || locked) && "bg-primary/10 text-primary"
          )}
        >
          {icon}
        </div>
        <span className="min-w-0 flex-1">{label}</span>
        {trackable &&
          (done ? (
            <CheckCircleIcon
              aria-hidden
              className="shrink-0 text-success"
              size={20}
              weight="fill"
            />
          ) : (
            <CircleIcon
              aria-hidden
              className={cn("shrink-0", locked ? "opacity-30" : "opacity-md")}
              size={20}
            />
          ))}
      </Link>
    </li>
  );
}

export function FirstSteps({ totals, user }: FirstStepsProps) {
  const { t: tDashboard } = useTranslation("dashboard");

  if (user?.role === UserRole.SuperAdmin) {
    return null;
  }

  const done = accountStepResults(totals, user);
  const completed = compact(done).length;
  const allTrackableDone = completed === done.length;

  const steps = [
    ...TRACKABLE_STEPS.map((step, index) => ({
      done: done[index],
      href: step.href,
      icon: <step.Icon size={20} weight="duotone" />,
      label: tDashboard(step.labelKey),
      trackable: true,
    })),
    {
      done: false,
      href: "/settings",
      icon: <FilePdfIcon size={20} weight="duotone" />,
      label: tDashboard("firstSteps.steps.cv"),
      trackable: false,
    },
  ].map((step, index, all) => ({
    ...step,
    locked: all.slice(0, index).some((previous) => !previous.done),
  }));

  const visibleSteps = allTrackableDone
    ? steps.filter((step) => !step.trackable)
    : steps;

  return (
    <section className="flex flex-col gap-4 rounded-box bg-base-200 p-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <ListChecksIcon size={20} weight="duotone" />
          <h2 className="font-semibold">{tDashboard("firstSteps.title")}</h2>
        </div>
        <span className="text-xs tabular-nums opacity-md">
          {tDashboard("firstSteps.progress", {
            completed,
            total: done.length,
          })}
        </span>
      </div>

      <progress
        className="progress progress-primary w-full"
        max={100}
        value={computeAccountCompleteness(totals, user)}
      />

      <ul className="menu w-full rounded-box p-0">
        {visibleSteps.map((step) => (
          <FirstStepRow key={step.label} {...step} />
        ))}
      </ul>
    </section>
  );
}
