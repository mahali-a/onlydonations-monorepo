import { useNavigate, useSearch } from "@tanstack/react-router";
import { SlidersHorizontal, X } from "lucide-react";
import * as React from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import type { DonationFilters } from "../org-donations-schema";

const DONATION_STATUSES = [
  { value: "all", label: "All Statuses" },
  { value: "SUCCESS", label: "Completed" },
  { value: "PENDING", label: "Pending" },
  { value: "FAILED", label: "Failed" },
];

const SORT_OPTIONS = [
  { value: "createdAt", label: "Date" },
  { value: "amount", label: "Amount" },
  { value: "donorName", label: "Donor Name" },
  { value: "donorEmail", label: "Donor Email" },
  { value: "campaignTitle", label: "Campaign" },
];

export function DonationsFiltersDrawer() {
  const navigate = useNavigate();
  const search = useSearch({ from: "/o/$orgId/donations" }) as Partial<DonationFilters>;
  const [open, setOpen] = React.useState(false);

  // Local state for filters
  const [selectedStatus, setSelectedStatus] = React.useState<string | undefined>(search.status);
  const [dateFrom, setDateFrom] = React.useState(search.dateFrom ?? "");
  const [dateTo, setDateTo] = React.useState(search.dateTo ?? "");
  const [minAmount, setMinAmount] = React.useState(search.minAmount?.toString() ?? "");
  const [maxAmount, setMaxAmount] = React.useState(search.maxAmount?.toString() ?? "");
  const [sortBy, setSortBy] = React.useState(search.sortBy ?? "createdAt");
  const [sortOrder, setSortOrder] = React.useState(search.sortOrder ?? "desc");

  // Sync with URL when drawer opens
  React.useEffect(() => {
    if (open) {
      setSelectedStatus(search.status);
      setDateFrom(search.dateFrom ?? "");
      setDateTo(search.dateTo ?? "");
      setMinAmount(search.minAmount?.toString() ?? "");
      setMaxAmount(search.maxAmount?.toString() ?? "");
      setSortBy(search.sortBy ?? "createdAt");
      setSortOrder(search.sortOrder ?? "desc");
    }
  }, [open, search]);

  const handleApply = () => {
    navigate({
      // @ts-expect-error - TanStack Router type inference limitation
      search: (prev: Partial<DonationFilters>) => ({
        ...prev,
        status: selectedStatus as DonationFilters["status"],
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        minAmount: minAmount ? Number(minAmount) : undefined,
        maxAmount: maxAmount ? Number(maxAmount) : undefined,
        sortBy: sortBy as DonationFilters["sortBy"],
        sortOrder: sortOrder as DonationFilters["sortOrder"],
        page: 1,
      }),
    });
    setOpen(false);
  };

  const handleReset = () => {
    setSelectedStatus(undefined);
    setDateFrom("");
    setDateTo("");
    setMinAmount("");
    setMaxAmount("");
    setSortBy("createdAt");
    setSortOrder("desc");
  };

  const hasActiveFilters =
    !!search.status ||
    !!search.dateFrom ||
    !!search.dateTo ||
    search.minAmount !== undefined ||
    search.maxAmount !== undefined ||
    search.sortBy !== "createdAt" ||
    search.sortOrder !== "desc";

  const activeFilterCount = [
    !!search.status,
    !!search.dateFrom || !!search.dateTo,
    search.minAmount !== undefined || search.maxAmount !== undefined,
    search.sortBy && search.sortBy !== "createdAt",
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
              {DONATION_STATUSES.map((status) => (
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

          {/* Date Range */}
          <div className="space-y-3">
            <h3 className="font-semibold">Date Range</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="dateFrom" className="text-sm text-muted-foreground">
                  From
                </Label>
                <Input
                  id="dateFrom"
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="dateTo" className="text-sm text-muted-foreground">
                  To
                </Label>
                <Input
                  id="dateTo"
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Amount Range */}
          <div className="space-y-3">
            <h3 className="font-semibold">Amount Range</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="minAmount" className="text-sm text-muted-foreground">
                  Min
                </Label>
                <Input
                  id="minAmount"
                  type="number"
                  placeholder="0"
                  value={minAmount}
                  onChange={(e) => setMinAmount(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="maxAmount" className="text-sm text-muted-foreground">
                  Max
                </Label>
                <Input
                  id="maxAmount"
                  type="number"
                  placeholder="No limit"
                  value={maxAmount}
                  onChange={(e) => setMaxAmount(e.target.value)}
                />
              </div>
            </div>
          </div>

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
                  Newest First
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
                  Oldest First
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
