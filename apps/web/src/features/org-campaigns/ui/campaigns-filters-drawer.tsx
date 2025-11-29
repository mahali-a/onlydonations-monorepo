import type { SelectCategory } from "@repo/core/database/types";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { SlidersHorizontal, X } from "lucide-react";
import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import type { CampaignFilters } from "../org-campaigns-schema";

type CampaignsFiltersDrawerProps = {
  categories: SelectCategory[];
};

const CAMPAIGN_STATUSES = [
  { value: "all", label: "All Statuses" },
  { value: "DRAFT", label: "Draft" },
  { value: "UNDER_REVIEW", label: "Under Review" },
  { value: "ACTIVE", label: "Active" },
  { value: "COMPLETED", label: "Completed" },
  { value: "REJECTED", label: "Rejected" },
  { value: "CANCELLED", label: "Cancelled" },
];

const SORT_OPTIONS = [
  { value: "created", label: "Date Created" },
  { value: "title", label: "Title" },
  { value: "goal", label: "Goal Amount" },
  { value: "raised", label: "Amount Raised" },
  { value: "supporters", label: "Supporters" },
];

export function CampaignsFiltersDrawer({ categories }: CampaignsFiltersDrawerProps) {
  const navigate = useNavigate({ from: "/o/$orgId/campaigns" });
  const search = useSearch({ from: "/o/$orgId/campaigns" }) as Partial<CampaignFilters>;
  const [open, setOpen] = React.useState(false);

  // Local state for filters
  const [selectedStatus, setSelectedStatus] = React.useState<string | undefined>(search.status);
  const [selectedCategory, setSelectedCategory] = React.useState<string | undefined>(
    search.categoryId,
  );
  const [sortBy, setSortBy] = React.useState(search.sortBy ?? "created");
  const [sortOrder, setSortOrder] = React.useState(search.sortOrder ?? "desc");

  // Sync with URL when drawer opens
  React.useEffect(() => {
    if (open) {
      setSelectedStatus(search.status);
      setSelectedCategory(search.categoryId);
      setSortBy(search.sortBy ?? "created");
      setSortOrder(search.sortOrder ?? "desc");
    }
  }, [open, search]);

  const handleApply = () => {
    navigate({
      search: (prev) => ({
        ...prev,
        status: selectedStatus as CampaignFilters["status"],
        categoryId: selectedCategory,
        sortBy: sortBy as CampaignFilters["sortBy"],
        sortOrder: sortOrder as CampaignFilters["sortOrder"],
        page: 1,
      }),
    });
    setOpen(false);
  };

  const handleReset = () => {
    setSelectedStatus(undefined);
    setSelectedCategory(undefined);
    setSortBy("created");
    setSortOrder("desc");
  };

  const hasActiveFilters =
    !!search.status ||
    !!search.categoryId ||
    search.sortBy !== "created" ||
    search.sortOrder !== "desc";

  const activeFilterCount = [
    !!search.status,
    !!search.categoryId,
    search.sortBy && search.sortBy !== "created",
    search.sortOrder && search.sortOrder !== "desc",
  ].filter(Boolean).length;

  return (
    <Drawer direction="left" open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "h-9 gap-2 transition-colors",
            hasActiveFilters && "bg-primary text-primary-foreground hover:bg-primary/90",
          )}
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {hasActiveFilters && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-background text-xs font-bold text-foreground">
              {activeFilterCount}
            </span>
          )}
        </Button>
      </DrawerTrigger>
      <DrawerContent className="h-full w-[300px] sm:w-[400px] rounded-none border-r">
        <DrawerHeader className="flex flex-row items-center justify-between border-b px-6 py-4">
          <DrawerTitle className="text-xl font-bold">Filters</DrawerTitle>
          <DrawerClose asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </DrawerClose>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
          {/* Status */}
          <div className="space-y-3">
            <h3 className="font-semibold">Status</h3>
            <RadioGroup
              value={selectedStatus ?? "all"}
              onValueChange={(value) => setSelectedStatus(value === "all" ? undefined : value)}
              className="gap-1"
            >
              {CAMPAIGN_STATUSES.map((status) => (
                <div key={status.value} className="flex items-center space-x-2">
                  <RadioGroupItem
                    value={status.value}
                    id={`status-${status.value}`}
                    className="sr-only"
                  />
                  <Label
                    htmlFor={`status-${status.value}`}
                    className={cn(
                      "flex-1 cursor-pointer rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-muted",
                      (selectedStatus ?? "all") === status.value
                        ? "bg-muted"
                        : "text-muted-foreground",
                    )}
                  >
                    {status.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Category */}
          {categories.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold">Category</h3>
              <p className="text-sm text-muted-foreground">Select a category</p>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Badge
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "outline"}
                    className={cn(
                      "cursor-pointer rounded-full px-4 py-1.5 text-sm font-normal hover:bg-secondary/80 transition-colors",
                      selectedCategory === category.id
                        ? "hover:bg-primary/90"
                        : "border-input text-foreground bg-background",
                    )}
                    onClick={() =>
                      setSelectedCategory(
                        selectedCategory === category.id ? undefined : category.id,
                      )
                    }
                  >
                    {category.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Sort By */}
          <div className="space-y-3">
            <h3 className="font-semibold">Sort by</h3>
            <RadioGroup value={sortBy} onValueChange={setSortBy} className="gap-1">
              {SORT_OPTIONS.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <RadioGroupItem
                    value={option.value}
                    id={`sort-${option.value}`}
                    className="sr-only"
                  />
                  <Label
                    htmlFor={`sort-${option.value}`}
                    className={cn(
                      "flex-1 cursor-pointer rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-muted",
                      sortBy === option.value ? "bg-muted" : "text-muted-foreground",
                    )}
                  >
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Sort Order */}
          <div className="space-y-3">
            <h3 className="font-semibold">Order</h3>
            <RadioGroup value={sortOrder} onValueChange={setSortOrder} className="gap-1">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="desc" id="order-desc" className="sr-only" />
                <Label
                  htmlFor="order-desc"
                  className={cn(
                    "flex-1 cursor-pointer rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-muted",
                    sortOrder === "desc" ? "bg-muted" : "text-muted-foreground",
                  )}
                >
                  Descending
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="asc" id="order-asc" className="sr-only" />
                <Label
                  htmlFor="order-asc"
                  className={cn(
                    "flex-1 cursor-pointer rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-muted",
                    sortOrder === "asc" ? "bg-muted" : "text-muted-foreground",
                  )}
                >
                  Ascending
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div>

        <DrawerFooter className="border-t px-6 py-4">
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={handleReset}>
              Reset
            </Button>
            <Button className="flex-1" onClick={handleApply}>
              Apply Filters
            </Button>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
