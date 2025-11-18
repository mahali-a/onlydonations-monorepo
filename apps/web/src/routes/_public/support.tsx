import { createFileRoute } from "@tanstack/react-router";
import { PublicNavbar } from "@/components/navigation/public-navbar";

export const Route = createFileRoute("/_public/support")({
  component: SupportPage,
});

function SupportPage() {
  const context = Route.useRouteContext();
  const settings = context?.settings ?? null;

  return (
    <div className="min-h-screen bg-background">
      <PublicNavbar settings={settings} />
      <main className="container mx-auto px-4 py-24">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl mb-6">
            Support
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            Get help and find answers to your questions.
          </p>
          {/* Content will be added soon */}
        </div>
      </main>
    </div>
  );
}
