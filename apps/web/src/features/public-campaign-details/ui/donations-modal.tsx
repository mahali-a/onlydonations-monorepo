import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { Suspense, useEffect, useRef } from "react";
import { donationsInfiniteQueryOptions } from "../public-campaign-details-loaders";
import { DonationItem } from "./donation-item";

type DonationsModalProps = {
    isOpen: boolean;
    onClose: () => void;
    campaignId: string;
    totalDonations: number;
    onDonate: () => void;
};

type DonationsListProps = {
    campaignId: string;
    sort: "newest" | "top";
};

function DonationsListSkeleton() {
    return (
        <div className="space-y-6 py-4">
            {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex gap-3 animate-pulse">
                    <div className="h-10 w-10 rounded-full bg-muted" />
                    <div className="flex-1 space-y-2">
                        <div className="h-4 w-24 bg-muted rounded" />
                        <div className="h-3 w-16 bg-muted rounded" />
                    </div>
                </div>
            ))}
        </div>
    );
}

function DonationsList({ campaignId, sort }: DonationsListProps) {
    const loadMoreRef = useRef<HTMLDivElement>(null);

    const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useSuspenseInfiniteQuery(
        donationsInfiniteQueryOptions(campaignId, sort),
    );

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
                    fetchNextPage();
                }
            },
            { threshold: 0.1 },
        );

        if (loadMoreRef.current) {
            observer.observe(loadMoreRef.current);
        }

        return () => observer.disconnect();
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

    const donations = data.pages.flatMap((page) => page.donations);

    return (
        <ul className="space-y-6 py-4">
            {donations.map((donation) => (
                <DonationItem key={donation.id} donation={donation} showMessage showTime />
            ))}
            {isFetchingNextPage && (
                <div className="flex justify-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
            )}
            <div ref={loadMoreRef} className="h-4" />
        </ul>
    );
}

export function DonationsModal({
    isOpen,
    onClose,
    campaignId,
    totalDonations,
    onDonate,
}: DonationsModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-md p-0 gap-0 sm:rounded-2xl h-[80vh] flex flex-col">
                <DialogHeader className="p-4 pb-2 flex-row items-center justify-between">
                    <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                        Donations{" "}
                        <span className="text-sm font-normal bg-muted px-2 py-0.5 rounded-md text-muted-foreground">
                            {totalDonations}
                        </span>
                    </DialogTitle>
                </DialogHeader>

                <div className="flex-1 min-h-0 flex flex-col">
                    <Tabs defaultValue="newest" className="w-full h-full flex flex-col">
                        <div className="px-4 py-2 shrink-0">
                            <TabsList className="w-fit bg-transparent p-0 gap-4 border-none">
                                <TabsTrigger
                                    value="newest"
                                    className="px-4 data-[state=inactive]:bg-transparent border-b border-transparent data-[state=inactive]:hover:bg-muted"
                                >
                                    Newest
                                </TabsTrigger>
                                <TabsTrigger
                                    value="top"
                                    className="px-4 data-[state=inactive]:bg-transparent border-b border-transparent data-[state=inactive]:hover:bg-muted"
                                >
                                    Top
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        <TabsContent
                            value="newest"
                            className="flex-1 min-h-0 overflow-y-auto px-4 mt-0 data-[state=inactive]:hidden modal-scrollbar"
                        >
                            <Suspense fallback={<DonationsListSkeleton />}>
                                <DonationsList campaignId={campaignId} sort="newest" />
                            </Suspense>
                            <div className="h-24" />
                        </TabsContent>

                        <TabsContent
                            value="top"
                            className="flex-1 min-h-0 overflow-y-auto px-4 mt-0 data-[state=inactive]:hidden modal-scrollbar"
                        >
                            <Suspense fallback={<DonationsList campaignId={campaignId} sort="top" />}>
                                <DonationsList campaignId={campaignId} sort="top" />
                            </Suspense>
                            <div className="h-24" />
                        </TabsContent>
                    </Tabs>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-4 bg-background rounded-b-2xl border-t">
                    <Button
                        className="w-full rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-12 text-lg"
                        onClick={onDonate}
                    >
                        Donate
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
