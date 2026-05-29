import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { ToastContainer } from "react-toastify";
import { useAuthStore } from "@/stores/auth";
import { routeTree } from "./routeTree.gen";

import "./styles/globals.css";

const queryClient = new QueryClient({
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
