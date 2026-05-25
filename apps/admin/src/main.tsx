import { IconContext } from "@phosphor-icons/react";
import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { ClientError } from "graphql-request";
import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { useAuthStore } from "@/stores/auth";
import { routeTree } from "./routeTree.gen";

import "./styles/globals.css";

const clearAuth = (error: unknown) => {
  if (error instanceof ClientError && error.response.status === 401) {
    useAuthStore.getState().clearAuth();
  }
};

const queryClient = new QueryClient({
  queryCache: new QueryCache({ onError: clearAuth }),
  mutationCache: new MutationCache({ onError: clearAuth }),
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retryDelay: 1000 * 60,
    },
    mutations: {
      retryDelay: 1000 * 60,
    },
  },
});

const router = createRouter({
  routeTree,
  scrollRestoration: true,
  context: { queryClient },
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

// biome-ignore lint/style/noNonNullAssertion: generated
const rootElement = document.getElementById("root")!;
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <IconContext.Provider value={{ weight: "bold" }}>
          <RouterProvider router={router} />
        </IconContext.Provider>
      </QueryClientProvider>
    </StrictMode>
  );
}
