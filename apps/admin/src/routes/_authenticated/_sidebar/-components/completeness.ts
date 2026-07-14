import { compact } from "lodash";
import type { GetMeQuery } from "@/generated/graphql/graphql";

export type ProfileUser = GetMeQuery["getMe"];

export interface AccountTotals {
  courses: number;
  educations: number;
  experiences: number;
  ownedLocalOrganizations: number;
  ownedLocalSkills: number;
  projects: number;
}

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

export function computeProfileCompleteness(user?: ProfileUser | null): number {
  if (!user) return 0;

  const filled = PROFILE_FIELDS.filter((check) => check(user)).length;
  return Math.round((filled / PROFILE_FIELDS.length) * 100);
}

export function accountStepResults(
  totals: AccountTotals,
  user?: ProfileUser | null
): boolean[] {
  return [
    computeProfileCompleteness(user) > 1,
    totals.ownedLocalSkills > 0,
    totals.ownedLocalOrganizations > 0,
    totals.educations > 0,
    totals.courses > 0,
    totals.projects > 0,
    totals.experiences > 0,
  ];
}

export function computeAccountCompleteness(
  totals: AccountTotals,
  user?: ProfileUser | null
): number {
  const done = accountStepResults(totals, user);
  const completed = compact(done).length;

  return Math.round((completed / done.length) * 100);
}
