import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/o/$orgId/donations")({
  component: Donations,
});

function Donations() {
  return (
    <div>
      <h1>Donations</h1>
    </div>
  );
}
