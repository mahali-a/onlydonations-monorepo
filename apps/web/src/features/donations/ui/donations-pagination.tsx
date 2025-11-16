import { useNavigate } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
};

type DonationsPaginationProps = {
  pagination: Pagination;
};

export function DonationsPagination({ pagination }: DonationsPaginationProps) {
  const navigate = useNavigate({ from: "/o/$orgId/donations" });

  const handlePrevious = () => {
    if (!pagination.hasPrev) return;

    navigate({
      search: (prev) => ({
        ...prev,
        page: pagination.page - 1,
      }),
    });
  };

  const handleNext = () => {
    if (!pagination.hasNext) return;

    navigate({
      search: (prev) => ({
        ...prev,
        page: pagination.page + 1,
      }),
    });
  };

  const startItem = (pagination.page - 1) * pagination.limit + 1;
  const endItem = Math.min(pagination.page * pagination.limit, pagination.total);

  return (
    <div className="flex items-center justify-between">
      <div className="text-sm text-muted-foreground">
        Showing <span className="font-medium">{startItem}</span> to{" "}
        <span className="font-medium">{endItem}</span> of{" "}
        <span className="font-medium">{pagination.total}</span> donations
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={handlePrevious} disabled={!pagination.hasPrev}>
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>

        <div className="flex items-center gap-1">
          <span className="text-sm">
            Page {pagination.page} of {pagination.totalPages}
          </span>
        </div>

        <Button variant="outline" size="sm" onClick={handleNext} disabled={!pagination.hasNext}>
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
