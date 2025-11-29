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
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import type { SearchFilters } from "../public-search-schema";

interface SearchFiltersDrawerProps {
  categories: SelectCategory[];
}

const TIME_PERIODS = [
  { value: "all", label: "All time" },
  { value: "24h", label: "Past 24 hours" },
  { value: "7d", label: "Past 7 days" },
  { value: "30d", label: "Past 30 days" },
  { value: "12m", label: "Past 12 months" },
];

// Mock categories if none provided (since we saw empty array in parent)
const MOCK_CATEGORIES = [
  { id: "education", name: "Education" },
  { id: "animals", name: "Animals" },
  { id: "environment", name: "Environment" },
  { id: "business", name: "Business" },
  { id: "medical", name: "Medical" },
  { id: "funeral", name: "Funeral" },
  { id: "emergency", name: "Emergency" },
  { id: "community", name: "Community" },
];

export function SearchFiltersDrawer({ categories }: SearchFiltersDrawerProps) {
  const navigate = useNavigate();
  const search = useSearch({ from: "/_public/s" }) as Partial<SearchFilters>;
  const [open, setOpen] = React.useState(false);

  // Local state for filters
  const [selectedCategory, setSelectedCategory] = React.useState<string | undefined>(
    search.categoryId,
  );
  const [closeToGoal, setCloseToGoal] = React.useState(search.closeToGoal ?? false);
  const [timePeriod, setTimePeriod] = React.useState(search.timePeriod ?? "all");

  // Sync with URL when drawer opens
  React.useEffect(() => {
    if (open) {
      setSelectedCategory(search.categoryId);
      setCloseToGoal(search.closeToGoal ?? false);
      setTimePeriod(search.timePeriod ?? "all");
    }
  }, [open, search]);

  const handleApply = () => {
    navigate({
      to: "/s",
      search: (prev) => ({
        ...prev,
        categoryId: selectedCategory,
        closeToGoal,
        timePeriod,
      }),
    });
    setOpen(false);
  };

  const handleReset = () => {
    setSelectedCategory(undefined);
    setCloseToGoal(false);
    setTimePeriod("all");
  };

  const displayCategories = categories.length > 0 ? categories : MOCK_CATEGORIES;

  const hasActiveFilters =
    !!search.categoryId || search.closeToGoal || (search.timePeriod && search.timePeriod !== "all");

  return (
    <Drawer direction="left" open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "rounded-full h-9 px-4 text-sm font-medium gap-2 transition-colors",
            hasActiveFilters
              ? "bg-secondary text-secondary-foreground border-secondary hover:bg-secondary/90"
              : "hover:bg-accent hover:border-accent-foreground/20",
          )}
        >
          Filters
          {hasActiveFilters && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-[10px] font-bold text-black">
              {
                [
                  !!search.categoryId,
                  search.closeToGoal,
                  search.timePeriod && search.timePeriod !== "all",
                ].filter(Boolean).length
              }
            </span>
          )}
          {!hasActiveFilters && <SlidersHorizontal className="h-4 w-4" />}
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
          {/* Location - Placeholder as per request to exclude but shown in image */}
          {/* <div className="space-y-3">
            <h3 className="font-semibold">Location</h3>
            <p className="text-sm text-muted-foreground">Search for any city or zip code worldwide</p>
            <div className="relative">
               <Input placeholder="City or zip code" className="pl-9 bg-muted/50 border-none" />
               <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            </div>
          </div> */}

          {/* Category */}
          <div className="space-y-3">
            <h3 className="font-semibold">Category</h3>
            <p className="text-sm text-muted-foreground">Choose one or more</p>
            <div className="flex flex-wrap gap-2">
              {displayCategories.map((category) => (
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
                    setSelectedCategory(selectedCategory === category.id ? undefined : category.id)
                  }
                >
                  {category.name}
                </Badge>
              ))}
            </div>
            <Button
              variant="link"
              className="px-0 mt-2 text-sm h-auto font-medium underline decoration-1 underline-offset-4 hover:text-primary"
            >
              Show more
            </Button>
          </div>

          {/* Close to goal */}
          <div className="flex items-center justify-between py-2">
            <div className="space-y-0.5">
              <h3 className="font-semibold">Close to goal</h3>
              <p className="text-sm text-muted-foreground">GHS 100 or less needed</p>
            </div>
            <Switch checked={closeToGoal} onCheckedChange={setCloseToGoal} />
          </div>

          {/* Time period */}
          <div className="space-y-3">
            <h3 className="font-semibold">Time period</h3>
            <RadioGroup value={timePeriod} onValueChange={setTimePeriod} className="gap-1">
              {TIME_PERIODS.map((period) => (
                <div key={period.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={period.value} id={period.value} className="sr-only" />
                  <Label
                    htmlFor={period.value}
                    className={cn(
                      "flex-1 cursor-pointer rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-muted",
                      timePeriod === period.value ? "bg-muted" : "text-muted-foreground",
                    )}
                  >
                    {period.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        </div>

        <DrawerFooter className="border-t px-6 py-4">
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1 rounded-full" onClick={handleReset}>
              Reset
            </Button>
            <Button
              className="flex-1 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground"
              onClick={handleApply}
            >
              See results
            </Button>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
