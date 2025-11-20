import { useNavigate, useSearch } from "@tanstack/react-router";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { DonationFilters } from "../org-donations-schemas";
import { lazy, Suspense } from "react";

const DonationsFiltersDrawer = lazy(() =>
  import("./donations-filters-drawer").then((m) => ({ default: m.DonationsFiltersDrawer })),
);

type SearchParams = Partial<DonationFilters>;

export function DonationsFilters() {
  const navigate = useNavigate();
  const search = useSearch({ from: "/o/$orgId/donations" }) as SearchParams;

  const handleSearchChange = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const searchValue = formData.get("search") as string;
    navigate({
      // @ts-expect-error - TanStack Router type inference limitation
      search: (prev) => ({
        ...prev,
        search: searchValue || undefined,
        page: 1,
      }),
    });
  };

  const handleClearSearch = () => {
    navigate({
      // @ts-expect-error - TanStack Router type inference limitation
      search: (prev) => ({
        ...prev,
        search: undefined,
        page: 1,
      }),
    });
  };

  const hasSearchValue = search?.search && search.search.length > 0;

  return (
    <div className="flex flex-1 flex-col gap-3 md:flex-row md:items-center">
      <form onSubmit={handleSearchChange} className="flex-1">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            name="search"
            placeholder="Search by donor name or email..."
            defaultValue={search?.search ?? ""}
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
          <DonationsFiltersDrawer />
        </Suspense>
      </div>
    </div>
  );
}
