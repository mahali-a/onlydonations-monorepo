import { Link, Outlet, useLocation } from "@tanstack/react-router";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatMetricValue } from "@/lib/dashboard-utils";
import { FinancialMetrics } from "./ui/financial-metrics";

function calculatePercentageChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

type PaymentsLayoutProps = {
  organization: { id: string; name: string };
  financialStats: {
    totalRaised: number;
    totalRaisedPrevious: number;
    totalWithdrawals: number;
    totalWithdrawalsPrevious: number;
    availableBalance: number;
    availableBalancePrevious: number;
    currency: string;
  } | null;
};

export default function PaymentsLayout({ organization, financialStats }: PaymentsLayoutProps) {
  const location = useLocation();

  const currentTab = location.pathname.endsWith("/withdrawal-history")
    ? "withdrawal-history"
    : location.pathname.endsWith("/withdrawal-accounts")
      ? "withdrawal-accounts"
      : "make-withdrawal";

  const metrics = financialStats
    ? [
        {
          title: "Available Balance",
          value: formatMetricValue(
            financialStats.availableBalance,
            "currency",
            financialStats.currency,
          ),
          change: calculatePercentageChange(
            financialStats.availableBalance,
            financialStats.availableBalancePrevious,
          ),
          description: "available balance",
        },
        {
          title: "Total Raised",
          value: formatMetricValue(financialStats.totalRaised, "currency", financialStats.currency),
          change: calculatePercentageChange(
            financialStats.totalRaised,
            financialStats.totalRaisedPrevious,
          ),
          description: "funds raised",
        },
        {
          title: "Total Withdrawals",
          value: formatMetricValue(
            financialStats.totalWithdrawals,
            "currency",
            financialStats.currency,
          ),
          change: calculatePercentageChange(
            financialStats.totalWithdrawals,
            financialStats.totalWithdrawalsPrevious,
          ),
          description: "withdrawals",
        },
      ]
    : [];

  return (
    <div className="container mx-auto px-4 lg:px-8 pt-6 w-full space-y-6 bg-background pb-8 overflow-x-auto">
      <div className="w-full flex flex-col md:flex-row items-start md:items-center gap-4 md:justify-between">
        <div className="flex flex-col items-start gap-2 flex-1 min-w-0">
          <h1 className="text-2xl font-bold tracking-tight">Financial Management</h1>
          <p className="text-muted-foreground truncate max-w-full">
            Manage withdrawals and payment accounts for {organization.name}
          </p>
        </div>
      </div>

      {financialStats && <FinancialMetrics metrics={metrics} />}

      <Tabs className="space-y-6" value={currentTab}>
        <TabsList>
          <TabsTrigger asChild value="make-withdrawal">
            <Link to="/o/$orgId/payments" params={{ orgId: organization.id }}>
              Make Withdrawal
            </Link>
          </TabsTrigger>
          <TabsTrigger asChild value="withdrawal-history">
            <Link to="/o/$orgId/payments/withdrawal-history" params={{ orgId: organization.id }}>
              Withdrawal History
            </Link>
          </TabsTrigger>
          <TabsTrigger asChild value="withdrawal-accounts">
            <Link to="/o/$orgId/payments/withdrawal-accounts" params={{ orgId: organization.id }}>
              Payout Methods
            </Link>
          </TabsTrigger>
        </TabsList>

        <TabsContent className="space-y-6" value={currentTab}>
          <Outlet />
        </TabsContent>
      </Tabs>
    </div>
  );
}
