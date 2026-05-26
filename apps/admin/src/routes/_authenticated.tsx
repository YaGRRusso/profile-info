import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useEffect } from "react";
import { useGetMe } from "@/hooks/queries/auth";
import { useAuthStore } from "@/stores/auth";
import { Login } from "./-components/login";

export const Route = createFileRoute("/_authenticated")({
  component: RouteComponent,
});

function RouteComponent() {
  const { token, setUser } = useAuthStore();

  const getMe = useGetMe({ enabled: !!token });
  const user = getMe.data?.getMe;

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

  if (!token) return <Login />;

  return <Outlet />;
}
