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
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import type { GetMeQuery } from "@/generated/graphql/graphql";
import { cn } from "@/lib/cn";
import { computeProfileCompleteness } from "./profile-completeness";

type ProfileUser = GetMeQuery["getMe"];

interface DashboardTotals {
  courses: number;
  educations: number;
  experiences: number;
  organizations: number;
  ownedLocalOrganizations: number;
  ownedLocalSkills: number;
  projects: number;
  skills: number;
}

interface FirstStepsProps {
  totals: DashboardTotals;
  user?: ProfileUser | null;
}

interface FirstStep {
  done: boolean;
  href: string;
  icon: ReactNode;
  label: string;
  trackProgress?: boolean;
}

interface FirstStepState extends FirstStep {
  locked: boolean;
}

function buildSteps(
  user: ProfileUser | null | undefined,
  totals: DashboardTotals,
  tDashboard: (key: string) => string
): FirstStepState[] {
  const steps: FirstStep[] = [
    {
      done: computeProfileCompleteness(user) > 1,
      href: "/settings",
      icon: <UserCircleIcon size={20} weight="duotone" />,
      label: tDashboard("firstSteps.steps.profile"),
    },
    {
      done: totals.ownedLocalSkills > 0,
      href: "/skills",
      icon: <PackageIcon size={20} weight="duotone" />,
      label: tDashboard("firstSteps.steps.skills"),
    },
    {
      done: totals.ownedLocalOrganizations > 0,
      href: "/organizations",
      icon: <BuildingsIcon size={20} weight="duotone" />,
      label: tDashboard("firstSteps.steps.organization"),
    },
    {
      done: totals.educations > 0,
      href: "/educations",
      icon: <GraduationCapIcon size={20} weight="duotone" />,
      label: tDashboard("firstSteps.steps.education"),
    },
    {
      done: totals.courses > 0,
      href: "/courses",
      icon: <CertificateIcon size={20} weight="duotone" />,
      label: tDashboard("firstSteps.steps.course"),
    },
    {
      done: totals.projects > 0,
      href: "/projects",
      icon: <RocketLaunchIcon size={20} weight="duotone" />,
      label: tDashboard("firstSteps.steps.project"),
    },
    {
      done: totals.experiences > 0,
      href: "/experiences",
      icon: <BriefcaseIcon size={20} weight="duotone" />,
      label: tDashboard("firstSteps.steps.experience"),
    },
    {
      done: false,
      href: "/settings",
      icon: <FilePdfIcon size={20} weight="duotone" />,
      label: tDashboard("firstSteps.steps.cv"),
      trackProgress: false,
    },
  ];

  return steps.map((step, index) => ({
    ...step,
    locked: steps.slice(0, index).some((previous) => !previous.done),
  }));
}

function stepIconClassName(step: FirstStepState): string {
  if (step.done) return "bg-success/10 text-success";
  if (step.locked) return "bg-base-300/50 text-base-content/40";
  return "bg-primary/10 text-primary";
}

function StepRow({ step }: { step: FirstStepState }) {
  const content = (
    <>
      <div
        className={cn(
          "flex items-center justify-center rounded p-1",
          stepIconClassName(step)
        )}
      >
        {step.icon}
      </div>
      <span className="min-w-0 flex-1">{step.label}</span>
      {step.done ? (
        <CheckCircleIcon
          aria-hidden
          className="shrink-0 text-success"
          size={20}
          weight="fill"
        />
      ) : (
        <CircleIcon
          aria-hidden
          className={cn("shrink-0", step.locked ? "opacity-30" : "opacity-md")}
          size={20}
        />
      )}
    </>
  );

  if (step.locked || step.done) {
    return (
      <span
        aria-disabled={step.locked}
        className={cn("flex items-center gap-2", step.locked && "opacity-40")}
      >
        {content}
      </span>
    );
  }

  return <Link to={step.href}>{content}</Link>;
}

export function FirstSteps({ totals, user }: FirstStepsProps) {
  const { t: tDashboard } = useTranslation("dashboard");
  const steps = buildSteps(user, totals, tDashboard);
  const trackableSteps = steps.filter((step) => step.trackProgress !== false);
  const completed = trackableSteps.filter((step) => step.done).length;

  if (completed === trackableSteps.length) return null;

  const progress = Math.round((completed / trackableSteps.length) * 100);

  return (
    <section className="flex flex-col gap-4 rounded-box bg-base-200 p-4">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <ListChecksIcon size={20} weight="duotone" />
          <h2 className="font-semibold">{tDashboard("firstSteps.title")}</h2>
        </div>
        <p className="text-sm opacity-md">
          {tDashboard("firstSteps.description")}
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2 text-xs opacity-md">
          <span>
            {tDashboard("firstSteps.progress", {
              completed,
              total: trackableSteps.length,
            })}
          </span>
          <span className="tabular-nums">{progress}%</span>
        </div>
        <progress
          className="progress progress-primary w-full"
          max={100}
          value={progress}
        />
      </div>

      <ul className="menu w-full rounded-box p-0">
        {steps.map((step) => (
          <li key={step.label}>
            <StepRow step={step} />
          </li>
        ))}
      </ul>
    </section>
  );
}
