import { useEffect, useState } from "react";

type ApiStatus = "loading" | "online" | "offline";

const STATUS_LABEL: Record<ApiStatus, string> = {
  loading: "Conectando…",
  online: "API conectada",
  offline: "API offline",
};

const STATUS_STYLE: Record<ApiStatus, string> = {
  loading: "bg-zinc-800 text-zinc-400 ring-zinc-700",
  online: "bg-emerald-950 text-emerald-400 ring-emerald-900",
  offline: "bg-red-950 text-red-400 ring-red-900",
};

export function App() {
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
    <main className="grid min-h-dvh place-items-center bg-zinc-950 text-zinc-100">
      <div className="space-y-4 text-center">
        <div className="space-y-1">
          <h1 className="font-semibold text-3xl tracking-tight">Admin Panel</h1>
          <p className="text-sm text-zinc-500">profile-info</p>
        </div>
        <span
          className={`inline-block rounded-full px-3 py-1 text-xs ring-1 ring-inset ${STATUS_STYLE[status]}`}
        >
          {STATUS_LABEL[status]}
        </span>
      </div>
    </main>
  );
}
