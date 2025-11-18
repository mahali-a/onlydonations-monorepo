import { createFileRoute } from "@tanstack/react-router";
import { PublicNavbar } from "@/components/navigation/public-navbar";

export const Route = createFileRoute("/_public/$")({
  component: HomePage,
});

function HomePage() {
  const context = Route.useRouteContext();
  const settings = context?.settings ?? null;
  const params = Route.useParams();

  return (
    <div className="min-h-screen bg-background">
      <PublicNavbar settings={settings} />
      <main className="container mx-auto px-4 py-24">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl mb-6">
            {params?.["_splat"] || settings?.siteName || "OnlyDonations"}
          </h1>
          <p className="text-lg text-muted-foreground">
            {settings?.siteDescription ||
              "We are building a reliable platform to help Africans donate to worthy causes"}
          </p>
        </div>
      </main>
    </div>
  );
}
