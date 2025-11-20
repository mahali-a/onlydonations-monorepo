import { MapPin, Users, Calendar } from "lucide-react";
import { calculateDaysRemaining } from "../public-campaign-details-utils";

type CampaignStatsProps = {
  location: string | null;
  supportersCount: number;
  endDate: Date | null;
};

export function CampaignStats({ location, supportersCount, endDate }: CampaignStatsProps) {
  const daysRemaining = calculateDaysRemaining(endDate);

  return (
    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
      {location && (
        <div className="flex items-center gap-1">
          <MapPin className="h-4 w-4" />
          <span>{location}</span>
        </div>
      )}

      <div className="flex items-center gap-1">
        <Users className="h-4 w-4" />
        <span>
          {supportersCount} {supportersCount === 1 ? "supporter" : "supporters"}
        </span>
      </div>

      {daysRemaining !== null && (
        <div className="flex items-center gap-1">
          <Calendar className="h-4 w-4" />
          <span>
            {daysRemaining === 0
              ? "Last day"
              : `${daysRemaining} ${daysRemaining === 1 ? "day" : "days"} left`}
          </span>
        </div>
      )}
    </div>
  );
}
