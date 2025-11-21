import { Link, useNavigate } from "@tanstack/react-router";
import { CheckCircle2, XCircle, Clock, ChevronLeft, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { authClient } from "@/lib/auth-client";
import { useQuery } from "@tanstack/react-query";
import { Navlogo } from "@/components/icons/nav-logo";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";

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
  const navigate = useNavigate();
  const [message, setMessage] = useState("");

  const {
    data: session,
    isPending: isSessionPending,
    error: sessionError,
  } = authClient.useSession();

  const { data: orgId, error: orgError } = useQuery({
    queryFn: () => authClient.organization.list(),
    queryKey: ["user-organization", session?.user.id],
    enabled: !!session?.user?.id,
    select: ({ data }) => data?.[0]?.id || null,
  });

  const isLoading = isSessionPending && !sessionError && !orgError;
  const user = session?.user;
  const fallbackText = user?.name
    ? user.name.charAt(0).toUpperCase()
    : user?.email?.charAt(0).toUpperCase() || "U";

  const getStatusIcon = () => {
    switch (data.status) {
      case "SUCCESS":
        return <CheckCircle2 className="h-16 w-16 text-[#02a95c]" />;
      case "FAILED":
        return <XCircle className="h-16 w-16 text-red-600" />;
      default:
        return <Clock className="h-16 w-16 text-yellow-600" />;
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
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white px-4 py-3 shadow-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to="/f/$slug"
              params={{ slug: data.campaignSlug }}
              className="flex items-center gap-1 text-sm font-medium text-[#333] hover:underline"
            >
              <ChevronLeft className="h-5 w-5" />
              Return to Fundraiser
            </Link>
          </div>
          <div className="absolute left-1/2 -translate-x-1/2">
            <Link
              to="/"
              className="flex items-center gap-2 text-primary hover:text-primary/90 transition-colors"
            >
              <Navlogo className="h-8 w-auto text-foreground" />
            </Link>
          </div>
          <div className="flex items-center gap-2">
            {isLoading ? (
              <>
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-8 w-32" />
              </>
            ) : session && orgId ? (
              <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full hover:bg-accent/30 border border-transparent hover:border-border transition-all"
                    >
                      <Avatar className="h-6 w-6">
                        <AvatarImage
                          className="h-6 w-6"
                          src={user?.image || undefined}
                          alt={user?.name || "User"}
                        />
                        <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                          {fallbackText}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 text-left hidden sm:block">
                        <p className="text-sm font-medium">{user?.name || "User"}</p>
                      </div>
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-[260px] p-4 rounded-3xl shadow-[0_6px_30px_rgba(0,0,0,0.1)] border-none"
                  >
                    {orgId && (
                      <>
                        <DropdownMenuItem
                          asChild
                          className="rounded-xl px-4 py-3 cursor-pointer focus:bg-accent/50"
                        >
                          <Link
                            to={`/o/$orgId/account`}
                            params={{
                              orgId,
                            }}
                            className="w-full font-medium text-base"
                          >
                            Profile
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          asChild
                          className="rounded-xl px-4 py-3 cursor-pointer focus:bg-accent/50"
                        >
                          <Link
                            to={`/o/$orgId/campaigns`}
                            params={{
                              orgId,
                            }}
                            search={{}}
                            className="w-full font-medium text-base"
                          >
                            Your fundraisers
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          asChild
                          className="rounded-xl px-4 py-3 cursor-pointer focus:bg-accent/50"
                        >
                          <Link
                            to={`/o/$orgId/donations`}
                            params={{
                              orgId,
                            }}
                            search={{}}
                            className="w-full font-medium text-base"
                          >
                            Your impact
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          asChild
                          className="rounded-xl px-4 py-3 cursor-pointer focus:bg-accent/50"
                        >
                          <Link
                            to={`/o/$orgId/account`}
                            params={{
                              orgId,
                            }}
                            className="w-full font-medium text-base"
                          >
                            Account settings
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuItem
                      asChild
                      className="rounded-xl px-4 py-3 cursor-pointer focus:bg-accent/50"
                    >
                      <button
                        type="button"
                        className="w-full text-left font-medium text-base"
                        onClick={async () => {
                          await authClient.signOut();
                          navigate({ to: "/" });
                        }}
                      >
                        Sign out
                      </button>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={() => navigate({ to: "/login" })}>
                  Sign In
                </Button>
                <Button asChild size="sm">
                  <Link to="/login">Start fundraider</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[600px] pt-20 px-4 py-8">
        <div className="rounded-3xl bg-white p-6 shadow-sm sm:p-8 text-center">
          <div className="flex justify-center mb-6">{getStatusIcon()}</div>

          <h1 className="text-3xl font-bold mb-2 text-[#333]">{getStatusMessage()}</h1>

          {data.status === "SUCCESS" && (
            <>
              <p className="text-lg text-gray-600 mb-8">
                You donated{" "}
                <span className="font-bold text-[#333]">
                  {data.currency} {data.formattedAmount}
                </span>{" "}
                to <span className="font-bold text-[#333]">{data.campaignTitle}</span>
              </p>

              <div className="space-y-6 text-left">
                <div className="rounded-2xl bg-gray-50 p-6">
                  <h3 className="font-bold text-lg mb-2">Leave a message of support</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Your message will be visible on the fundraiser page.
                  </p>
                  <Textarea
                    placeholder="I'm donating because..."
                    className="min-h-[120px] rounded-xl border-gray-300 bg-white text-base mb-4 resize-none"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                  <div className="flex justify-end">
                    <Button
                      className="rounded-full bg-[#02a95c] hover:bg-[#02a95c]/90 text-white font-bold px-6"
                      onClick={() => {
                        // Placeholder for future implementation
                        console.log("Message submitted:", message);
                      }}
                    >
                      Post Message
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}

          {data.status === "FAILED" && (
            <div className="mb-8">
              <p className="text-gray-600 mb-6">
                We couldn't process your donation of {data.currency} {data.formattedAmount}. Please
                try again.
              </p>
              <Button
                asChild
                className="w-full rounded-full py-6 text-xl font-bold bg-[#02a95c] text-white shadow-none hover:opacity-90 hover:bg-[#02a95c]/90"
              >
                <Link to="/f/$slug/donate" params={{ slug: data.campaignSlug }}>
                  Try Again
                </Link>
              </Button>
            </div>
          )}

          {data.status === "PENDING" && (
            <div className="mb-8">
              <p className="text-gray-600">
                We are confirming your payment of {data.currency} {data.formattedAmount}. This may
                take a few moments.
              </p>
            </div>
          )}

          <div className="mt-8 pt-8 border-t border-gray-100">
            <Button asChild variant="ghost" className="text-gray-500 hover:text-[#333]">
              <Link to="/f/$slug" params={{ slug: data.campaignSlug }}>
                Return to Fundraiser
              </Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
