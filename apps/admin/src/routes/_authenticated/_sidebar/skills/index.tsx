import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/_sidebar/skills/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/_authenticated/_sidebar/skills"!</div>;
}
