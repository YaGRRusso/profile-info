import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useEffect } from "react";
import { DataState } from "@/components/display/data-state";
import { useGetMe } from "@/hooks/queries/auth";
import { useAuthStore, waitForAuthHydration } from "@/stores/auth";
import { Auth } from "./-components/auth";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: () => waitForAuthHydration(),
  component: RouteComponent,
});

function RouteComponent() {
  const { token, setUser } = useAuthStore();

  const getMe = useGetMe({
    enabled: !!token,
    retry: false,
  });
  const user = getMe.data?.getMe;

  useEffect(() => {
    if (getMe.isError) setUser(null);
  }, [getMe.isError, setUser]);

  useEffect(() => {
    if (user) {
      setUser({
        avatar: user.avatar,
        email: user.email,
        id: user.id,
        name: user.name,
        nickname: user.nickname,
        role: user.role,
      });
    }
  }, [user, setUser]);

  if (!token) {
    return <Auth />;
  }

  return (
    <DataState
      isEmpty={!getMe.data}
      isFetching={getMe.isFetching}
      isLoading={getMe.isLoading}
    >
      <DataState.Loading />
      <DataState.Empty>
        <Auth />
      </DataState.Empty>
      <DataState.Content>
        <Outlet />
      </DataState.Content>
    </DataState>
  );
}
