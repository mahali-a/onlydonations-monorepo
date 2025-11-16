import { useNavigate, useSearch } from "@tanstack/react-router";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { DonationFilters } from "../donations-schemas";

type SearchParams = Partial<DonationFilters>;

export function DonationsFilters() {
  const navigate = useNavigate();
  const search = useSearch({ from: "/o/$orgId/donations" }) as SearchParams;

  const handleSearchChange = (value: string) => {
    navigate({
      // @ts-expect-error - TanStack Router type inference limitation: search updater function type inference is lost when route params are parametrized with spreads. The search object is correctly typed at runtime.
      search: (prev) => ({
        ...prev,
        search: value,
        page: 1,
      }),
    });
  };

  const handleStatusChange = (status: string) => {
    navigate({
      // @ts-expect-error - TanStack Router type inference limitation: search updater function type inference is lost when route params are parametrized with spreads. The search object is correctly typed at runtime.
      search: (prev) => ({
        ...prev,
        status: status === "all" ? undefined : status,
        page: 1,
      }),
    });
  };

  const handleClearFilters = () => {
    navigate({
      search: {
        // @ts-expect-error - TanStack Router type inference limitation: search object type inference is lost when route params are parametrized with spreads. The 'page' property exists at runtime and is correctly typed.
        page: 1,
        limit: 50,
      },
    });
  };

  const hasActiveFilters = (search?.search && search.search.length > 0) || search?.status;

  return (
    <div className="space-y-4 mb-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end">
        <div className="flex-1">
          <div className="text-sm font-medium mb-2 block">Search</div>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by donor name or email..."
              className="pl-8"
              value={search?.search ?? ""}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1">
          <div className="text-sm font-medium mb-2 block">Status</div>
          <Select value={search?.status ?? "all"} onValueChange={handleStatusChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="SUCCESS">Completed</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="FAILED">Failed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {hasActiveFilters && (
          <Button variant="outline" size="sm" onClick={handleClearFilters} className="gap-2">
            <X className="h-4 w-4" />
            Clear Filters
          </Button>
        )}
      </div>

      {hasActiveFilters && (
        <div className="text-sm text-muted-foreground">
          Filters applied
          {search?.search && ` • Searching: "${search.search}"`}
          {search?.status && ` • Status: ${search.status}`}
        </div>
      )}
    </div>
  );
}
