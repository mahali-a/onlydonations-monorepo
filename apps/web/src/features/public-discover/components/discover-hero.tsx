import { Button } from "@/components/ui/button";

export function DiscoverHero() {
  return (
    <div className="w-full bg-background py-12 md:py-16 lg:py-20">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl text-foreground">
              Browse fundraisers by category
            </h1>
            <p className="text-muted-foreground text-lg md:text-xl max-w-[600px]">
              People around the world are raising money for what they are passionate about.
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-full px-8"
              data-track="start_fundraiser_clicked"
              data-source="discover_hero"
            >
              Start a fundraiser
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
