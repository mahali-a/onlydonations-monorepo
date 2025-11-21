import type { AnyFieldApi } from "@tanstack/react-form";
import { lazy, Suspense } from "react";

const CampaignStoryEditor = lazy(() =>
  import("./campaign-story-editor").then((m) => ({ default: m.CampaignStoryEditor })),
);

function EditorSkeleton() {
  return (
    <div className="border border-border rounded-lg">
      <div className="h-12 bg-muted animate-pulse border-b" />
      <div className="h-[300px] bg-muted/50 animate-pulse" />
    </div>
  );
}

export function CampaignStory({
  field,
  editable = true,
}: {
  field: AnyFieldApi;
  editable?: boolean;
}) {
  if (!editable) {
    return (
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-full md:col-span-4">
          <div className="text-lg font-medium">Story</div>
          <p className="text-sm text-foreground">
            Add a story to your campaign. This appears directly below the title.
          </p>
        </div>

        <section className="col-span-full md:col-span-7 md:col-start-6 space-y-4">
          <div
            className="prose prose-sm max-w-none"
            // biome-ignore lint/security/noDangerouslySetInnerHtml: CMS content is sanitized
            dangerouslySetInnerHTML={{ __html: field.state.value || "" }}
          />
        </section>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-12 gap-4">
      <div className="col-span-full md:col-span-4">
        <div className="text-lg font-medium">Story</div>
        <p className="text-sm text-foreground">
          Add a story to your campaign. This appears directly below the title.
        </p>
      </div>

      <section className="col-span-full md:col-span-7 md:col-start-6 space-y-4">
        <Suspense fallback={<EditorSkeleton />}>
          <CampaignStoryEditor field={field} />
        </Suspense>
      </section>
    </div>
  );
}
