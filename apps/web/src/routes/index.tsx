import { createFileRoute } from "@tanstack/react-router";
import { PublicNavbar } from "@/components/navigation/public-navbar";

export const Route = createFileRoute("/")({
  component: HomePage,
  loader: ({ context }) => {
    console.log("context", context);
  },
});

function HomePage() {
  const { settings } = Route.useRouteContext();

  return (
    <div className="min-h-screen bg-background">
      <PublicNavbar settings={settings ?? null} />
      <main className="container mx-auto px-4 py-24">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl mb-6">
            {settings?.siteName || "OnlyDonations"}
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
