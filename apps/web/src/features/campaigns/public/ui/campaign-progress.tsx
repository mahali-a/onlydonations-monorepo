import { formatCurrency } from "../campaign-utils";

type CampaignProgressProps = {
  raised: number;
  target: number;
  currency: string;
  progress: number;
};

export function CampaignProgress({ raised, target, currency, progress }: CampaignProgressProps) {
  return (
    <div className="space-y-2">
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${progress}%` }}
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${progress}% of goal reached`}
        />
      </div>

      <div className="flex items-baseline justify-between text-sm">
        <div>
          <span className="text-2xl font-bold text-foreground">
            {formatCurrency(raised, currency)}
          </span>
          <span className="ml-1 text-muted-foreground">raised</span>
        </div>
        <div className="text-right">
          <span className="text-lg font-semibold text-foreground">
            {formatCurrency(target, currency)}
          </span>
          <span className="ml-1 text-muted-foreground">goal</span>
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        <span className="font-semibold">{progress}%</span> of goal reached
      </p>
    </div>
  );
}
