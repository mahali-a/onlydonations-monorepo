import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

type RecipientsFiltersProps = {
  search: string;
  onSearchChange: (search: string) => void;
};

export function RecipientsFilters({ search, onSearchChange }: RecipientsFiltersProps) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
      <div className="flex w-full md:flex-1">
        <div className="relative flex-1">
          <div className="pointer-events-none absolute top-0 bottom-0 left-3 z-10 flex items-center gap-0.5 text-gray-9">
            <Search className="h-4 w-4 text-gray-500" />
          </div>
          <Input
            className="rounded-lg pl-10"
            defaultValue={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search accounts..."
            type="text"
          />
        </div>
      </div>
    </div>
  );
}
