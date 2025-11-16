import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "@tanstack/react-router";
import { Edit, MoreHorizontal, Trash2, XCircle, CheckCircle } from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { deleteCampaignOnServer, updateCampaignStatusOnServer } from "../server";

type Campaign = {
  id: string;
  title: string;
  status: string;
};

type CampaignActionsMenuProps = {
  campaign: Campaign;
};

export function CampaignActionsMenu({ campaign }: CampaignActionsMenuProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [endDialogOpen, setEndDialogOpen] = useState(false);
  const [cancelReviewDialogOpen, setCancelReviewDialogOpen] = useState(false);

  const params = useParams({ from: "/o/$orgId/campaigns" });
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: deleteCampaignOnServer,
    onSuccess: (result) => {
      if (result.success) {
        toast.success("Campaign deleted successfully");
        queryClient.invalidateQueries({ queryKey: ["campaigns"] });
        setDeleteDialogOpen(false);
      } else {
        toast.error(result.error || "Failed to delete campaign");
      }
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to delete campaign");
    },
  });

  const statusMutation = useMutation({
    mutationFn: updateCampaignStatusOnServer,
    onSuccess: (result) => {
      if (result.success) {
        toast.success("Campaign status updated");
        queryClient.invalidateQueries({ queryKey: ["campaigns"] });
        setEndDialogOpen(false);
        setCancelReviewDialogOpen(false);
      } else {
        toast.error(result.error || "Failed to update status");
      }
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to update status");
    },
  });

  const handleDelete = () => {
    deleteMutation.mutate({
      data: {
        organizationId: params.orgId,
        campaignId: campaign.id,
      },
    });
  };

  const handleEndCampaign = () => {
    statusMutation.mutate({
      data: {
        organizationId: params.orgId,
        campaignId: campaign.id,
        status: "COMPLETED",
      },
    });
  };

  const handleCancelReview = () => {
    statusMutation.mutate({
      data: {
        organizationId: params.orgId,
        campaignId: campaign.id,
        status: "CANCELLED",
      },
    });
  };

  const canDelete = campaign.status === "DRAFT";
  const canEnd = campaign.status === "ACTIVE";
  const canCancelReview = campaign.status === "UNDER_REVIEW";

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link
              to="/o/$orgId/campaigns/$campaignId"
              params={{ orgId: params.orgId, campaignId: campaign.id }}
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </DropdownMenuItem>

          {canEnd && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setEndDialogOpen(true)}>
                <CheckCircle className="mr-2 h-4 w-4" />
                End Campaign
              </DropdownMenuItem>
            </>
          )}

          {canCancelReview && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setCancelReviewDialogOpen(true)}>
                <XCircle className="mr-2 h-4 w-4" />
                Cancel Review
              </DropdownMenuItem>
            </>
          )}

          {canDelete && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setDeleteDialogOpen(true)}
                className="text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Campaign?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{campaign.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={endDialogOpen} onOpenChange={setEndDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>End Campaign?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to end "{campaign.title}"? The campaign will be marked as
              completed and will no longer accept donations.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={statusMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleEndCampaign} disabled={statusMutation.isPending}>
              {statusMutation.isPending ? "Ending..." : "End Campaign"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={cancelReviewDialogOpen} onOpenChange={setCancelReviewDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Review?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel the review for "{campaign.title}"? The campaign will
              be moved back to draft status.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={statusMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancelReview} disabled={statusMutation.isPending}>
              {statusMutation.isPending ? "Cancelling..." : "Cancel Review"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
