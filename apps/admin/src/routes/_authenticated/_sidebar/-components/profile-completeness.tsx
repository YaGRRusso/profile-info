import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import type { GetMeQuery } from "@/generated/graphql/graphql";

type ProfileUser = GetMeQuery["getMe"];

const PROFILE_FIELDS: Array<(user: ProfileUser) => boolean> = [
  (user) =>
    Boolean(
      user.i18n?.some((translation) => translation.messages.title?.trim())
    ),
  (user) =>
    Boolean(
      user.i18n?.some((translation) => translation.messages.description?.trim())
    ),
  (user) => Boolean(user.phone?.trim()),
  (user) => Boolean(user.birth),
  (user) => Boolean(user.address?.trim()),
  (user) => Boolean(user.avatar?.trim()),
  (user) => Boolean(user.urls?.length),
];

function computeProfileCompleteness(user?: ProfileUser | null): number {
  if (!user) return 0;

  const filled = PROFILE_FIELDS.filter((check) => check(user)).length;
  return Math.round((filled / PROFILE_FIELDS.length) * 100);
}

interface ProfileCompletenessProps {
  user?: ProfileUser | null;
}

function ProgressRing({ value }: { value: number }) {
  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="relative flex size-16 items-center justify-center">
      <svg aria-hidden className="size-16 -rotate-90" viewBox="0 0 72 72">
        <title>profile completeness</title>
        <circle
          className="stroke-base-300"
          cx="36"
          cy="36"
          fill="none"
          r={radius}
          strokeWidth="6"
        />
        <circle
          className="stroke-primary transition-all duration-500"
          cx="36"
          cy="36"
          fill="none"
          r={radius}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          strokeWidth="6"
        />
      </svg>
      <span className="absolute font-semibold text-xs tabular-nums">
        {value}%
      </span>
    </div>
  );
}

export function ProfileCompleteness({ user }: ProfileCompletenessProps) {
  const { t: tDashboard } = useTranslation("dashboard");
  const profileCompleteness = computeProfileCompleteness(user);

  return (
    <div className="flex items-center gap-2">
      <ProgressRing value={profileCompleteness} />
      <div className="flex flex-col">
        <span className="font-semibold text-sm">
          {tDashboard("profileCompleteness.title")}
        </span>
        <Link className="link link-hover text-xs opacity-md" to="/settings">
          {tDashboard("profileCompleteness.cta")}
          {" · "}
          {profileCompleteness}%
        </Link>
      </div>
    </div>
  );
}
