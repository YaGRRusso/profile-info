import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { DataState } from "@/components/display/data-state";
import { PageTitle } from "@/components/display/page-title";
import { ProfileForm, profileToForm, profileToInput } from "@/forms/profile";
import { useUpdateMe } from "@/hooks/mutations/users";
import { useGetMe } from "@/hooks/queries/auth";
import { pageHelp } from "@/lib/page-help";
import { useAuthStore } from "@/stores/auth";
import { DownloadCvControl } from "../-components/download-cv";
import { ProfileSummary } from "./-components/profile-summary";

export const Route = createFileRoute("/_authenticated/_sidebar/settings/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { t: tPage } = useTranslation("pages");
  const { t: tHelp } = useTranslation("help");
  const { t: tAlert } = useTranslation("alerts");
  const setUser = useAuthStore((state) => state.setUser);
  const getMe = useGetMe();
  const updateMe = useUpdateMe();

  const [formKey, setFormKey] = useState(0);

  const user = getMe.data?.getMe;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <PageTitle
          description={tPage("settings.description")}
          help={pageHelp(tHelp, "settings")}
          title={tPage("settings.title")}
        />
        <DownloadCvControl />
      </div>

      <DataState isLoading={getMe.isPending}>
        <DataState.Loading>
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="skeleton h-168 lg:col-span-2" />
            <div className="skeleton h-96" />
          </div>
        </DataState.Loading>

        <DataState.Content>
          {user && (
            <div className="grid items-start gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <ProfileForm
                  defaultValues={profileToForm(user)}
                  isLoading={updateMe.isPending}
                  key={formKey}
                  onSubmit={async (values) => {
                    const updated = await updateMe.mutateAsync(
                      profileToInput(values)
                    );
                    toast.success(tAlert("profileUpdateSuccess"));
                    setUser({
                      avatar: updated.updateMe.avatar,
                      email: updated.updateMe.email,
                      id: updated.updateMe.id,
                      name: updated.updateMe.name,
                      nickname: updated.updateMe.nickname,
                      role: updated.updateMe.role,
                    });
                    setFormKey((key) => key + 1);
                  }}
                />
              </div>

              <ProfileSummary isLoading={updateMe.isPending} user={user} />
            </div>
          )}
        </DataState.Content>
      </DataState>
    </div>
  );
}
