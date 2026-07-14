import { QueryClient } from "@tanstack/react-query";
import { createRootRoute, Outlet } from "@tanstack/react-router";
import { NuqsAdapter } from "nuqs/adapters/tanstack-router";
import { ErrorLayout } from "./-components/error";
import { NotFoundLayout } from "./-components/not-found";

const RootLayout = () => (
  <NuqsAdapter>
    <Outlet />
  </NuqsAdapter>
);

export interface RouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRoute({
  component: RootLayout,
  errorComponent: ErrorLayout,
  notFoundComponent: NotFoundLayout,
});
