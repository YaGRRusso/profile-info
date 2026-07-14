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
import { useSystemMessagesStore } from "@/stores/system-messages";
import { routeTree } from "./routeTree.gen";

import "./i18n";
import "./styles/globals.css";

function notifyQueryError(error: Error) {
  toast.error(error.message);
}

const queryClient = new QueryClient({
  defaultOptions: {
    mutations: {
      retryDelay: 1000 * 60,
    },
    queries: {
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        if (error instanceof GqlClientError) return false;
        return failureCount < 3;
      },
      retryDelay: 1000 * 60,
      staleTime: Number.POSITIVE_INFINITY,
    },
  },
  mutationCache: new MutationCache({
    onError: (error) => notifyQueryError(error),
  }),
  queryCache: new QueryCache({
    onError: (error) => notifyQueryError(error),
  }),
});

useAuthStore.subscribe((state, prev) => {
  if (prev.token && !state.token) queryClient.clear();
});

const router = createRouter({
  basepath: import.meta.env.BASE_URL,
  context: { queryClient },
  routeTree,
  scrollRestoration: true,
});

router.subscribe("onResolved", () => {
  useSystemMessagesStore.getState().clearAllMessages();
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
