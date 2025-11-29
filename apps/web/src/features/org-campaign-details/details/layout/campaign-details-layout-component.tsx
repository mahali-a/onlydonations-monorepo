import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { Link, Outlet, useLocation, useParams } from "@tanstack/react-router";
import confetti from "canvas-confetti";
import { Eye, Link as LinkIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  campaignDetailQueryOptions,
  publishCampaignOnServer,
} from "@/features/org-campaigns/server";
import { cn } from "@/lib/utils";

const EDITABLE_STATUSES = ["DRAFT", "ACTIVE", "REJECTED"] as const;
const PUBLISHABLE_STATUSES = ["DRAFT", "REJECTED"] as const;

const statusConfig = {
  DRAFT: {
    label: "Draft",
    dotColor: "bg-slate-400 dark:bg-slate-600",
    textColor: "text-slate-700 dark:text-slate-300",
  },
  UNDER_REVIEW: {
    label: "Under Review",
    dotColor: "bg-amber-400 dark:bg-amber-600",
    textColor: "text-amber-700 dark:text-amber-300",
  },
  ACTIVE: {
    label: "Active",
    dotColor: "bg-emerald-400 dark:bg-emerald-600",
    textColor: "text-emerald-700 dark:text-emerald-300",
  },
  COMPLETED: {
    label: "Completed",
    dotColor: "bg-blue-400 dark:bg-blue-600",
    textColor: "text-blue-700 dark:text-blue-300",
  },
  REJECTED: {
    label: "Rejected",
    dotColor: "bg-rose-400 dark:bg-rose-600",
    textColor: "text-rose-700 dark:text-rose-300",
  },
  CANCELLED: {
    label: "Cancelled",
    dotColor: "bg-muted dark:bg-muted-foreground",
    textColor: "text-foreground",
  },
};

function fireConfetti() {
  const defaults = {
    spread: 100,
    ticks: 200,
    gravity: 0.6,
    decay: 0.94,
    startVelocity: 45,
    colors: ["#FF8C1A", "#F9A54B", "#E67E22", "#ffffff", "#ffd700"],
    shapes: ["square", "circle"] as confetti.Shape[],
    scalar: 1.2,
  };

  confetti({
    ...defaults,
    particleCount: 200,
    origin: { x: 0, y: 1 },
    angle: 60,
  });

  confetti({
    ...defaults,
    particleCount: 200,
    origin: { x: 1, y: 1 },
    angle: 120,
  });

  setTimeout(() => {
    confetti({
      ...defaults,
      particleCount: 150,
      spread: 120,
      origin: { x: 0.5, y: 1 },
      angle: 90,
      startVelocity: 55,
      scalar: 1.5,
    });
  }, 100);
}

