import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { ToastContainer, toast } from "react-toastify";
import { GqlClientError } from "@/lib/gql";
import { useAuthStore } from "@/stores/auth";
import { routeTree } from "./routeTree.gen";

import "./styles/globals.css";

function notifyQueryError(error: Error) {
  toast.error(error.message);
}

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => notifyQueryError(error),
  }),
  mutationCache: new MutationCache({
    onError: (error) => notifyQueryError(error),
  }),
  defaultOptions: {
    queries: {
      staleTime: Number.POSITIVE_INFINITY,
      refetchOnWindowFocus: false,
      retryDelay: 1000 * 60,
      retry: (failureCount, error) => {
        if (error instanceof GqlClientError) return false;
        return failureCount < 3;
      },
    },
    mutations: {
      retryDelay: 1000 * 60,
    },
  },
});

useAuthStore.subscribe((state, prev) => {
  if (prev.token && !state.token) queryClient.clear();
});

const router = createRouter({
  routeTree,
  basepath: import.meta.env.BASE_URL,
  scrollRestoration: true,
  context: { queryClient },
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const rootElement = document.getElementById("root")!;
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <ToastContainer autoClose={3000} />
        <RouterProvider router={router} />
      </QueryClientProvider>
    </StrictMode>
  );
}
