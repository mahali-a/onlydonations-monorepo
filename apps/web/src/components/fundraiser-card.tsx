import { Progress } from "@/components/ui/progress";
import { Money } from "@/lib/money";

interface FundraiserCardProps {
    image: string;
    title: string;
    category: string;
    raised: number;
    goal: number;
    organizer: string;
    currency?: string;
}

export function FundraiserCard({
    image,
    title,
    category,
    raised,
    goal,
    organizer,
    currency = "GHS",
}: FundraiserCardProps) {
    const progress = Math.min((raised / goal) * 100, 100);

    return (
        <div className="group flex flex-col overflow-hidden justify-between rounded-xl border-none transition-all cursor-pointer hover:bg-accent p-2 h-full">
            <div></div>
            <div className="relative aspect-[16/10] w-full overflow-hidden">
                <img
                    src={image}
                    alt={title}
                    className="h-full w-full rounded-xl object-cover transition-transform duration-300"
                />
                <div className="absolute bottom-2 left-2 rounded-md bg-black/60 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm">
                    {category}
                </div>
            </div>
            <div className="flex flex-1 flex-col p-4 px-1">
                <h3 className="line-clamp-2 text-md font-bold leading-tight tracking-tight text-foreground">
                    {title}
                </h3>
                <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="truncate">by {organizer}</span>
                </div>
            </div>
            <div className="mt-auto pt-4 space-y-2">
                <Progress value={progress} className="h-1.5 bg-secondary" />
                <div className="flex items-baseline gap-1">
                    <span className="text-sm font-bold text-foreground">
                        {Money.fromMinor(raised, currency).format({ decimals: 0 })}
                    </span>
                    <span className="text-xs text-muted-foreground">
                        raised
                    </span>
                </div>
            </div>
        </div>
    );
}
