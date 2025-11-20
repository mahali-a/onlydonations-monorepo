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
    <div className="flex justify-center mt-8">
      <Button
        variant="outline"
        size="lg"
        onClick={onLoadMore}
        disabled={isFetchingNextPage}
        className="rounded-full px-8 font-semibold hover:bg-accent hover:border-accent-foreground/20"
      >
        {isFetchingNextPage ? "Loading..." : "Show more"}
      </Button>
    </div>
  );
}
