import { ClipboardCopy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

type LiveDisplayProps = {
  campaignId: string;
};

export function LiveDisplay({ campaignId }: LiveDisplayProps) {
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const liveDisplayUrl = `${baseUrl}/${campaignId}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(liveDisplayUrl);
    toast.success("Link copied to clipboard");
  };

  return (
    <div className="grid grid-cols-12 gap-4">
      <div className="col-span-full md:col-span-4">
        <div className="text-lg font-medium">Live Display</div>
        <p className="text-sm text-foreground">
          Live Display allows anyone hosting an in-person event to showcase campaign activity in
          real-time on a TV, projector screen, or tablet.{" "}
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://help.yoursite.com/live-display"
            className="text-primary hover:underline"
          >
            Read the guide
          </a>
          .
        </p>
      </div>
      <div className="col-span-full md:col-span-7 md:col-start-6">
        <div className="w-full space-y-2">
          <Label>Live Display link</Label>
          <p className="text-muted-foreground text-sm">
            Live Display allows anyone hosting an in-person event to showcase campaign activity in
            real-time on a TV, projector screen, or tablet.
          </p>
          <div className="w-inherit flex h-10 cursor-text items-center gap-2 rounded-lg bg-background pl-3 pr-1 text-foreground ring-1 ring-inset ring-input py-2">
            <input
              className="h-full min-h-6 max-w-full text-sm text-foreground flex-grow appearance-none border-none bg-transparent outline-none disabled:cursor-not-allowed disabled:placeholder:text-muted-foreground placeholder:text-muted-foreground"
              readOnly
              value={liveDisplayUrl}
            />
            <div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                aria-label="Copy"
                onClick={handleCopy}
              >
                <ClipboardCopy className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <p className="text-sm text-foreground">
            Find your Live Display here:&nbsp;
            <a
              href={liveDisplayUrl}
              target="_blank"
              rel="noreferrer"
              className="text-primary hover:underline"
            >
              {liveDisplayUrl}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
