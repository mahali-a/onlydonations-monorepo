import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_public/pricing")({
  component: PricingPage,
});

function PricingPage() {
  return (
    <div className="bg-background">
      <div className="container mx-auto px-4 py-24">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl mb-6">Pricing</h1>
          <p className="text-lg text-muted-foreground mb-8">
            Transparent pricing for campaign creators and donors.
          </p>
          {/* Content will be added soon */}
        </div>
      </div>
    </div>
  );
}
