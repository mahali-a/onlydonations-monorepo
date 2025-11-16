import { useForm } from "@tanstack/react-form";
import { useRouter, useParams } from "@tanstack/react-router";
import { Building2, CheckCircle2, Loader2, Smartphone } from "lucide-react";
import { useEffect, useState } from "react";
import { useAsyncDebouncer } from "@tanstack/react-pacer";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { PaystackBank } from "@/lib/paystack/types";
import { cn } from "@/lib/utils";
import { createWithdrawalAccountOnServer, resolvePaystackAccountNumberOnServer } from "../server";

type NewWithdrawalAccountDialogProps = {
  mobileMoneyBanks: PaystackBank[];
  ghipssBanks: PaystackBank[];
};

interface FormData {
  accountType: "mobile_money" | "ghipss" | "";
  accountNumber: string;
  bankCode: string;
  mobileMoneyProvider: string;
  name: string;
}

const defaultFormValues: FormData = {
  accountType: "",
  accountNumber: "",
  bankCode: "",
  mobileMoneyProvider: "",
  name: "",
};

export function NewWithdrawalAccountDialog({
  mobileMoneyBanks,
  ghipssBanks,
}: NewWithdrawalAccountDialogProps) {
  const [open, setOpen] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const router = useRouter();

  const params = useParams({ from: "/o/$orgId/finance" });

  const form = useForm({
    defaultValues: defaultFormValues,
    validators: {
      onSubmitAsync: async ({ value }) => {
        const result = await createWithdrawalAccountOnServer({
          data: {
            organizationId: params.orgId,
            accountType: value.accountType as "mobile_money" | "ghipss",
            accountNumber: value.accountNumber,
            name: value.name,
            bankCode: value.accountType === "ghipss" ? value.bankCode : undefined,
            mobileMoneyProvider:
              value.accountType === "mobile_money" ? value.mobileMoneyProvider : undefined,
          },
        });

        if (!result.success) {
          return {
            form: result.error || "Failed to create withdrawal account",
          };
        }

        setOpen(false);
        setIsVerified(false);
        router.invalidate();

        return null;
      },
    },
  });

  const resolveAccountDebounced = useAsyncDebouncer(
    async (accountNumber: string, bankOrProviderCode: string) => {
      const result = await resolvePaystackAccountNumberOnServer({
        data: {
          organizationId: params.orgId,
          accountNumber,
          bankCode: bankOrProviderCode,
        },
      });

      if (!result.success || !result.data) {
        setIsVerified(false);
        return;
      }

      const resolvedName = result.data.account_name;
      form.setFieldValue("name", resolvedName);
      setIsVerified(true);
    },
    { wait: 500 },
    (state) => ({ isExecuting: state.isExecuting }),
  );

  useEffect(() => {
    if (!open) {
      form.reset();
      setIsVerified(false);
      resolveAccountDebounced.cancel();
    }
  }, [open, form, resolveAccountDebounced]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="m-0">Add Recipient</Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Withdrawal Account</DialogTitle>
          <DialogDescription>Add a new withdrawal account to receive funds.</DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="space-y-5"
        >
          <form.Subscribe selector={(state) => [state.errorMap]}>
            {([errorMap]) => {
              const error = errorMap?.onSubmit;
              if (!error) return null;

              const errorMessage =
                typeof error === "string" ? error : error?.form || JSON.stringify(error);

              return <div className="text-sm text-destructive">{errorMessage}</div>;
            }}
          </form.Subscribe>

          <form.Field
            name="accountType"
            validators={{
              onChange: ({ value }) => {
                if (!value) return "Please select an account type";
                return undefined;
              },
            }}
          >
            {(field) => (
              <div className="space-y-3">
                <Label>Account Type</Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      field.handleChange("mobile_money");
                      setIsVerified(false);
                      form.setFieldValue("name", "");
                      form.setFieldValue("accountNumber", "");
                      form.setFieldValue("mobileMoneyProvider", "");
                    }}
                    className={cn(
                      "relative flex flex-col items-center gap-3 rounded-lg border-2 p-6 transition-all hover:border-primary/50",
                      field.state.value === "mobile_money"
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-border bg-background",
                    )}
                  >
                    <Smartphone
                      className={cn(
                        "h-8 w-8",
                        field.state.value === "mobile_money"
                          ? "text-primary"
                          : "text-muted-foreground",
                      )}
                    />
                    <div className="text-center">
                      <div
                        className={cn(
                          "font-medium",
                          field.state.value === "mobile_money" ? "text-primary" : "text-foreground",
                        )}
                      >
                        Mobile Money
                      </div>
                      <div className="text-xs text-muted-foreground">MTN, Vodafone, AirtelTigo</div>
                    </div>
                    {field.state.value === "mobile_money" && (
                      <CheckCircle2 className="absolute right-3 top-3 h-5 w-5 text-primary" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      field.handleChange("ghipss");
                      setIsVerified(false);
                      form.setFieldValue("name", "");
                      form.setFieldValue("accountNumber", "");
                      form.setFieldValue("bankCode", "");
                    }}
                    className={cn(
                      "relative flex flex-col items-center gap-3 rounded-lg border-2 p-6 transition-all hover:border-primary/50",
                      field.state.value === "ghipss"
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-border bg-background",
                    )}
                  >
                    <Building2
                      className={cn(
                        "h-8 w-8",
                        field.state.value === "ghipss" ? "text-primary" : "text-muted-foreground",
                      )}
                    />
                    <div className="text-center">
                      <div
                        className={cn(
                          "font-medium",
                          field.state.value === "ghipss" ? "text-primary" : "text-foreground",
                        )}
                      >
                        Bank Account
                      </div>
                      <div className="text-xs text-muted-foreground">GHIPSS Transfer</div>
                    </div>
                    {field.state.value === "ghipss" && (
                      <CheckCircle2 className="absolute right-3 top-3 h-5 w-5 text-primary" />
                    )}
                  </button>
                </div>
                {field.state.meta.errors.length > 0 && (
                  <p className="text-sm text-destructive">{field.state.meta.errors[0]}</p>
                )}
              </div>
            )}
          </form.Field>

          <form.Subscribe selector={(state) => [state.values.accountType]}>
            {([accountType]) =>
              accountType ? (
                <>
                  {accountType === "mobile_money" ? (
                    <form.Field
                      name="mobileMoneyProvider"
                      validators={{
                        onChange: ({ value, fieldApi }) => {
                          const formValues = fieldApi.form.state.values;
                          if (formValues.accountType === "mobile_money" && !value) {
                            return "Please select a mobile money provider";
                          }
                          return undefined;
                        },
                      }}
                    >
                      {(field) => (
                        <div className="space-y-2">
                          <Label htmlFor="mobileMoneyProvider">Mobile Money Provider</Label>
                          <Select
                            value={field.state.value}
                            onValueChange={(value) => {
                              field.handleChange(value);
                              setIsVerified(false);
                              form.setFieldValue("name", "");
                              form.setFieldValue("accountNumber", "");
                            }}
                          >
                            <SelectTrigger
                              className={cn(
                                field.state.meta.errors.length > 0 && "border-destructive",
                              )}
                            >
                              <SelectValue placeholder="Select provider" />
                            </SelectTrigger>
                            <SelectContent>
                              {mobileMoneyBanks.map((bank) => (
                                <SelectItem key={bank.id} value={bank.code}>
                                  {bank.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {field.state.meta.errors.length > 0 && (
                            <p className="text-sm text-destructive">{field.state.meta.errors[0]}</p>
                          )}
                        </div>
                      )}
                    </form.Field>
                  ) : (
                    <form.Field
                      name="bankCode"
                      validators={{
                        onChange: ({ value, fieldApi }) => {
                          const formValues = fieldApi.form.state.values;
                          if (formValues.accountType === "ghipss" && !value) {
                            return "Please select a bank";
                          }
                          return undefined;
                        },
                      }}
                    >
                      {(field) => (
                        <div className="space-y-2">
                          <Label htmlFor="bankCode">Bank</Label>
                          <Select
                            value={field.state.value}
                            onValueChange={(value) => {
                              field.handleChange(value);
                              setIsVerified(false);
                              form.setFieldValue("name", "");
                              form.setFieldValue("accountNumber", "");
                            }}
                          >
                            <SelectTrigger
                              className={cn(
                                field.state.meta.errors.length > 0 && "border-destructive",
                              )}
                            >
                              <SelectValue placeholder="Select bank" />
                            </SelectTrigger>
                            <SelectContent>
                              {ghipssBanks.map((bank) => (
                                <SelectItem key={bank.id} value={bank.code}>
                                  {bank.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {field.state.meta.errors.length > 0 && (
                            <p className="text-sm text-destructive">{field.state.meta.errors[0]}</p>
                          )}
                        </div>
                      )}
                    </form.Field>
                  )}

                  <form.Field
                    name="accountNumber"
                    validators={{
                      onChange: ({ value }) => {
                        if (!value) return "Account number is required";
                        if (value.length < 5) return "Account number must be at least 5 digits";
                        return undefined;
                      },
                    }}
                  >
                    {(field) => (
                      <div className="space-y-2">
                        <Label htmlFor="accountNumber">
                          {accountType === "mobile_money"
                            ? "Mobile Money Number"
                            : "Account Number"}
                        </Label>
                        <div className="relative">
                          <Input
                            id="accountNumber"
                            type="tel"
                            placeholder={
                              accountType === "mobile_money"
                                ? "e.g., 0241234567"
                                : "Enter account number"
                            }
                            value={field.state.value}
                            onChange={(e) => {
                              field.handleChange(e.target.value);
                              setIsVerified(false);
                              form.setFieldValue("name", "");
                            }}
                            onBlur={() => {
                              field.handleBlur();
                              const bankOrProviderCode =
                                accountType === "mobile_money"
                                  ? form.getFieldValue("mobileMoneyProvider")
                                  : form.getFieldValue("bankCode");

                              if (
                                field.state.value &&
                                bankOrProviderCode &&
                                field.state.value.length >= 5 &&
                                field.state.meta.errors.length === 0
                              ) {
                                resolveAccountDebounced.maybeExecute(
                                  field.state.value,
                                  bankOrProviderCode,
                                );
                              }
                            }}
                            className={cn(
                              "pr-10",
                              field.state.meta.errors.length > 0 && "border-destructive",
                            )}
                          />
                          {resolveAccountDebounced.state.isExecuting && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                            </div>
                          )}
                          {isVerified && !resolveAccountDebounced.state.isExecuting && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                            </div>
                          )}
                        </div>
                        {field.state.meta.errors.length > 0 ? (
                          <p className="text-sm text-destructive">{field.state.meta.errors[0]}</p>
                        ) : (
                          <p className="text-xs text-muted-foreground">
                            {accountType === "mobile_money"
                              ? "We'll verify your mobile money number automatically"
                              : "We'll verify your account number automatically"}
                          </p>
                        )}
                      </div>
                    )}
                  </form.Field>

                  <form.Field
                    name="name"
                    validators={{
                      onChange: ({ value }) => {
                        if (!value) return "Account holder name is required";
                        if (value.length < 2) return "Name must be at least 2 characters";
                        return undefined;
                      },
                    }}
                  >
                    {(field) => (
                      <div className="space-y-2">
                        <Label htmlFor="name">Account Holder Name</Label>
                        <Input
                          id="name"
                          type="text"
                          placeholder="Auto-filled after verification or enter manually"
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          onBlur={field.handleBlur}
                          readOnly={isVerified}
                          className={cn(
                            isVerified && "bg-muted cursor-not-allowed border-green-200",
                            field.state.meta.errors.length > 0 && "border-destructive",
                          )}
                        />
                        {isVerified ? (
                          <p className="text-xs text-green-600 flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            Name verified and auto-filled
                          </p>
                        ) : field.state.meta.errors.length > 0 ? (
                          <p className="text-sm text-destructive">{field.state.meta.errors[0]}</p>
                        ) : null}
                      </div>
                    )}
                  </form.Field>
                </>
              ) : null
            }
          </form.Subscribe>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
              {([canSubmit, isSubmitting]) => (
                <Button type="submit" disabled={!canSubmit || isSubmitting}>
                  {isSubmitting ? "Adding..." : "Add Account"}
                </Button>
              )}
            </form.Subscribe>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
