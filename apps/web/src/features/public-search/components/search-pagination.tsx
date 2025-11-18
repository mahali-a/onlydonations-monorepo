import { Button } from "@/components/ui/button";

type SearchPaginationProps = {
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onLoadMore: () => void;
};

export function SearchPagination({
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
}: SearchPaginationProps) {
  if (!hasNextPage) {
    return null;
  }

  return (
    <div className="flex justify-center">
      <Button
        variant="outline"
        size="lg"
        onClick={onLoadMore}
        disabled={isFetchingNextPage}
        className="rounded-full px-8 font-semibold border-[#767676] text-[#333] hover:bg-secondary/50"
      >
        {isFetchingNextPage ? "Loading..." : "Show more"}
      </Button>
    </div>
  );
}
