import { QueryClient } from "@tanstack/react-query";
import { createRootRoute, Outlet } from "@tanstack/react-router";

const RootLayout = () => <Outlet />;

export interface RouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRoute({ component: RootLayout });
