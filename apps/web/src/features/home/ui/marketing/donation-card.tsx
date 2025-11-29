import { GiftIcon, Share2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CardContent, CardFooter, CardHeader } from "@/components/ui/card";

import type { HomePageCampaign } from "@/features/home/types";

export function DonationCard({
  slug,
  title,
  location,
  supporters,
  raised,
  target,
  currency,
  imageUrl,
}: HomePageCampaign) {
  const progress = target > 0 ? Math.min(100, Math.round((raised / target) * 100)) : 0;

  return (
    <a
      className="group mx-auto block w-full min-w-[320px] cursor-pointer overflow-hidden rounded-3xl border bg-white py-4 transition-all duration-300 ease-in-out hover:border-gray-100 hover:bg-gray-50 hover:shadow-[0px_1px_1px_0px_#0000000A]"
      href={`/f/${slug}`}
    >
      <CardHeader className="relative overflow-hidden">
        <div className="relative overflow-hidden rounded-xl">
          <img
            alt={title}
            className="aspect-[3/2] w-full rounded-xl object-cover transition-transform duration-500 ease-in-out group-hover:scale-110"
            height={320}
            loading="lazy"
            src={imageUrl}
            width={480}
          />
        </div>
      </CardHeader>
      <CardContent className="px-4 sm:px-4">
        <h2 className="mb-2 truncate font-geist text-base font-semibold text-[#3B4351] transition-colors duration-300 group-hover:text-[#2C3240] sm:text-lg">
          {title}
        </h2>
        <div className="mb-4 flex flex-wrap items-center gap-2 sm:mb-7">
          <span className="rounded-lg bg-gray-100 px-2 py-1 text-xs text-gray-700 sm:px-3 sm:py-1 sm:text-sm">
            {location}
          </span>
          <span className="rounded-lg bg-gray-100 px-2 py-1 text-xs text-gray-700 sm:px-3 sm:py-1 sm:text-sm">
            {supporters} supporters
          </span>
        </div>
        <div className="mb-4">
          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
            <div className="h-full rounded-full bg-orange-400" style={{ width: `${progress}%` }} />
          </div>
          <div className="mt-2 flex items-center justify-between text-gray-600">
            <span className="font-geist text-sm font-semibold text-[#4C5667] group-hover:text-[#3B4351] sm:text-base">
              {currency}
              {raised.toLocaleString()} raised
            </span>
            <span className="font-geist text-xs font-medium text-[#4C5667] sm:text-sm">
              {currency}
              {target.toLocaleString()} Target
            </span>
          </div>
        </div>
        <CardFooter className="flex flex-wrap items-center justify-start gap-2 p-0 sm:gap-4">
          <Button
            asChild
            className="rounded-xl shadow-[0_4px_8px_#FCA85580] transition-all duration-300 sm:w-auto"
          >
            <a className="inline-flex items-center gap-2" href={`/f/${slug}/donate`}>
              <GiftIcon className="h-4 w-4" /> Donate
            </a>
          </Button>
          <Button
            className="rounded-xl transition-all duration-300 sm:w-auto"
            onClick={(event) => {
              event.preventDefault();
              if (typeof window !== "undefined" && typeof navigator !== "undefined") {
                void navigator.clipboard.writeText(`${window.location.origin}/f/${slug}`);
              }
            }}
            type="button"
            variant="outline"
          >
            <Share2Icon className="mr-2 h-4 w-4" /> Share
          </Button>
        </CardFooter>
      </CardContent>
    </a>
  );
}
