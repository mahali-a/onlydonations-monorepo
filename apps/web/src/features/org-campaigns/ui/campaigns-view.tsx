import type { SelectCategory } from "@repo/core/database/types";
import type { CampaignFilters } from "../org-campaigns-schemas";
import { CampaignFiltersComponent } from "./campaigns-filters";
import { CampaignsDataTable } from "./campaigns-table";
import { CampaignsPagination } from "./campaigns-pagination";
import { NewCampaignDialog } from "./new-campaign-dialog";

type CampaignWithStats = {
  id: string;
  slug: string;
  status: string;
  amount: number;
  currency: string;
  title: string;
  beneficiaryName: string;
  createdAt: Date;
  category: {
    id: string;
    name: string;
  } | null;
  totalRaised: number;
  donationCount: number;
};

type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
};

type CampaignsViewProps = {
  campaigns: CampaignWithStats[];
  categories: SelectCategory[];
  filters: CampaignFilters;
  pagination: Pagination;
  search: string;
  onSearchChange: (search: string) => void;
};

export function CampaignsView({
  campaigns,
  categories,
  filters,
  pagination,
  search,
  onSearchChange,
}: CampaignsViewProps) {
  const hasActiveFilters = !!(filters.search || filters.status || filters.categoryId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <CampaignFiltersComponent
          filters={filters}
          categories={categories}
          search={search}
          onSearchChange={onSearchChange}
        />
      </div>

      {campaigns.length === 0 ? (
        <div className="rounded-lg border border-dashed bg-muted/50 p-12 text-center">
          <div className="mx-auto max-w-md space-y-4">
            <h3 className="text-lg font-semibold">
              {hasActiveFilters ? "No campaigns found" : "No campaigns yet"}
            </h3>
            <p className="text-sm text-muted-foreground">
              {hasActiveFilters
                ? "Try adjusting your filters to find more campaigns."
                : "Start your first fundraising campaign to begin making a difference."}
            </p>
            {!hasActiveFilters && (
              <div className="flex justify-center">
                <NewCampaignDialog categories={categories} />
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <CampaignsDataTable campaigns={campaigns} filters={filters} />
          <CampaignsPagination filters={filters} pagination={pagination} />
        </div>
      )}
    </div>
  );
}
