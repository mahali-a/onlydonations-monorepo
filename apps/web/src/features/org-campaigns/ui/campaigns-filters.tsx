import type { SelectCategory } from "@repo/core/database/types";
import { useNavigate } from "@tanstack/react-router";
import { Search, X } from "lucide-react";
import { lazy, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { CampaignFilters } from "../org-campaigns-schema";

const CampaignsFiltersDrawer = lazy(() =>
  import("./campaigns-filters-drawer").then((m) => ({ default: m.CampaignsFiltersDrawer })),
);

type CampaignFiltersProps = {
  filters: CampaignFilters;
  categories: SelectCategory[];
  search: string;
  onSearchChange: (search: string) => void;
};

export function CampaignFiltersComponent({
  filters,
  categories,
  search,
  onSearchChange,
}: CampaignFiltersProps) {
  const navigate = useNavigate({ from: "/o/$orgId/campaigns" });

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({
      search: (prev) => ({
        ...prev,
        search: search || undefined,
        page: 1,
      }),
    });
  };

  const handleClearSearch = () => {
    onSearchChange("");
    navigate({
      search: (prev) => ({
        ...prev,
        search: undefined,
        page: 1,
      }),
    });
  };

  const hasSearchValue = !!filters.search;

  return (
    <div className="flex flex-1 flex-col gap-3 md:flex-row md:items-center">
      <form onSubmit={handleSearchSubmit} className="flex-1">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search campaigns..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 pr-9"
          />
          {hasSearchValue && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2"
              onClick={handleClearSearch}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Clear search</span>
            </Button>
          )}
        </div>
      </form>

      <div className="flex-shrink-0">
        <Suspense fallback={<div className="w-10 h-10" />}>
          <CampaignsFiltersDrawer categories={categories} />
        </Suspense>
      </div>
    </div>
  );
}
