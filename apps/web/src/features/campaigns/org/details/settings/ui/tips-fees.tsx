import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { calculateFees, formatCurrency } from "@/lib/fees/calculator";
import { FEE_CONFIG } from "@/lib/fees/config";
import type { AnyFieldApi } from "@tanstack/react-form";

const EXAMPLE_DONATION = 100;

type TipsFeesProps = {
  feeHandlingField: AnyFieldApi;
  hasDonations?: boolean;
  isEditable?: boolean;
};

export function TipsFees({
  feeHandlingField,
  hasDonations = false,
  isEditable = true,
}: TipsFeesProps) {
  const feeSetting = feeHandlingField.state.value || "DONOR_ASK_COVER";
  const fees = calculateFees(EXAMPLE_DONATION, feeSetting);

  const handleFeeSettingChange = (value: string) => {
    if (
      value === "DONOR_ASK_COVER" ||
      value === "DONOR_REQUIRE_COVER" ||
      value === "CAMPAIGN_ABSORB"
    ) {
      feeHandlingField.handleChange(value);
    }
  };

  return (
    <div className="grid grid-cols-12 gap-4">
      <div className="col-span-full md:col-span-4">
        <div className="flex w-72 max-w-full shrink-0 flex-col gap-6">
          <div>
            <div className="text-lg font-medium">Fee handling</div>
            <p className="text-sm text-muted-foreground">
              Choose how platform and processing fees are handled for your campaign.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <div className="w-full rounded-xl border border-border bg-muted/50 p-6">
              <div style={{ opacity: 1 }}>
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col gap-2">
                    <p className="text-xs uppercase tracking-widest text-muted-foreground">
                      Fee Structure
                    </p>
                    <div className="flex flex-col gap-1">
                      <p className="font-medium">
                        {FEE_CONFIG.platform.description}:{" "}
                        {(FEE_CONFIG.platform.percentage * 100).toFixed(2)}%
                      </p>
                      <p className="text-sm text-foreground">
                        {FEE_CONFIG.payment.description}:{" "}
                        {(FEE_CONFIG.payment.percentage * 100).toFixed(2)}%
                      </p>
                    </div>
                  </div>

                  <div className="h-px bg-border" />

                  <div className="flex flex-col gap-2">
                    <p className="text-xs uppercase tracking-widest text-muted-foreground">
                      Example: {formatCurrency(EXAMPLE_DONATION)} Donation
                    </p>
                    <div className="flex flex-col gap-1.5">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Donor pays:</span>
                        <span className="font-medium">{formatCurrency(fees.donorPays)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Campaign receives:</span>
                        <span className="font-medium">{formatCurrency(fees.campaignReceives)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Total fees:</span>
                        <span className="font-medium">{formatCurrency(fees.totalFees)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="h-px bg-border" />

                  <div className="flex flex-col gap-1">
                    {feeSetting === "CAMPAIGN_ABSORB" && (
                      <div className="rounded-md bg-primary/10 p-2">
                        <p className="text-xs text-primary/80 font-medium">
                          Campaign absorbs all fees
                        </p>
                      </div>
                    )}
                    {feeSetting === "DONOR_REQUIRE_COVER" && (
                      <div className="rounded-md bg-emerald-50 dark:bg-emerald-950 p-2">
                        <p className="text-xs text-emerald-700 dark:text-emerald-300 font-medium">
                          Donors cover all fees
                        </p>
                      </div>
                    )}
                    {feeSetting === "DONOR_ASK_COVER" && (
                      <div className="rounded-md bg-blue-50 dark:bg-blue-950 p-2">
                        <p className="text-xs text-blue-700 dark:text-blue-300 font-medium">
                          Donors can choose to cover fees
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="col-span-full md:col-span-8 md:col-start-6 flex flex-col gap-4">
        <RadioGroup
          value={feeSetting}
          onValueChange={handleFeeSettingChange}
          className="space-y-0"
          disabled={hasDonations || !isEditable}
        >
          <div
            className="rounded-xl bg-background p-4 ring-1 ring-input data-[state=checked]:ring-2 data-[state=checked]:ring-inset data-[state=checked]:ring-primary"
            data-state={feeSetting === "DONOR_ASK_COVER" ? "checked" : "unchecked"}
          >
            <label
              htmlFor="DONOR_ASK_COVER"
              className={cn(
                "flex gap-2",
                hasDonations || !isEditable ? "cursor-not-allowed" : "cursor-pointer",
              )}
            >
              <RadioGroupItem
                value="DONOR_ASK_COVER"
                id="DONOR_ASK_COVER"
                className="mt-0.5 cursor-not-allowed"
                disabled={hasDonations || !isEditable}
              />
              <div className="flex flex-col gap-1">
                <div className="flex flex-wrap gap-x-2 gap-y-1">
                  <span className="text-sm font-medium">Ask donors to cover fees</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Donors can choose to cover platform (1%) and payment provider processing fees
                  (1.95%). Campaign receives full donation amount if they choose to cover fees.
                </p>
              </div>
            </label>
          </div>

          <div
            className="rounded-xl bg-background p-4 ring-1 ring-input data-[state=checked]:ring-2 data-[state=checked]:ring-inset data-[state=checked]:ring-primary"
            data-state={feeSetting === "DONOR_REQUIRE_COVER" ? "checked" : "unchecked"}
          >
            <label
              htmlFor="DONOR_REQUIRE_COVER"
              className={cn(
                "flex gap-2",
                hasDonations || !isEditable ? "cursor-not-allowed" : "cursor-pointer",
              )}
            >
              <RadioGroupItem
                value="DONOR_REQUIRE_COVER"
                id="DONOR_REQUIRE_COVER"
                className="mt-0.5"
                disabled={hasDonations || !isEditable}
              />
              <div className="flex flex-col gap-1">
                <div className="flex flex-wrap gap-x-2 gap-y-1">
                  <span className="text-sm font-medium">Require donors to cover fees</span>
                </div>
                <p className="text-left text-sm text-muted-foreground">
                  Donors will automatically cover platform (1%) and payment provider processing fees
                  (1.95%). Campaign receives full donation amount.
                </p>
              </div>
            </label>
          </div>

          <div
            className="rounded-xl bg-background p-4 ring-1 ring-input data-[state=checked]:ring-2 data-[state=checked]:ring-inset data-[state=checked]:ring-primary"
            data-state={feeSetting === "CAMPAIGN_ABSORB" ? "checked" : "unchecked"}
          >
            <label
              htmlFor="CAMPAIGN_ABSORB"
              className={cn(
                "flex gap-2",
                hasDonations || !isEditable ? "cursor-not-allowed" : "cursor-pointer",
              )}
            >
              <RadioGroupItem
                value="CAMPAIGN_ABSORB"
                id="CAMPAIGN_ABSORB"
                className="mt-0.5"
                disabled={hasDonations || !isEditable}
              />
              <div className="flex flex-col gap-1">
                <div className="flex flex-wrap gap-x-2 gap-y-1">
                  <span className="text-sm font-medium">Campaign absorbs fees</span>
                </div>
                <p className="text-left text-sm text-muted-foreground">
                  Platform fee (1%) and payment provider processing fees (1.95%) are deducted from
                  the donation. Donors pay only the intended donation amount.
                </p>
              </div>
            </label>
          </div>
        </RadioGroup>
      </div>
    </div>
  );
}