export function CampaignDetailsLayout() {
  const location = useLocation();
  const params = useParams({ from: "/o/$orgId/campaigns/$campaignId" });
  const queryClient = useQueryClient();
  const [showPublishModal, setShowPublishModal] = useState(false);

  const { data } = useSuspenseQuery(campaignDetailQueryOptions(params.orgId, params.campaignId));
  const campaign = data.campaign;
  const rejectionReason = data.rejectionReason;

  const currentTab = location.pathname.includes("/sharing")
    ? "sharing"
    : location.pathname.includes("/settings")
      ? "settings"
      : "details";

  const previewUrl = `/o/${params.orgId}/campaign-previews/${campaign.id}`;

  const currentStatus = statusConfig[campaign.status as keyof typeof statusConfig];
  const isEditable = EDITABLE_STATUSES.includes(
    campaign.status as (typeof EDITABLE_STATUSES)[number],
  );
  const canPublish = PUBLISHABLE_STATUSES.includes(
    campaign.status as (typeof PUBLISHABLE_STATUSES)[number],
  );

  const publishMutation = useMutation({
    mutationFn: publishCampaignOnServer,
    onSuccess: (result) => {
      if (result.success) {
        if (result.isFirstCampaign) {
          fireConfetti();
          toast.success("Congratulations! Your first campaign is now live!");
        } else {
          toast.success("Campaign published successfully");
        }
        queryClient.invalidateQueries({
          queryKey: ["campaign-detail", params.orgId, params.campaignId],
        });
      } else {
        toast.error(result.error || "Failed to publish campaign");
      }
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to publish campaign");
    },
  });

  const onCopyLink = () => {
    const url = `${window.location.origin}${previewUrl}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard");
  };

  const handlePublishClick = () => {
    setShowPublishModal(true);
  };

  const handlePublishConfirm = () => {
    setShowPublishModal(false);
    publishMutation.mutate({
      data: {
        organizationId: params.orgId,
        campaignId: campaign.id,
      },
    });
  };

  return (
    <div className="container mx-auto  pt-6 w-full h-full space-y-6 bg-background">
      <div className="w-full flex flex-col md:flex-row items-start md:items-center gap-4 md:justify-between">
        <div className="flex flex-col items-start gap-2 flex-1 min-w-0">
          <p className="text-xl font-medium">{campaign.title}</p>
          <div className="flex items-center gap-2">
            <p className="text-xs text-muted-foreground uppercase font-semibold">{campaign.id}</p>
            <div
              className={cn(
                "flex items-center gap-1 font-medium w-fit rounded-full border bg-background [&>svg]:text-muted-foreground px-2 py-0.5 text-xs",
                currentStatus.textColor,
              )}
            >
              <div className={cn("h-2 w-2 rounded-full", currentStatus.dotColor)}></div>
              <p>{currentStatus.label}</p>
            </div>
          </div>
        </div>

        <div className="gap-4 flex flex-row">
          <div className="flex border rounded-md">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Copy Link"
              onClick={onCopyLink}
              className="rounded-r-none border-r"
            >
              <LinkIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Preview Campaign"
              asChild
              className="rounded-l-none"
            >
              <a
                href={previewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center"
              >
                <Eye className="h-4 w-4" />
              </a>
            </Button>
          </div>
          <Button onClick={handlePublishClick} disabled={!canPublish || publishMutation.isPending}>
            {publishMutation.isPending ? "Publishing..." : canPublish ? "Publish" : "Published"}
          </Button>
        </div>
      </div>

      {!isEditable && (
        <div className="rounded-lg bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 p-4">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            This campaign cannot be edited in its current status (
            {currentStatus.label.toUpperCase()}
            ).
          </p>
        </div>
      )}

      {campaign.status === "REJECTED" && rejectionReason && (
        <div className="rounded-lg bg-rose-50 dark:bg-rose-950 border border-rose-200 dark:border-rose-800 p-4">
          <p className="text-sm font-semibold text-rose-900 dark:text-rose-100 mb-2">
            Rejection Reason:
          </p>
          <p className="text-sm text-rose-800 dark:text-rose-200">{rejectionReason}</p>
        </div>
      )}

      <Tabs className="space-y-6" value={currentTab}>
        <TabsList>
          <TabsTrigger asChild value="details">
            <Link
              to="/o/$orgId/campaigns/$campaignId"
              params={{ orgId: params.orgId, campaignId: params.campaignId }}
            >
              Details
            </Link>
          </TabsTrigger>
          <TabsTrigger asChild value="sharing">
            <Link
              to="/o/$orgId/campaigns/$campaignId/sharing"
              params={{ orgId: params.orgId, campaignId: params.campaignId }}
            >
              Sharing
            </Link>
          </TabsTrigger>
          <TabsTrigger asChild value="settings">
            <Link
              to="/o/$orgId/campaigns/$campaignId/settings"
              params={{ orgId: params.orgId, campaignId: params.campaignId }}
            >
              Settings
            </Link>
          </TabsTrigger>
        </TabsList>

        <TabsContent className="space-y-6" value={currentTab}>
          <Outlet />
        </TabsContent>
      </Tabs>

      <AlertDialog open={showPublishModal} onOpenChange={setShowPublishModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Publish Campaign</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to publish this campaign? Once published, your campaign will be
              submitted for review and made available to receive donations.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handlePublishConfirm}>Publish</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
