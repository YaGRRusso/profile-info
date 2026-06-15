import { Avatar } from "@/components/display/avatar";
import { PROFILE_SETTINGS_FORM_ID } from "@/forms/profile";
import type { GetMeQuery } from "@/generated/graphql/graphql";
import { toDateInput } from "@/lib/date";

type ProfileUser = GetMeQuery["getMe"];

interface ProfileSummaryProps {
  isLoading?: boolean;
  user: ProfileUser;
}

function SummaryItem({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) {
  if (!value) return null;

  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs uppercase opacity-60">{label}</span>
      <span className="text-sm">{value}</span>
    </div>
  );
}

export function ProfileSummary({ isLoading, user }: ProfileSummaryProps) {
  const birth = toDateInput(user.birth);
  const translation = user.i18n?.find(
    (entry) =>
      entry.messages.title?.trim() || entry.messages.description?.trim()
  );
  const title = translation?.messages.title;
  const description = translation?.messages.description;

  return (
    <aside className="flex flex-col gap-4 rounded-box bg-base-200 p-6 lg:sticky lg:top-16 lg:self-start">
      <div className="flex flex-col items-center gap-3 text-center">
        <Avatar
          avatar={user?.avatar}
          className="size-24 text-3xl"
          name={user.name}
        />
        <div className="flex flex-col gap-1">
          <strong className="text-lg">{user.name}</strong>
          <span className="text-sm opacity-70">@{user.nickname}</span>
          {user.role && (
            <span className="badge badge-neutral badge-sm mx-auto">
              {user.role}
            </span>
          )}
        </div>
      </div>

      <div className="divider my-0" />

      <div className="flex flex-col gap-4">
        <SummaryItem label="Title" value={title} />
        <SummaryItem label="Description" value={description} />
        <SummaryItem label="Email" value={user.email} />
        <SummaryItem label="Phone" value={user.phone} />
        <SummaryItem label="Birth date" value={birth || undefined} />
        <SummaryItem label="Address" value={user.address} />
      </div>

      <button
        className="btn btn-soft btn-primary btn-block max-lg:hidden"
        disabled={isLoading}
        form={PROFILE_SETTINGS_FORM_ID}
        type="submit"
      >
        Save changes
      </button>
    </aside>
  );
}
