import { useForm } from "@tanstack/react-form";
import { Link } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { HoneypotInputs, HoneypotProvider } from "@/components/honeypot-client";
import { calculateFees } from "@/lib/fees/calculator";
import { Money } from "@/lib/money";
import { cn } from "@/lib/utils";
import { processDonationOnServer } from "./server";
import { PRESET_DONATION_AMOUNTS } from "./donate-constants";

type DonateComponentProps = {
  data: {
    campaign: {
      id: string;
      slug: string;
      title: string;
      beneficiaryName: string;
      coverImage: string | null;
      currency: string;
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
  const campaignImage = campaign.coverImage || "/placeholder-campaign.jpg";
  const beneficiaryInitial = (campaign.beneficiaryName || campaign.title || "C")
    .charAt(0)
    .toUpperCase();

  const handlePresetClick = (value: number) => {
    form.setFieldValue("amount", value);
  };

  return (
    <HoneypotProvider>
      <div className="bg-muted/30 py-10">
        <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-0">
          <div className="flex justify-center">
            <Link
              className="mb-8 inline-flex items-center gap-2 rounded-full border border-muted-foreground/20 px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-muted-foreground/40 hover:text-foreground"
              to="/f/$slug"
              params={{ slug: campaign.slug }}
            >
              <ChevronLeft className="h-4 w-4" />
              Go Back to Campaign
            </Link>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit();
            }}
            className="space-y-10"
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

            <div className="rounded-[28px] border border-muted-foreground/20 bg-background p-4 shadow-sm sm:p-6 md:p-8">
              {/* Campaign Info */}
              <div className="flex flex-col gap-6 rounded-[20px] bg-muted/40 p-5 md:flex-row md:items-start md:gap-8 md:p-6">
                <img
                  alt={campaign.title}
                  className="h-[138px] w-full rounded-2xl object-cover md:w-[200px]"
                  src={campaignImage}
                />
                <div className="space-y-5">
                  <div className="space-y-2">
                    <span className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
                      Title
                    </span>
                    <h1 className="text-2xl font-semibold text-foreground md:text-[26px]">
                      {campaign.title}
                    </h1>
                  </div>

                  <div className="space-y-3">
                    <span className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
                      Beneficiary
                    </span>
                    <div className="flex items-center gap-3">
                      <div className="flex size-9 items-center justify-center rounded-full bg-orange-100 text-sm font-semibold text-orange-500 shadow-sm">
                        {beneficiaryInitial}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {campaign.beneficiaryName}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 space-y-8">
                {/* Amount Selection */}
                <section className="space-y-4">
                  <h2 className="text-sm font-medium text-muted-foreground">
                    Select or enter your donation amount
                  </h2>

                  <form.Subscribe selector={(state) => [state.values.amount]}>
                    {([amount]) => (
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                        {PRESET_DONATION_AMOUNTS.map((preset) => {
                          const isActive = (amount || 0) === preset;
                          return (
                            <button
                              key={preset}
                              type="button"
                              onClick={() => handlePresetClick(preset)}
                              className={`rounded-xl border border-muted-foreground/20 px-4 py-3 text-center text-sm font-semibold transition-colors duration-150 sm:text-base ${
                                isActive
                                  ? "border-orange-200 bg-orange-100 text-orange-900"
                                  : "bg-background text-muted-foreground hover:border-orange-200 hover:bg-orange-50 hover:text-orange-900"
                              }`}
                            >
                              {formatCurrency(preset, selectedCurrency)}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </form.Subscribe>

                  <div className="space-y-3">
                    <form.Field
                      name="amount"
                      validators={{
                        onChange: ({ value }) => {
                          if (!value || value < 100) {
                            return "Minimum donation is 1.00 GHS (100 pesewas)";
                          }
                          if (value > 100000000) {
                            return "Amount too large (max 1,000,000 GHS)";
                          }
                          return undefined;
                        },
                      }}
                    >
                      {(field) => (
                        <Field>
                          <Input
                            type="number"
                            min="1"
                            step="0.01"
                            placeholder="0.00"
                            value={pesewasToGhs(field.state.value) || ""}
                            onChange={(e) => {
                              const ghsValue = Number(e.target.value);
                              const pesewasValue = ghsToPesewas(ghsValue);
                              field.handleChange(pesewasValue);
                            }}
                            onBlur={field.handleBlur}
                            aria-invalid={field.state.meta.errors.length > 0}
                            aria-label="Donation amount"
                            className={cn(
                              "h-11 rounded-xl border border-muted-foreground/20 bg-background px-4 text-left text-lg font-semibold",
                              field.state.meta.errors.length > 0 &&
                                "border-destructive/60 focus-visible:ring-destructive",
                            )}
                          />
                          <FieldError
                            errors={field.state.meta.errors.map((err) => ({ message: err }))}
                          />
                        </Field>
                      )}
                    </form.Field>
                  </div>
                </section>

                <div className="h-px bg-muted-foreground/10" />

                {/* Donor Information */}
                <section className="space-y-6">
                  <form.Field
                    name="donorName"
                    validators={{
                      onChange: ({ value }) => {
                        if (!value || value.trim().length < 2) {
                          return "Name is required (minimum 2 characters)";
                        }
                        if (value.length > 100) {
                          return "Name too long (maximum 100 characters)";
                        }
                        return undefined;
                      },
                    }}
                  >
                    {(field) => (
                      <Field>
                        <FieldLabel
                          htmlFor={field.name}
                          className="text-sm font-medium text-muted-foreground"
                        >
                          Your name
                        </FieldLabel>
                        <Input
                          id={field.name}
                          type="text"
                          placeholder="Full name"
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          onBlur={field.handleBlur}
                          aria-invalid={field.state.meta.errors.length > 0}
                          className={cn(
                            "h-11 rounded-xl border border-muted-foreground/20 bg-background px-4 text-sm",
                            field.state.meta.errors.length > 0 &&
                              "border-destructive/60 focus-visible:ring-destructive",
                          )}
                        />
                        <FieldError
                          errors={field.state.meta.errors.map((err) => ({ message: err }))}
                        />
                      </Field>
                    )}
                  </form.Field>

                  <form.Field
                    name="donorEmail"
                    validators={{
                      onChange: ({ value }) => {
                        if (!value || value.trim().length === 0) {
                          return "Email is required";
                        }
                        // Basic email validation regex
                        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                        if (!emailRegex.test(value)) {
                          return "Invalid email address";
                        }
                        if (value.length > 254) {
                          return "Email too long";
                        }
                        return undefined;
                      },
                    }}
                  >
                    {(field) => (
                      <Field>
                        <FieldLabel
                          htmlFor={field.name}
                          className="text-sm font-medium text-muted-foreground"
                        >
                          Your email address
                        </FieldLabel>
                        <Input
                          id={field.name}
                          type="email"
                          placeholder="Email address"
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          onBlur={field.handleBlur}
                          autoComplete="email"
                          aria-invalid={field.state.meta.errors.length > 0}
                          className={cn(
                            "h-11 rounded-xl border border-muted-foreground/20 bg-background px-4 text-sm",
                            field.state.meta.errors.length > 0 &&
                              "border-destructive/60 focus-visible:ring-destructive",
                          )}
                        />
                        <FieldError
                          errors={field.state.meta.errors.map((err) => ({ message: err }))}
                        />
                      </Field>
                    )}
                  </form.Field>

                  <form.Field
                    name="donorPhone"
                    validators={{
                      onChange: ({ value }) => {
                        if (!value || value.trim().length === 0) {
                          return undefined; // Optional field
                        }
                        const cleaned = value.trim().replace(/\s+/g, "");
                        const ghanaPhoneRegex = /^(\+233|0)?[235]\d{8}$/;
                        if (!ghanaPhoneRegex.test(cleaned)) {
                          return "Invalid Ghana phone number (e.g., 0241234567 or +233241234567)";
                        }
                        return undefined;
                      },
                    }}
                  >
                    {(field) => (
                      <Field>
                        <FieldLabel
                          htmlFor={field.name}
                          className="text-sm font-medium text-muted-foreground"
                        >
                          Your phone number
                        </FieldLabel>
                        <Input
                          id={field.name}
                          type="tel"
                          placeholder="Phone number"
                          value={field.state.value || ""}
                          onChange={(e) => field.handleChange(e.target.value)}
                          onBlur={field.handleBlur}
                          aria-invalid={field.state.meta.errors.length > 0}
                          className={cn(
                            "h-11 rounded-xl border border-muted-foreground/20 bg-background px-4 text-sm",
                            field.state.meta.errors.length > 0 &&
                              "border-destructive/60 focus-visible:ring-destructive",
                          )}
                        />
                        <FieldError
                          errors={field.state.meta.errors.map((err) => ({ message: err }))}
                        />
                      </Field>
                    )}
                  </form.Field>

                  <form.Field name="isAnonymous">
                    {(field) => (
                      <div className="rounded-2xl border border-muted-foreground/20 bg-muted/40 p-4 sm:p-5">
                        <div className="flex items-start gap-3">
                          <Checkbox
                            id={field.name}
                            checked={field.state.value}
                            onCheckedChange={(checked) => field.handleChange(checked as boolean)}
                          />
                          <div className="space-y-2 text-sm text-muted-foreground">
                            <Label
                              htmlFor={field.name}
                              className="text-sm font-medium text-foreground cursor-pointer"
                            >
                              Keep my name private on the donation
                            </Label>
                            <p className="text-xs leading-5 text-muted-foreground">
                              You will appear as "Anonymous" to other donors. Organizers can still
                              view your details in line with our Privacy Notice.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </form.Field>
                </section>

                <div className="h-px bg-muted-foreground/10" />

                <form.Subscribe
                  selector={(state) => [state.values.amount, state.values.coverFees] as const}
                >
                  {([amount, coverFees]) => {
                    const parsedAmount = amount || 0;
                    const feeCalculation =
                      parsedAmount >= 100
                        ? calculateFees(pesewasToGhs(parsedAmount), campaign.feeHandling, coverFees)
                        : null;

                    return (
                      <section className="space-y-5">
                        {feeCalculation && (
                          <div className="space-y-4 rounded-2xl border border-muted-foreground/20 bg-muted/30 p-4 sm:p-6">
                            <h3 className="text-sm font-medium text-foreground mb-3">
                              Donation Summary
                            </h3>

                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-sm text-muted-foreground">
                                <span>Donation amount</span>
                                <span>
                                  {formatCurrency(
                                    ghsToPesewas(feeCalculation.donationAmount),
                                    selectedCurrency,
                                  )}
                                </span>
                              </div>

                              {campaign.feeHandling !== "DONOR_ASK_COVER" &&
                                feeCalculation.totalFees > 0 && (
                                  <>
                                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                                      <span>Platform fee (1%)</span>
                                      <span>
                                        {formatCurrency(
                                          ghsToPesewas(feeCalculation.platformFee),
                                          selectedCurrency,
                                        )}
                                      </span>
                                    </div>

                                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                                      <span>Payment provider fee (1.95%)</span>
                                      <span>
                                        {formatCurrency(
                                          ghsToPesewas(feeCalculation.paymentFee),
                                          selectedCurrency,
                                        )}
                                      </span>
                                    </div>
                                  </>
                                )}

                              {campaign.feeHandling === "DONOR_ASK_COVER" && (
                                <div className="flex items-center justify-between text-sm">
                                  <span>Campaign receives</span>
                                  <span className="font-medium">
                                    {formatCurrency(
                                      ghsToPesewas(feeCalculation.campaignReceives),
                                      selectedCurrency,
                                    )}
                                  </span>
                                </div>
                              )}

                              <div className="h-px bg-muted-foreground/20" />

                              <div className="flex items-center justify-between text-sm font-semibold text-foreground">
                                <span>Total you pay</span>
                                <span>
                                  {formatCurrency(
                                    ghsToPesewas(feeCalculation.donorPays),
                                    selectedCurrency,
                                  )}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}

                        {campaign.feeHandling === "DONOR_ASK_COVER" && feeCalculation && (
                          <form.Field name="coverFees">
                            {(field) => (
                              <div className="rounded-2xl border border-orange-100 bg-orange-50 p-4">
                                <div className="flex items-start gap-3">
                                  <Checkbox
                                    id={field.name}
                                    checked={field.state.value}
                                    onCheckedChange={(checked) =>
                                      field.handleChange(checked as boolean)
                                    }
                                  />
                                  <div className="space-y-1">
                                    <Label
                                      htmlFor={field.name}
                                      className="text-sm font-medium text-orange-900 cursor-pointer"
                                    >
                                      Help cover platform and payment processing fees
                                      <span className="font-semibold text-orange-700">
                                        {" "}
                                        (+
                                        {formatCurrency(
                                          ghsToPesewas(
                                            feeCalculation.platformFee + feeCalculation.paymentFee,
                                          ),
                                          selectedCurrency,
                                        )}
                                        )
                                      </span>
                                    </Label>
                                    <p className="text-xs text-orange-700">
                                      By covering fees, the campaign receives the full{" "}
                                      {formatCurrency(
                                        ghsToPesewas(feeCalculation.donationAmount),
                                        selectedCurrency,
                                      )}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </form.Field>
                        )}

                        <div className="space-y-3">
                          <form.Subscribe
                            selector={(state) => [state.canSubmit, state.isSubmitting]}
                          >
                            {([canSubmit, isFormSubmitting]) => (
                              <Button
                                className="w-full rounded-xl bg-foreground text-background shadow-[0px_4px_8px_0px_rgba(252,168,85,0.5)] transition duration-150 hover:bg-foreground/90"
                                disabled={!canSubmit || isFormSubmitting}
                                size="lg"
                                type="submit"
                              >
                                {isFormSubmitting
                                  ? "Processing..."
                                  : `Donate ${feeCalculation ? formatCurrency(ghsToPesewas(feeCalculation.donorPays), selectedCurrency) : formatCurrency(parsedAmount, selectedCurrency)}`}
                              </Button>
                            )}
                          </form.Subscribe>
                        </div>
                      </section>
                    );
                  }}
                </form.Subscribe>
              </div>
            </div>
          </form>
        </div>
      </div>
    </HoneypotProvider>
  );
}
