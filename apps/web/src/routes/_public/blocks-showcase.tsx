import { createFileRoute } from "@tanstack/react-router";
import { RenderBlocks } from "@/components/cms/render-blocks";
import { DEMO_BLOCKS } from "@/features/public-demo/data/blocks";

export const Route = createFileRoute("/_public/blocks-showcase")({
  component: BlocksShowcasePage,
});

function BlocksShowcasePage() {
  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="bg-muted/30 py-12 border-b">
        <div className="container px-4">
          <h1 className="text-4xl font-bold tracking-tight mb-4">CMS Block Showcase</h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            A comprehensive gallery of all available CMS blocks. Use this page to verify block
            rendering, responsiveness, and interactivity.
          </p>
        </div>
      </div>

      <div className="container px-4 py-12 space-y-20">
        {DEMO_BLOCKS.map((demo) => (
          <div
            key={demo.block.blockType}
            className="border rounded-xl overflow-hidden shadow-sm bg-card"
          >
            <div className="bg-muted/50 px-6 py-4 border-b flex items-center justify-between">
              <h2 className="font-semibold text-lg">{demo.title}</h2>
              <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-1 rounded">
                {demo.block.blockType}
              </span>
            </div>
            <div className="bg-white mx-auto dark:bg-black">
              <RenderBlocks blocks={[demo.block]} cmsBaseUrl="" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
