import { Link } from "@tanstack/react-router";
import { CheckCircle2, XCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type DonationStatusProps = {
  data: {
    id: string;
    amount: number;
    currency: string;
    status: string;
    donorName: string | null;
    isAnonymous: boolean;
    createdAt: Date;
    updatedAt: Date;
    campaignTitle: string;
    campaignSlug: string;
    isRecentlyUpdated: boolean;
    formattedAmount: string;
  };
};

export function DonationStatus({ data }: DonationStatusProps) {
  const getStatusIcon = () => {
    switch (data.status) {
      case "SUCCESS":
        return <CheckCircle2 className="h-16 w-16 text-green-600" />;
      case "FAILED":
        return <XCircle className="h-16 w-16 text-red-600" />;
      default:
        return <Clock className="h-16 w-16 text-yellow-600" />;
    }
  };

  const getStatusMessage = () => {
    if (data.status === "SUCCESS") {
      return "Your donation was successful!";
    }

    if (data.status === "FAILED") {
      return "Your payment could not be processed.";
    }

    if (data.isRecentlyUpdated) {
      return "Your payment is being processed...";
    }

    return "Payment status unclear. Please contact support if you believe this is an error.";
  };

  const getStatusColor = () => {
    switch (data.status) {
      case "SUCCESS":
        return "text-green-600";
      case "FAILED":
        return "text-red-600";
      default:
        return "text-yellow-600";
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center px-4 py-10">
      <Card className="max-w-md w-full">
        <CardContent className="pt-8 text-center">
          <div className="flex justify-center mb-6">{getStatusIcon()}</div>

          <h1 className={`text-2xl font-bold mb-4 ${getStatusColor()}`}>
            {getStatusMessage()}
          </h1>

          {data.status === "SUCCESS" && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <p className="text-green-800 font-medium">
                Thank you for your generous donation of {data.currency} {data.formattedAmount}
              </p>
              <p className="text-green-600 text-sm mt-2">
                Your support for "{data.campaignTitle}" makes a real difference!
              </p>
            </div>
          )}

          {data.status === "FAILED" && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-800 font-medium">
                Payment failed for {data.currency} {data.formattedAmount}
              </p>
              <p className="text-red-600 text-sm mt-2">
                You can try donating again or contact support if the issue persists.
              </p>
            </div>
          )}

          {data.status === "PENDING" && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-yellow-800 font-medium">
                Processing payment of {data.currency} {data.formattedAmount}
              </p>
              <p className="text-yellow-600 text-sm mt-2">
                {data.isRecentlyUpdated
                  ? "Please wait while we confirm your payment..."
                  : "This payment may have been cancelled or expired."}
              </p>
            </div>
          )}

          <div className="space-y-3">
            <Button asChild className="w-full">
              <Link to="/f/$slug" params={{ slug: data.campaignSlug }}>
                Back to Campaign
              </Link>
            </Button>

            {data.status === "FAILED" && (
              <Button asChild variant="outline" className="w-full">
                <Link to="/f/$slug/donate" params={{ slug: data.campaignSlug }}>
                  Try Again
                </Link>
              </Button>
            )}
          </div>

          <div className="mt-6 text-xs text-muted-foreground">
            Donation ID: {data.id}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
