export function DonateNotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-foreground mb-2">Campaign Not Found</h1>
        <p className="text-muted-foreground mb-6">
          The campaign you're looking for doesn't exist or is no longer available.
        </p>
        <a
          href="/"
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Back to Home
        </a>
      </div>
    </div>
  );
}
