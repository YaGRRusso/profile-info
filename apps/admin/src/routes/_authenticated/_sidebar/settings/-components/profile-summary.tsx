import type { GetMeQuery } from "@/generated/graphql/graphql";
import { toDateInput } from "@/lib/date";

type ProfileUser = GetMeQuery["getMe"];

interface ProfileSummaryProps {
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

export function ProfileSummary({ user }: ProfileSummaryProps) {
  const birth = toDateInput(user.birth);

  return (
    <aside className="flex flex-col gap-4 rounded-box bg-base-200 p-6 lg:sticky lg:top-16 lg:self-start">
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="avatar avatar-placeholder">
          {user.avatar ? (
            <div className="w-24 rounded-full">
              <img alt={user.name} height={96} src={user.avatar} width={96} />
            </div>
          ) : (
            <div className="w-24 rounded-full bg-neutral text-neutral-content">
              <span className="text-3xl">{user.name.charAt(0)}</span>
            </div>
          )}
        </div>
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
        <SummaryItem label="Title" value={user.title} />
        <SummaryItem label="Email" value={user.email} />
        <SummaryItem label="Phone" value={user.phone} />
        <SummaryItem label="Birth date" value={birth || undefined} />
        <SummaryItem label="Address" value={user.address} />
      </div>
    </aside>
  );
}
