import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "react-toastify";
import { DataState } from "@/components/display/data-state";
import { PageTitle } from "@/components/display/page-title";
import { ProfileForm, profileToForm, profileToInput } from "@/forms/profile";
import { useUpdateMe } from "@/hooks/mutations/users";
import { useGetMe } from "@/hooks/queries/auth";
import { useAuthStore } from "@/stores/auth";

export const Route = createFileRoute("/_authenticated/_sidebar/settings/")({
  component: RouteComponent,
});

function RouteComponent() {
  const setUser = useAuthStore((state) => state.setUser);
  const getMe = useGetMe();
  const updateMe = useUpdateMe();

  const [formKey, setFormKey] = useState(0);

  const user = getMe.data?.getMe;

  return (
    <div className="flex flex-col gap-4">
      <PageTitle description="Manage your account details." title="Settings" />

      <DataState isLoading={getMe.isPending}>
        <DataState.Loading>
          <div className="skeleton h-96 w-full max-w-xl" />
        </DataState.Loading>

        <DataState.Content>
          {user && (
            <div className="w-full max-w-xl">
              <ProfileForm
                defaultValues={profileToForm(user)}
                isLoading={updateMe.isPending}
                key={formKey}
                onSubmit={async (values) => {
                  const updated = await updateMe.mutateAsync(
                    profileToInput(values)
                  );
                  toast.success("Profile updated successfully");
                  setUser({
                    id: updated.updateMe.id,
                    email: updated.updateMe.email,
                    name: updated.updateMe.name,
                    nickname: updated.updateMe.nickname,
                    role: updated.updateMe.role,
                    avatar: updated.updateMe.avatar,
                  });
                  setFormKey((key) => key + 1);
                }}
              />
            </div>
          )}
        </DataState.Content>
      </DataState>
    </div>
  );
}
