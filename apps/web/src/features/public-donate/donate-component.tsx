import { useForm } from "@tanstack/react-form";
import { Info, ShieldCheck } from "lucide-react";
import { HoneypotInputs, HoneypotProvider } from "@/components/honeypot-client";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { calculateFees } from "@/lib/fees/calculator";
import { Money } from "@/lib/money";
import { cn } from "@/lib/utils";
import { DonateHeader } from "./donate-header";
import { processDonationOnServer } from "./server";

type DonateComponentProps = {
  data: {
    campaign: {
      id: string;
      slug: string;
      title: string;
      beneficiaryName: string;
      coverImage: string | null;
      currency: string;
      amount: number;
      totalRaised: number;
      feeHandling: "DONOR_ASK_COVER" | "DONOR_REQUIRE_COVER" | "CAMPAIGN_ABSORB";
      donateButtonText: string | null;
    };
  };
};

export function DonateComponent({ data }: DonateComponentProps) {
  const { campaign } = data;

  const ghsToPesewas = (ghs: number): number => {
    return Math.round(ghs * 100);
  };

  const pesewasToGhs = (pesewas: number): number => {
    return pesewas / 100;
  };

  const formatCurrency = (amountInPesewas: number, currency: string = "GHS"): string => {
    return Money.fromMinor(amountInPesewas, currency).format();
  };

  // Calculate progress percentage
  const progressPercentage =
    campaign.amount > 0
      ? Math.min(Math.round((campaign.totalRaised / campaign.amount) * 100), 100)
      : 0;

  const form = useForm({
    defaultValues: {
      amount: 0,
      donorName: "",
      donorEmail: "",
      donorPhone: "",
      donorMessage: "",
      isAnonymous: false,
      coverFees: false,
      currency: "GHS",
    },
    validators: {
      onSubmitAsync: async ({ value }) => {
        try {
          const formData = new FormData();
          formData.append("campaignSlug", campaign.slug);
          formData.append("amount", String(pesewasToGhs(value.amount)));
          formData.append("donorName", value.donorName);
          formData.append("donorEmail", value.donorEmail);
          formData.append("donorPhone", value.donorPhone || "");
          formData.append("donorMessage", value.donorMessage || "");
          formData.append("isAnonymous", String(value.isAnonymous));
          formData.append("coverFees", String(value.coverFees));
          formData.append("currency", value.currency);

          const result = await processDonationOnServer({ data: formData });

          if (!result.success) {
            return {
              form: result.error || "Failed to process donation",
            };
          }

          if (result.success && result.redirectUrl) {
            window.location.href = result.redirectUrl;
          }

          return null;
        } catch (_error) {
          return {
            form: "An error occurred. Please try again.",
          };
        }
      },
    },
  });

  const selectedCurrency = "GHS";
  const presets = [50, 100, 200, 500];

  const handlePresetClick = (value: number) => {
    // Value is in GHS, convert to pesewas for form state
    form.setFieldValue("amount", ghsToPesewas(value));
  };

  return (
    <HoneypotProvider>
      <div className="min-h-screen bg-[#fbf8f6] font-sans text-[#333]">
        <DonateHeader campaignSlug={campaign.slug} />

        <main className="mx-auto max-w-[600px] px-4 py-8">
          <div className="rounded-3xl bg-white p-6 shadow-sm sm:p-8">
            {/* Header Section */}
            <div className="mb-8 flex items-start gap-6">
              <div className="relative flex-shrink-0">
                {/* Progress Circle */}
                <div className="relative h-20 w-20">
                  <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-gray-100"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                    />
                    <path
                      className="text-primary"
                      strokeDasharray={`${progressPercentage}, 100`}
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center text-xs font-bold">
                    {progressPercentage}%
                  </div>
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold leading-tight sm:text-3xl">{campaign.title}</h1>
                <p className="mt-1 text-sm font-medium text-gray-600">
                  You're supporting{" "}
                  <span className="font-bold text-[#333]">{campaign.beneficiaryName}</span>
                </p>
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                form.handleSubmit();
              }}
              className="space-y-6"
            >
              <HoneypotInputs />

              <form.Subscribe selector={(state) => [state.errorMap]}>
                {([errorMap]) =>
                  errorMap?.onSubmit?.form ? (
                    <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
                      <p className="text-sm text-destructive">{errorMap.onSubmit.form}</p>
                    </div>
                  ) : null
                }
              </form.Subscribe>

              {/* Donation Amount Section */}
              <div className="space-y-6">
                <h2 className="text-lg font-bold">Enter your donation</h2>

                <form.Subscribe selector={(state) => [state.values.amount]}>
                  {([amount]) => (
                    <div className="grid grid-cols-4 gap-2">
                      {presets.map((preset) => {
                        const isActive = pesewasToGhs(amount || 0) === preset;
                        return (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => handlePresetClick(preset)}
                            data-track="donation_amount_selected"
                            data-amount={preset}
                            data-currency="GHS"
                            data-selection-type="preset"
                            data-campaign-id={campaign.id}
                            data-campaign-slug={campaign.slug}
                            className={`relative rounded-xl border py-3 text-center text-sm font-bold transition-colors ${
                              isActive
                                ? "border-primary bg-primary/10 text-primary ring-1 ring-primary"
                                : "border-gray-300 bg-white text-[#333] hover:border-gray-400"
                            }`}
                          >
                            GHS {preset}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </form.Subscribe>

                <div className="relative rounded-xl border border-gray-300 bg-white p-3 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary">
                  <div className="flex items-center justify-center">
                    <span className="text-2xl font-bold text-[#333] mr-2">GHS</span>
                    <form.Field
                      name="amount"
                      validators={{
                        onChange: ({ value }) => {
                          if (!value || value < 100) {
                            return "Minimum donation is 1.00 GHS";
                          }
                          if (value > 100000000) {
                            return "Amount too large";
                          }
                          return undefined;
                        },
                      }}
                    >
                      {(field) => (
                        <div className="flex-1">
                          <input
                            type="number"
                            min="1"
                            step="1"
                            placeholder="0"
                            value={pesewasToGhs(field.state.value) || ""}
                            onChange={(e) => {
                              const ghsValue = Number(e.target.value);
                              const pesewasValue = ghsToPesewas(ghsValue);
                              field.handleChange(pesewasValue);
                            }}
                            onBlur={field.handleBlur}
                            className="w-full border-none bg-transparent p-0 text-right text-4xl font-bold text-[#333] focus:ring-0 placeholder:text-gray-300 leading-none outline-none"
                          />
                        </div>
                      )}
                    </form.Field>
                    <span className="text-4xl font-bold text-[#333] ml-1">.00</span>
                  </div>
                </div>
                <form.Subscribe selector={(state) => [state.fieldMeta.amount?.errors]}>
                  {([errors]) =>
                    errors && errors.length > 0 ? (
                      <p className="text-sm text-destructive text-center">{errors[0]}</p>
                    ) : null
                  }
                </form.Subscribe>
              </div>

              {/* Donor Information */}
              <div className="space-y-4 pt-4">
                <h2 className="text-lg font-bold">Your details</h2>

                <div className="grid gap-4">
                  <form.Field
                    name="donorName"
                    validators={{
                      onChange: ({ value }) => {
                        // Name is always required, even when anonymous
                        if (!value || value.trim().length < 2) {
                          return "Name is required";
                        }
                        return undefined;
                      },
                    }}
                  >
                    {(field) => (
                      <Field>
                        <Label htmlFor={field.name} className="sr-only">
                          Name
                        </Label>
                        <Input
                          id={field.name}
                          name={field.name}
                          placeholder="Full name"
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          onBlur={field.handleBlur}
                          className={cn(
                            "h-10",
                            field.state.meta.errors.length > 0 &&
                              "border-destructive focus-visible:ring-destructive",
                          )}
                        />
                        <FieldError
                          errors={field.state.meta.errors.map((e) => ({
                            message: e,
                          }))}
                        />
                      </Field>
                    )}
                  </form.Field>

                  <form.Field
                    name="donorEmail"
                    validators={{
                      onChange: ({ value }) => {
                        if (!value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                          return "Valid email is required";
                        }
                        return undefined;
                      },
                    }}
                  >
                    {(field) => (
                      <Field>
                        <Label htmlFor={field.name} className="sr-only">
                          Email
                        </Label>
                        <Input
                          id={field.name}
                          type="email"
                          placeholder="Email address"
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          onBlur={field.handleBlur}
                          className={cn(
                            "h-10",
                            field.state.meta.errors.length > 0 &&
                              "border-destructive focus-visible:ring-destructive",
                          )}
                        />
                        <FieldError
                          errors={field.state.meta.errors.map((e) => ({
                            message: e,
                          }))}
                        />
                      </Field>
                    )}
                  </form.Field>

                  <form.Field name="donorPhone">
                    {(field) => (
                      <Field>
                        <Label htmlFor={field.name} className="sr-only">
                          Phone
                        </Label>
                        <Input
                          id={field.name}
                          type="tel"
                          placeholder="Phone number (optional)"
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          onBlur={field.handleBlur}
                          className="h-10"
                        />
                      </Field>
                    )}
                  </form.Field>
                </div>
              </div>

              {/* Checkboxes */}
              <div className="space-y-4 pt-2">
                <form.Field name="isAnonymous">
                  {(field) => (
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id={field.name}
                        checked={field.state.value}
                        onCheckedChange={(checked) => field.handleChange(checked as boolean)}
                        className="mt-0.5 border-gray-400 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                      />
                      <div className="grid gap-1.5 leading-none">
                        <label
                          htmlFor={field.name}
                          className="text-sm font-medium leading-normal text-gray-700 cursor-pointer"
                        >
                          Don't display my name publicly on the fundraiser.{" "}
                          <Info className="inline h-4 w-4 text-gray-400" />
                        </label>
                      </div>
                    </div>
                  )}
                </form.Field>
              </div>

              {/* Summary and Fees */}
              <form.Subscribe
                selector={(state) => [state.values.amount, state.values.coverFees] as const}
              >
                {([amount, coverFees]) => {
                  const parsedAmount = amount || 0;
                  const feeCalculation =
                    parsedAmount >= 100
                      ? calculateFees(pesewasToGhs(parsedAmount), campaign.feeHandling, coverFees)
                      : null;

                  if (!feeCalculation) return null;

                  return (
                    <div className="mt-8 space-y-4 border-t border-gray-200 pt-6">
                      <h2 className="text-lg font-bold">Your donation</h2>

                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Your donation</span>
                        <span>
                          {formatCurrency(
                            ghsToPesewas(feeCalculation.donationAmount),
                            selectedCurrency,
                          )}
                        </span>
                      </div>

                      {campaign.feeHandling !== "DONOR_ASK_COVER" &&
                        feeCalculation.totalFees > 0 && (
                          <div className="flex justify-between text-sm text-gray-600">
                            <span>Fees</span>
                            <span>
                              {formatCurrency(
                                ghsToPesewas(feeCalculation.totalFees),
                                selectedCurrency,
                              )}
                            </span>
                          </div>
                        )}

                      {campaign.feeHandling === "DONOR_ASK_COVER" && (
                        <form.Field name="coverFees">
                          {(field) => (
                            <div className="rounded-xl bg-gray-50 p-4">
                              <div className="flex items-start gap-3">
                                <Checkbox
                                  id={field.name}
                                  checked={field.state.value}
                                  onCheckedChange={(checked) =>
                                    field.handleChange(checked as boolean)
                                  }
                                  className="mt-0.5 border-gray-400 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                />
                                <div className="space-y-1">
                                  <Label
                                    htmlFor={field.name}
                                    className="text-sm font-medium cursor-pointer"
                                  >
                                    Add{" "}
                                    {formatCurrency(
                                      ghsToPesewas(
                                        feeCalculation.platformFee + feeCalculation.paymentFee,
                                      ),
                                      selectedCurrency,
                                    )}{" "}
                                    to cover fees and ensure 100% goes to the campaign.
                                  </Label>
                                </div>
                              </div>
                            </div>
                          )}
                        </form.Field>
                      )}

                      <div className="flex justify-between text-xl font-bold text-[#333] pt-2">
                        <span>Total due today</span>
                        <span>
                          {formatCurrency(ghsToPesewas(feeCalculation.donorPays), selectedCurrency)}
                        </span>
                      </div>

                      <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
                        {([canSubmit, isFormSubmitting]) => (
                          <Button
                            className="w-full rounded-full py-5 font-semibold"
                            disabled={!canSubmit || isFormSubmitting}
                            type="submit"
                            data-track="donation_initiated"
                            data-campaign-id={campaign.id}
                            data-campaign-slug={campaign.slug}
                          >
                            {isFormSubmitting ? "Processing..." : "Donate now"}
                          </Button>
                        )}
                      </form.Subscribe>

                      <p className="text-xs text-gray-500">
                        By clicking Donate now, you agree to OnlyDonation's{" "}
                        <button type="button" className="underline hover:no-underline">
                          Terms of Service
                        </button>{" "}
                        and{" "}
                        <button type="button" className="underline hover:no-underline">
                          Privacy Notice
                        </button>
                        .
                      </p>

                      <div className="mt-6 flex items-start gap-3 rounded-xl border border-gray-200 p-4">
                        <ShieldCheck className="h-6 w-6 flex-shrink-0 text-[#333]" />
                        <div>
                          <h3 className="font-bold text-sm">OnlyDonation protects your donation</h3>
                          <p className="text-xs text-gray-500 mt-1">
                            We guarantee you a full refund in the rare case that fraud occurs.{" "}
                            <button type="button" className="underline hover:no-underline">
                              See our Giving Guarantee.
                            </button>
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                }}
              </form.Subscribe>
            </form>
          </div>
        </main>
      </div>
    </HoneypotProvider>
  );
}
