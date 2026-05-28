import { QueryClient } from "@tanstack/react-query";
import { createRootRoute, Outlet } from "@tanstack/react-router";
import { NuqsAdapter } from "nuqs/adapters/tanstack-router";

const RootLayout = () => (
  <NuqsAdapter>
    <Outlet />
  </NuqsAdapter>
);

export interface RouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRoute({ component: RootLayout });
