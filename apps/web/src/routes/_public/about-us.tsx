import { createFileRoute } from "@tanstack/react-router";
import { PublicNavbar } from "@/components/navigation/public-navbar";

export const Route = createFileRoute("/_public/about-us")({
  component: AboutUsPage,
});

function AboutUsPage() {
  const context = Route.useRouteContext();
  const settings = context?.settings ?? null;

  return (
    <div className="min-h-screen bg-background">
      <PublicNavbar settings={settings} />
      <main className="container mx-auto px-4 py-24">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl mb-6">
            About Us
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            Learn more about our mission to empower African communities through
            transparent giving.
          </p>
          {/* Content will be added soon */}
        </div>
      </main>
    </div>
  );
}
