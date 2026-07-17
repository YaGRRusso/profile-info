import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { toast } from "sonner";
import { SlowRequestWatcher } from "@/components/display/slow-request-watcher";
import { Toaster } from "@/components/display/toaster";
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
      retry: false,
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

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error('Root element "#root" not found');
}
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <Toaster />
        <SlowRequestWatcher />
        <RouterProvider router={router} />
      </QueryClientProvider>
    </StrictMode>
  );
}
