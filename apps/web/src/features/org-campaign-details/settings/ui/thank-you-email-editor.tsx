import { lazy, Suspense } from "react";

const ThankYouEmailEditorImpl = lazy(() =>
  import("./thank-you-email-editor-impl").then((m) => ({
    default: m.ThankYouEmailEditorImpl,
  })),
);

type ThankYouEmailEditorProps = {
  initialContent?: string;
  onContentChange?: (html: string) => void;
  minHeight?: string;
};

function EditorSkeleton({ minHeight = "150px" }: { minHeight?: string }) {
  return (
    <div className="border border-border rounded-lg">
      <div className="h-12 bg-muted animate-pulse border-b" />
      <div className="bg-muted/50 animate-pulse p-3" style={{ minHeight }} />
    </div>
  );
}

export function ThankYouEmailEditor(props: ThankYouEmailEditorProps) {
  return (
    <Suspense fallback={<EditorSkeleton minHeight={props.minHeight} />}>
      <ThankYouEmailEditorImpl {...props} />
    </Suspense>
  );
}
