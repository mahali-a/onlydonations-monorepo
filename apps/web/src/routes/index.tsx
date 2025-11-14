import { createFileRoute } from "@tanstack/react-router";
import { NavigationBar } from "@/components/navigation";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <NavigationBar />
      <main className="container mx-auto px-4 py-24">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl mb-6">
            Welcome to Your SaaS Starter
          </h1>
          <p className="text-lg text-muted-foreground">
            Your application is ready. Start building your features here.
          </p>
        </div>
      </main>
    </div>
  );
}
