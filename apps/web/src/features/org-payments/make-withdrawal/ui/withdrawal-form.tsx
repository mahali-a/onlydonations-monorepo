import type { SelectWithdrawalAccount } from "@repo/core/database/types";
import { useForm } from "@tanstack/react-form";
import { useParams, useRouter } from "@tanstack/react-router";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { calculateWithdrawalFees, getPlatformFeePercentage } from "@/lib/fees/calculator";
import { formatCurrency } from "@/lib/money";
import { createWithdrawalRequestOnServer } from "../server";

type WithdrawalFormProps = {
  payoutAccounts: SelectWithdrawalAccount[];
  availableBalance: number;
  currency: string;
};

type FormData = {
  payoutAccountId: string;
  amount: number;
};

const defaultFormValues: FormData = {
  payoutAccountId: "",
  amount: 0,
};

export function WithdrawalForm({
  payoutAccounts,
  availableBalance,
  currency,
}: WithdrawalFormProps) {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const router = useRouter();

  const params = useParams({ from: "/o/$orgId" });

  const platformFeePercent = getPlatformFeePercentage() * 100;

  const form = useForm({
    defaultValues: defaultFormValues,
    validators: {
      onSubmitAsync: async ({ value }) => {
        try {
          const result = await createWithdrawalRequestOnServer({
            data: {
              organizationId: params.orgId,
              payoutAccountId: value.payoutAccountId,
              amount: value.amount,
              currency,
            },
          });

          if (!result.success) {
            throw new Error("Withdrawal request failed");
          }

          setShowConfirmDialog(false);
          form.reset();
          router.invalidate();

          toast.success("Withdrawal request submitted!", {
            description: `${formatCurrency(Math.round(value.amount * 100), currency)} will be transferred to your account.`,
            icon: <CheckCircle2 className="h-5 w-5" />,
          });

          return null;
        } catch (error) {
          const message = error instanceof Error ? error.message : "Failed to process withdrawal";
          return { form: message };
        }
      },
    },
  });

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowConfirmDialog(true);
  };

  const handleConfirmWithdrawal = () => {
    form.handleSubmit();
  };

  return (
    <>
      <div className="rounded-xl border border-border bg-card shadow-sm flex flex-col gap-6 px-5 py-6">
        <div className="rounded-lg bg-muted p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Available Balance</span>
            <span className="text-xl font-bold">{formatCurrency(availableBalance, currency)}</span>
          </div>
        </div>

        <form onSubmit={handleFormSubmit} className="space-y-4">
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
            name="payoutAccountId"
            validators={{
              onChange: ({ value }) => {
                if (!value) return "Please select a payout account";
                return undefined;
              },
            }}
          >
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor="payoutAccountId">Payout Account</Label>
                <Select
                  value={field.state.value}
                  onValueChange={(value) => field.handleChange(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a payout account" />
                  </SelectTrigger>
                  <SelectContent>
                    {payoutAccounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.name || account.accountName || "Unnamed Account"} -{" "}
                        {account.accountType === "mobile_money" ? "Mobile Money" : "Bank"} (
                        {account.accountNumber})
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

          <form.Field
            name="amount"
            validators={{
              onChange: ({ value, fieldApi }) => {
                if (!value || value <= 0) return "Amount must be greater than 0";
                const minAmount = 1;

                const payoutAccountId = fieldApi.form.getFieldValue("payoutAccountId");
                const selectedAccount = payoutAccounts.find((acc) => acc.id === payoutAccountId);
                if (!selectedAccount) return undefined;

                const accountType = selectedAccount.accountType as "mobile_money" | "bank";
                const amountInMinorUnits = Math.round(value * 100);
                const fees = calculateWithdrawalFees(amountInMinorUnits, accountType);

                if (value < minAmount) return `Minimum withdrawal is ${minAmount} ${currency}`;
                if (fees.totalDeduction > availableBalance) {
                  return `Insufficient balance. You need ${formatCurrency(fees.totalDeduction, currency)} (including ${platformFeePercent}% platform fee + transfer fee)`;
                }
                return undefined;
              },
            }}
          >
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor="amount">Amount ({currency})</Label>
                <Input
                  type="number"
                  id="amount"
                  value={field.state.value || ""}
                  onChange={(e) => field.handleChange(parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  step="0.01"
                  min="1"
                  max={availableBalance / 100}
                />
                <p className="text-xs text-muted-foreground">
                  Enter the amount in {currency}. Maximum:{" "}
                  {formatCurrency(availableBalance, currency, { withSymbol: true })}
                </p>
                {field.state.meta.errors.length > 0 && (
                  <p className="text-sm text-destructive">{field.state.meta.errors[0]}</p>
                )}
              </div>
            )}
          </form.Field>

          <form.Subscribe selector={(state) => [state.values.amount, state.values.payoutAccountId]}>
            {([amount, payoutAccountId]) => {
              const amountValue = typeof amount === "number" ? amount : 0;
              if (!amountValue || amountValue <= 0 || !payoutAccountId) return null;

              const selectedAccount = payoutAccounts.find((acc) => acc.id === payoutAccountId);
              if (!selectedAccount) return null;

              const accountType = selectedAccount.accountType as "mobile_money" | "bank";
              const amountInMinorUnits = Math.round(amountValue * 100);
              const fees = calculateWithdrawalFees(amountInMinorUnits, accountType);

              return (
                <div className="rounded-lg bg-blue-50 border border-blue-200 p-3 text-sm">
                  <p className="text-blue-900 font-medium mb-2">Withdrawal Summary</p>
                  <div className="space-y-2 text-blue-800">
                    <div className="flex justify-between">
                      <span>You will receive:</span>
                      <span className="font-semibold">
                        {formatCurrency(fees.requestedAmount, currency)}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>Platform fee ({platformFeePercent}%):</span>
                      <span>{formatCurrency(fees.platformFee, currency)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>
                        Transfer fee (
                        {selectedAccount.accountType === "mobile_money" ? "Mobile Money" : "Bank"}
                        ):
                      </span>
                      <span>{formatCurrency(fees.transferFee, currency)}</span>
                    </div>
                    <div className="flex justify-between border-t border-blue-200 pt-2 font-semibold">
                      <span>Total deducted from balance:</span>
                      <span>{formatCurrency(fees.totalDeduction, currency)}</span>
                    </div>
                  </div>
                </div>
              );
            }}
          </form.Subscribe>

          <div className="flex items-center justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => form.reset()}
              disabled={form.state.isSubmitting}
            >
              Cancel
            </Button>
            <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
              {([canSubmit, isSubmitting]) => (
                <Button type="submit" disabled={!canSubmit || isSubmitting}>
                  {isSubmitting ? "Processing..." : "Request Withdrawal"}
                </Button>
              )}
            </form.Subscribe>
          </div>
        </form>
      </div>

      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Withdrawal</DialogTitle>
            <DialogDescription>
              Please review the withdrawal details before proceeding.
            </DialogDescription>
          </DialogHeader>

          <form.Subscribe selector={(state) => [state.values]}>
            {([values]) => {
              if (!values) return null;

              const selectedAccount = payoutAccounts.find(
                (acc) => acc.id === values.payoutAccountId,
              );

              if (!selectedAccount) return null;

              const amountValue = typeof values.amount === "number" ? values.amount : 0;
              const accountType = selectedAccount.accountType as "mobile_money" | "bank";
              const amountInMinorUnits = Math.round(amountValue * 100);
              const fees = calculateWithdrawalFees(amountInMinorUnits, accountType);

              return (
                <div className="space-y-4 py-4">
                  <div className="rounded-lg border border-border p-4 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">You will receive:</span>
                      <span className="font-semibold">
                        {formatCurrency(fees.requestedAmount, currency)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Platform fee ({platformFeePercent}%):
                      </span>
                      <span className="font-medium">
                        {formatCurrency(fees.platformFee, currency)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Transfer fee:</span>
                      <span className="font-medium">
                        {formatCurrency(fees.transferFee, currency)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm border-t border-border pt-3 font-semibold">
                      <span>Total deducted:</span>
                      <span>{formatCurrency(fees.totalDeduction, currency)}</span>
                    </div>
                    <div className="flex justify-between text-sm pt-2 border-t border-border">
                      <span className="text-muted-foreground">Account:</span>
                      <span className="font-medium">
                        {selectedAccount.name || selectedAccount.accountName} (
                        {selectedAccount.accountNumber})
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Type:</span>
                      <span>
                        {selectedAccount.accountType === "mobile_money"
                          ? "Mobile Money"
                          : "Bank Transfer"}
                      </span>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground">
                    A {platformFeePercent}% platform fee plus transfer fee will be deducted from
                    your available balance.
                  </p>
                </div>
              );
            }}
          </form.Subscribe>

          <DialogFooter>
            <form.Subscribe selector={(state) => [state.isSubmitting]}>
              {([isSubmitting]) => (
                <>
                  <Button
                    variant="outline"
                    onClick={() => setShowConfirmDialog(false)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleConfirmWithdrawal} disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Confirm Withdrawal"
                    )}
                  </Button>
                </>
              )}
            </form.Subscribe>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
