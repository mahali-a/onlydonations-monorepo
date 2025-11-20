import { useState, useEffect } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { Search } from "lucide-react";
import type { SelectCategory } from "@repo/core/database/types";
import { lazy, Suspense } from "react";

const SearchFiltersDrawer = lazy(() =>
  import("./search-filters-drawer").then((m) => ({ default: m.SearchFiltersDrawer })),
);

type FilterBarProps = {
  categories: SelectCategory[];
};

export function FilterBar({ categories }: FilterBarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();
  const search = useSearch({ from: "/_public/s" });
  const [query, setQuery] = useState((search as { query?: string }).query || "");

  useEffect(() => {
    const handleScroll = () => {
      const heroHeight = 200; // Approximate height of the hero section
      setIsScrolled(window.scrollY > heroHeight);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({
      to: "/s",
      search: (prev) => ({
        ...prev,
        query: query.trim(),
      }),
    });
  };

  return (
    <div className="w-full border-b bg-white sticky top-0 z-10 transition-shadow duration-200">
      <div className="container mx-auto px-4 py-3 flex items-center relative h-14">
        <div className="z-20">
          <Suspense fallback={<div className="w-10 h-10" />}>
            <SearchFiltersDrawer categories={categories} />
          </Suspense>
        </div>

        <div
          className={`absolute left-1/2 -translate-x-1/2 w-full max-w-md transition-all duration-300 ease-in-out z-10 ${
            isScrolled ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
          }`}
        >
          {isScrolled && (
            <form onSubmit={handleSearch} className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search fundraisers"
                className="w-full h-10 pl-9 pr-4 rounded-full border-none bg-muted/70 text-sm focus:outline-none focus:ring-0 placeholder:text-muted-foreground/50"
              />
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
