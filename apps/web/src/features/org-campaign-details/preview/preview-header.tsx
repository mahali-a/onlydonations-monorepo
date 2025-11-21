import { Link } from "@tanstack/react-router";
import { AlertTriangle, ArrowRight } from "lucide-react";

type PreviewHeaderProps = {
  orgId: string;
  campaignId: string;
};

export function PreviewHeader({ orgId, campaignId }: PreviewHeaderProps) {
  return (
    <div className="sticky top-0 z-50 w-full bg-[#DC2626] px-4 py-3 text-white">
      <div className="mx-auto flex max-w-[1152px] items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          <span className="font-medium">
            This page has not been published and is not publicly viewable
          </span>
        </div>
        <Link
          to="/o/$orgId/campaigns/$campaignId/settings"
          params={{ orgId, campaignId }}
          className="flex items-center gap-1 rounded-md bg-white/20 px-4 py-1.5 text-sm font-medium transition-colors hover:bg-white/30"
        >
          Go to settings
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
