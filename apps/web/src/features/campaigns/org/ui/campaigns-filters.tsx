import { useNavigate } from "@tanstack/react-router";
import { Search, X } from "lucide-react";
import type { SelectCategory } from "@repo/core/database/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CampaignFilters } from "../campaigns-schemas";

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

  const handleStatusChange = (value: string) => {
    navigate({
      search: (prev) => ({
        ...prev,
        status: value === "all" ? undefined : (value as CampaignFilters["status"]),
        page: 1,
      }),
    });
  };

  const handleCategoryChange = (value: string) => {
    navigate({
      search: (prev) => ({
        ...prev,
        categoryId: value === "all" ? undefined : value,
        page: 1,
      }),
    });
  };

  const handleClearFilters = () => {
    onSearchChange("");
    navigate({
      search: {
        page: 1,
        limit: filters.limit || 10,
      },
    });
  };

  const hasActiveFilters = !!(filters.search || filters.status || filters.categoryId);

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
            className="pl-9"
          />
        </div>
      </form>

      <Select value={filters.status || "all"} onValueChange={handleStatusChange}>
        <SelectTrigger className="w-full md:w-48">
          <SelectValue placeholder="All Statuses" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          <SelectItem value="DRAFT">Draft</SelectItem>
          <SelectItem value="UNDER_REVIEW">Under Review</SelectItem>
          <SelectItem value="ACTIVE">Active</SelectItem>
          <SelectItem value="COMPLETED">Completed</SelectItem>
          <SelectItem value="REJECTED">Rejected</SelectItem>
          <SelectItem value="CANCELLED">Cancelled</SelectItem>
        </SelectContent>
      </Select>

      <Select value={filters.categoryId || "all"} onValueChange={handleCategoryChange}>
        <SelectTrigger className="w-full md:w-48">
          <SelectValue placeholder="All Categories" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          {categories.map((category) => (
            <SelectItem key={category.id} value={category.id}>
              {category.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasActiveFilters && (
        <Button variant="outline" size="icon" onClick={handleClearFilters} title="Clear filters">
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
