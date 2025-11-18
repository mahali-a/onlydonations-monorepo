import { ThankYouEmailEditor } from "./thank-you-email-editor";
import type { AnyFieldApi } from "@tanstack/react-form";

type ThankYouMessageProps = {
  field: AnyFieldApi;
};

export function ThankYouMessage({ field }: ThankYouMessageProps) {
  return (
    <div className="grid grid-cols-12 gap-4">
      <div className="col-span-full md:col-span-4">
        <div className="text-lg font-medium">Thank you message</div>
        <p className="text-sm text-muted-foreground">
          Write a custom thank you message that will appear in email receipts.
        </p>
      </div>

      <div className="col-span-full md:col-span-8 md:col-start-6">
        <div className="flex flex-col gap-4">
          <ThankYouEmailEditor
            initialContent={field.state.value || undefined}
            onContentChange={(html) => field.handleChange(html)}
          />
        </div>
      </div>
    </div>
  );
}
