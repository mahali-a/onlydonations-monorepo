import { useParams } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export function PayoutAccountRequired() {
  const { orgId } = useParams({ from: "/o/$orgId/payments/" });

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm flex flex-col gap-4 px-5 py-4">
      <p className="font-medium">Your Payout account is missing information.</p>

      <Separator />

      <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
        <div className="border border-border shadow-sm flex aspect-square flex-shrink-0 items-center justify-center size-10 rounded-lg text-base text-primary bg-card">
          <Building2 className="h-5 w-5" />
        </div>

        <div className="flex w-full flex-col gap-2">
          <p className="font-medium">Bank account required</p>
          <div className="flex flex-col text-sm text-muted-foreground">
            <span>Connect a bank account or mobile money account to begin withdrawing funds.</span>
            <span>You must add a withdrawal account to receive payouts.</span>
          </div>
        </div>

        <Button asChild className="whitespace-nowrap">
          <Link to="/o/$orgId/payments/withdrawal-accounts" params={{ orgId }}>
            Add Payout Method
          </Link>
        </Button>
      </div>
    </div>
  );
}
