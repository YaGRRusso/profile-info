import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

type ApiStatus = "loading" | "online" | "offline";

const STATUS_LABEL: Record<ApiStatus, string> = {
  loading: "Conectando…",
  online: "API conectada",
  offline: "API offline",
};

const STATUS_STYLE: Record<ApiStatus, string> = {
  loading: "",
  online: "badge-success",
  offline: "badge-error",
};

export const Route = createFileRoute("/_authenticated/")({
  component: RouteComponent,
});

function RouteComponent() {
  const [status, setStatus] = useState<ApiStatus>("loading");

  useEffect(() => {
    const controller = new AbortController();

    fetch(import.meta.env.VITE_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: "{ __typename }" }),
      signal: controller.signal,
    })
      .then((response) => setStatus(response.ok ? "online" : "offline"))
      .catch(() => setStatus("offline"));

    return () => controller.abort();
  }, []);

  return (
    <main className="flex h-screen flex-col items-center justify-center gap-4">
      <h1 className="font-semibold text-3xl">Admin Panel</h1>
      <span className={cn("badge badge-soft", STATUS_STYLE[status])}>
        {STATUS_LABEL[status]}
      </span>
    </main>
  );
}
