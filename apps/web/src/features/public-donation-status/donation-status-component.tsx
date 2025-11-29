import { Link } from "@tanstack/react-router";
import { CheckCircle2, Clock, Share2, XCircle } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { DonateHeader } from "@/features/public-donate/donate-header";
import { useRealtimeCampaign } from "@/features/public-live-campaign/hooks/use-realtime-campaign";
import { postDonationMessage } from "./donation-status-actions";

type DonationStatusProps = {
  data: {
    id: string;
    amount: number;
    currency: string;
    status: string;
    donorName: string | null;
    donorMessage: string | null;
    isAnonymous: boolean;
    createdAt: Date;
    updatedAt: Date;
    campaignId: string;
    campaignTitle: string;
    campaignSlug: string;
    isRecentlyUpdated: boolean;
    formattedAmount: string;
  };
};

export function DonationStatus({ data }: DonationStatusProps) {
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasPostedMessage, setHasPostedMessage] = useState(false);
  const [isPendingModeration, setIsPendingModeration] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);

  // Connect to WebSocket for real-time donation status updates
  // Only enable polling when status is PENDING (waiting for payment confirmation)
  useRealtimeCampaign({
    campaignId: data.campaignId,
    slug: data.campaignSlug,
    donationId: data.id,
    enabled: data.status === "PENDING",
  });

  const hasExistingMessage = !!data.donorMessage;

  const getShareableUrl = () => {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/d/${data.id}`;
  };

  const handlePostMessage = async () => {
    if (!message.trim()) return;

    setIsSubmitting(true);
    try {
      const result = await postDonationMessage({
        data: { donationId: data.id, message: message.trim() },
      });
      setHasPostedMessage(true);
      setIsPendingModeration(result.isPending ?? false);
      setMessage("");
    } catch (error) {
      console.error("Failed to post message:", error);
      // If message already exists (409), treat as if already posted
      if (error instanceof Response && error.status === 409) {
        setHasPostedMessage(true);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleShare = async () => {
    setShareError(null);
    const shareableUrl = getShareableUrl();

    const shareData = {
      title: `I donated to ${data.campaignTitle}`,
      text: `I just donated ${data.currency} ${data.formattedAmount} to ${data.campaignTitle}! Join me in making a difference.`,
      url: shareableUrl,
    };

    // Check if Web Share API is available
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        // User cancelled or error occurred
        if ((error as Error).name !== "AbortError") {
          // Fallback to copy link
          copyToClipboard();
        }
      }
    } else {
      // Fallback to copy link
      copyToClipboard();
    }
  };

  const copyToClipboard = () => {
    const shareableUrl = getShareableUrl();
    navigator.clipboard
      .writeText(shareableUrl)
      .then(() => {
        setShareError("Link copied to clipboard!");
        setTimeout(() => setShareError(null), 3000);
      })
      .catch(() => {
        setShareError("Failed to copy link");
        setTimeout(() => setShareError(null), 3000);
      });
  };

  const getStatusIcon = () => {
    switch (data.status) {
      case "SUCCESS":
        return <CheckCircle2 className="h-16 w-16 text-[#02a95c]" />;
      case "FAILED":
        return <XCircle className="h-16 w-16 text-red-600" />;
      default:
        return <Clock className="h-16 w-16 text-sidebar-primary" />;
    }
  };

  const getStatusMessage = () => {
    if (data.status === "SUCCESS") {
      return "Thank you for your donation!";
    }
    if (data.status === "FAILED") {
      return "Donation Failed";
    }
    if (data.isRecentlyUpdated) {
      return "Processing...";
    }
    return "Status Unknown";
  };

  return (
    <div className="min-h-screen bg-[#fbf8f6] font-sans text-[#333]">
      <DonateHeader campaignSlug={data.campaignSlug} />

      <div className="flex items-center justify-center p-4 pt-8">
        <Card className="w-full max-w-lg shadow-lg">
          <CardContent className="pt-8 pb-10 px-6 sm:px-10">
            <div className="flex flex-col items-center text-center space-y-6">
              {/* Status Icon */}
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                {getStatusIcon()}
              </div>

              {/* Status Message */}
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                  {getStatusMessage()}
                </h1>

                {data.status === "SUCCESS" && (
                  <p className="text-lg text-gray-600">
                    You donated{" "}
                    <span className="font-semibold text-gray-900">
                      {data.currency} {data.formattedAmount}
                    </span>{" "}
                    to <span className="font-semibold text-gray-900">{data.campaignTitle}</span>
                  </p>
                )}

                {data.status === "FAILED" && (
                  <p className="text-gray-600">
                    We couldn't process your donation of {data.currency} {data.formattedAmount}.
                    Please try again.
                  </p>
                )}

                {data.status === "PENDING" && (
                  <p className="text-gray-600">
                    We are confirming your payment of {data.currency} {data.formattedAmount}. This
                    may take a few moments.
                  </p>
                )}
              </div>

              {/* Share Section - Only for SUCCESS */}
              {data.status === "SUCCESS" && !hasPostedMessage && !hasExistingMessage && (
                <div className="w-full space-y-4 pt-4">
                  <div className="rounded-xl bg-blue-50 border border-blue-100 p-6 space-y-4">
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900 mb-1">Spread the word!</h3>
                      <p className="text-sm text-gray-600">
                        Share your donation and inspire others to join this cause.
                      </p>
                    </div>
                    <Button
                      onClick={handleShare}
                      className="w-full bg-[#02a95c] hover:bg-[#02a95c]/90 text-white font-semibold rounded-full flex items-center gap-2"
                    >
                      <Share2 className="h-4 w-4" />
                      Share Your Impact
                    </Button>
                    {shareError && (
                      <p className="text-sm text-center text-gray-600">{shareError}</p>
                    )}
                  </div>

                  {/* Thank You Message */}
                  <div className="rounded-xl bg-gray-50 p-6 space-y-4">
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900 mb-1">
                        Leave a message of support
                      </h3>
                      <p className="text-sm text-gray-600">
                        Your message will be visible on the fundraiser page.
                      </p>
                    </div>
                    <Textarea
                      placeholder="I'm donating because..."
                      className="min-h-[100px] rounded-xl border-gray-300 bg-white text-base resize-none"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      maxLength={500}
                    />
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">{message.length}/500</span>
                      <Button
                        onClick={handlePostMessage}
                        disabled={!message.trim() || isSubmitting}
                        className="bg-[#02a95c] hover:bg-[#02a95c]/90 text-white font-semibold rounded-full px-6"
                      >
                        {isSubmitting ? "Posting..." : "Post Message"}
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Already Posted Message - Show Share Only */}
              {data.status === "SUCCESS" && hasExistingMessage && !hasPostedMessage && (
                <div className="w-full space-y-4 pt-4">
                  <div className="rounded-xl bg-green-50 border border-green-200 p-6 text-center">
                    <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto mb-3" />
                    <h3 className="font-semibold text-lg text-gray-900 mb-2">
                      You've already posted your message
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Thank you for your support! Share your donation to inspire others.
                    </p>
                    <Button
                      onClick={handleShare}
                      className="w-full bg-[#02a95c] hover:bg-[#02a95c]/90 text-white font-semibold rounded-full flex items-center gap-2"
                    >
                      <Share2 className="h-4 w-4" />
                      Share Your Impact
                    </Button>
                    {shareError && (
                      <p className="text-sm text-center text-gray-600 mt-2">{shareError}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Success State After Posting Message */}
              {hasPostedMessage && (
                <div className="w-full space-y-4 pt-4">
                  <div className="rounded-xl bg-green-50 border border-green-200 p-6 text-center">
                    <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto mb-3" />
                    <h3 className="font-semibold text-lg text-gray-900 mb-2">
                      {isPendingModeration ? "Message submitted!" : "Message posted successfully!"}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      {isPendingModeration
                        ? "Your message is being reviewed and will appear shortly. Thank you for your support!"
                        : "Your support means the world. Now share your donation to inspire others!"}
                    </p>
                    <Button
                      onClick={handleShare}
                      className="w-full bg-[#02a95c] hover:bg-[#02a95c]/90 text-white font-semibold rounded-full flex items-center gap-2"
                    >
                      <Share2 className="h-4 w-4" />
                      Share Your Impact
                    </Button>
                    {shareError && (
                      <p className="text-sm text-center text-gray-600 mt-2">{shareError}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Action for Failed */}
              {data.status === "FAILED" && (
                <div className="w-full pt-4">
                  <Button
                    asChild
                    className="w-full bg-[#02a95c] hover:bg-[#02a95c]/90 text-white font-semibold rounded-full py-6 text-lg"
                  >
                    <Link to="/f/$slug/donate" params={{ slug: data.campaignSlug }}>
                      Try Again
                    </Link>
                  </Button>
                </div>
              )}

              {/* Footer */}
              <div className="pt-6 border-t border-gray-200 w-full">
                <Button asChild variant="ghost" className="text-gray-500 hover:text-gray-700">
                  <Link to="/f/$slug" params={{ slug: data.campaignSlug }}>
                    Return to Fundraiser
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
