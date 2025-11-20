import type { SelectCategory } from "@repo/core/database/types";
import { useState } from "react";
import type { CampaignFilters } from "./org-campaigns-schemas";
import { CampaignsView } from "./ui/campaigns-view";
import { NewCampaignDialog } from "./ui/new-campaign-dialog";

type CampaignWithStats = {
  id: string;
  slug: string;
  status: string;
  amount: number;
  currency: string;
  coverImage: string;
  title: string;
  beneficiaryName: string;
  country: string;
  description: string;
  categoryId: string;
  createdBy: string | null;
  organizationId: string;
  publishedAt: Date | null;
  endDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
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

type CampaignsComponentProps = {
  campaigns: CampaignWithStats[];
  categories: SelectCategory[];
  filters: CampaignFilters;
  pagination: Pagination;
};

export function CampaignsComponent({
  campaigns,
  categories,
  filters,
  pagination,
}: CampaignsComponentProps) {
  const [search, setSearch] = useState(filters.search || "");

  return (
    <div className="container mx-auto px-4 lg:px-8 pt-6 w-full space-y-6 bg-background pb-8 overflow-x-auto">
      <div className="w-full flex flex-col md:flex-row items-start md:items-center gap-4 md:justify-between">
        <div className="flex flex-col items-start gap-2 flex-1 min-w-0">
          <h1 className="text-2xl font-bold tracking-tight">Campaigns</h1>
          <p className="text-muted-foreground">
            Manage and track your fundraising campaigns for your organization.
          </p>
        </div>
        <NewCampaignDialog categories={categories} />
      </div>

      <CampaignsView
        campaigns={campaigns}
        categories={categories}
        filters={filters}
        pagination={pagination}
        search={search}
        onSearchChange={setSearch}
      />
    </div>
  );
}
