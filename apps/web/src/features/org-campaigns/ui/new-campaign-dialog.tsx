import type { SelectCategory } from "@repo/core/database/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createCampaignOnServer } from "../server";

type NewCampaignDialogProps = {
  categories: SelectCategory[];
};

export function NewCampaignDialog({ categories }: NewCampaignDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState("");

  const navigate = useNavigate();
  const params = useParams({ from: "/o/$orgId/campaigns" });
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: createCampaignOnServer,
    onSuccess: (result) => {
      if (result.success && result.campaign) {
        toast.success("Campaign created successfully!");
        queryClient.invalidateQueries({ queryKey: ["campaigns"] });
        setOpen(false);
        setTitle("");
        setCategoryId("");

        navigate({
          to: "/o/$orgId/campaigns/$campaignId",
          params: { orgId: params.orgId, campaignId: result.campaign.id },
        });
      } else {
        toast.error(result.error || "Failed to create campaign");
      }
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to create campaign");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Campaign title is required");
      return;
    }

    if (!categoryId) {
      toast.error("Please select a category");
      return;
    }

    mutation.mutate({
      data: {
        organizationId: params.orgId,
        title: title.trim(),
        categoryId,
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button data-track="create_campaign_dialog_opened" data-organization-id={params.orgId}>
          <Plus className="h-4 w-4" />
          New Campaign
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Campaign</DialogTitle>
            <DialogDescription>
              Start a new fundraising campaign. You can add more details after creation.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Campaign Title</Label>
              <Input
                id="title"
                placeholder="Enter campaign title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={50}
                required
              />
              <p className="text-xs text-muted-foreground">{title.length}/50 characters</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={categoryId} onValueChange={setCategoryId} required>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={mutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={mutation.isPending}
              data-track="campaign_created"
              data-organization-id={params.orgId}
            >
              {mutation.isPending ? "Creating..." : "Create Campaign"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
