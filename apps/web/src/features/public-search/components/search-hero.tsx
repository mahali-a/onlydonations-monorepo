import { useState } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

export function SearchHero() {
  const navigate = useNavigate();
  const search = useSearch({ from: "/_public/s" });
  const [query, setQuery] = useState((search as { query?: string }).query || "");

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
    <div className="w-full bg-white pt-16 pb-8 border-b">
      <div className="container mx-auto px-4 flex flex-col items-center text-center">
        <h1 className="text-[#333] text-2xl md:text-[32px] font-bold mb-2">
          Find fundraisers on OnlyDonations
        </h1>
        <p className="text-[#767676] text-base mb-8">
          Help others by donating to their fundraiser, or start one for someone you care about.
        </p>

        <form onSubmit={handleSearch} className="w-full max-w-[600px] relative mb-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#767676]" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, title, or city"
              className="w-full h-[50px] pl-12 pr-24 rounded-full border border-input hover:border-gray-500 focus:border-gray-500 focus:ring-0 transition-colors text-base placeholder:text-[#767676]"
            />
            <Button
              type="submit"
              className="absolute right-1.5 top-1.5 bottom-1.5 rounded-full px-6 bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-[calc(100%-12px)]"
            >
              Search
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
