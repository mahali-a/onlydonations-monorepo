import { Flag } from "lucide-react";
import { formatCurrency } from "@/lib/money";

type LiveProgressBarProps = {
  raised: number;
  target: number;
  currency: string;
  supportersCount: number;
};

export function LiveProgressBar({
  raised,
  target,
  currency,
  supportersCount,
}: LiveProgressBarProps) {
  const progress = Math.min((raised / target) * 100, 100);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <span className="text-7xl font-bold tracking-tight">
          {formatCurrency(raised, currency)}
        </span>
        <p className="text-xl text-white/70">
          {supportersCount} {supportersCount === 1 ? "supporter" : "supporters"}
        </p>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center text-sm">
          <span className="text-white/60">Progress</span>
          <div className="flex items-center gap-1.5 text-white/90">
            <span>{formatCurrency(target, currency)} goal</span>
            <Flag className="h-4 w-4" />
          </div>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-white/10 backdrop-blur-sm">
          <div
            className="h-full bg-white rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${Math.max(progress, 2)}%` }}
          />
        </div>
        <p className="text-sm text-white/60">{progress.toFixed(0)}% of goal reached</p>
      </div>
    </div>
  );
}
