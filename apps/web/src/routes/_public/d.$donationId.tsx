import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import ms from "ms";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getShareableDonation } from "@/features/public-donation-status/shareable-donation-loaders";
import { seo } from "@/lib/seo";

const shareableDonationQueryOptions = (donationId: string) =>
  queryOptions({
    queryKey: ["shareable-donation", donationId],
    queryFn: () => getShareableDonation({ data: { donationId } }),
    staleTime: ms("5 minutes"),
  });

export const Route = createFileRoute("/_public/d/$donationId")({
  loader: async ({ params, context }) => {
    const { donationId } = params;

    if (!donationId) {
      throw new Response("Donation ID is required", { status: 400 });
    }

    const data = await context.queryClient.ensureQueryData(
      shareableDonationQueryOptions(donationId),
    );

    if (!data) {
      throw notFound();
    }

    return data;
  },
  component: ShareableDonationPage,
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Donation" }],
      };
    }

    const donorName = loaderData.isAnonymous ? "Someone" : loaderData.donorName || "A donor";

    const title = `${donorName} donated ${loaderData.currency} ${loaderData.formattedAmount} to ${loaderData.campaignTitle}`;
    const description = loaderData.donorMessage
      ? loaderData.donorMessage
      : `Join the effort and support ${loaderData.campaignTitle}`;

    const image =
      loaderData.campaignSeoImage ||
      loaderData.campaignCoverImage ||
      "https://assets.onlydonations.com/public/og-image.png";

    const url =
      typeof window !== "undefined" ? `${window.location.origin}/d/${loaderData.id}` : undefined;

    const metaTags = seo({
      title,
      description,
      image,
    });

    if (url) {
      metaTags.push({
        property: "og:url",
        content: url,
      });
    }

    return {
      meta: metaTags,
    };
  },
});

function ShareableDonationPage() {
  const { donationId } = Route.useParams();
  const { data } = useSuspenseQuery(shareableDonationQueryOptions(donationId));

  const donorDisplayName = data.isAnonymous ? "Anonymous" : data.donorName || "A generous donor";

  return (
    <div className="min-h-screen bg-gradient-to-b from-muted to-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-lg">
        <CardContent className="pt-8 pb-10 px-6 sm:px-10">
          <div className="flex flex-col items-center text-center space-y-6">
            {/* Heart Icon */}
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
              <Heart className="h-10 w-10 text-primary fill-primary" />
            </div>

            {/* Main Message */}
            <div className="space-y-3">
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
                {donorDisplayName} made a difference
              </h1>
              <p className="text-xl text-muted-foreground">
                with a donation of{" "}
                <span className="font-bold text-primary">
                  {data.currency} {data.formattedAmount}
                </span>
              </p>
            </div>

            {/* Campaign Info */}
            <div className="w-full max-w-md">
              <div className="rounded-xl bg-muted p-6">
                <p className="text-sm uppercase tracking-wider text-muted-foreground mb-2">
                  Supporting
                </p>
                <h2 className="text-xl font-semibold text-foreground">{data.campaignTitle}</h2>
              </div>
            </div>

            {/* Donor Message - Only show if approved and showMessage is true */}
            {data.donorMessage && data.showMessage && data.messageStatus === "APPROVED" && (
              <div className="w-full max-w-md">
                <div className="rounded-xl bg-accent border border-border p-6">
                  <p className="text-sm uppercase tracking-wider text-accent-foreground mb-2">
                    Message from donor
                  </p>
                  <p className="text-base text-foreground leading-relaxed italic">
                    "{data.donorMessage}"
                  </p>
                </div>
              </div>
            )}

            {/* Call to Action */}
            <div className="w-full max-w-md space-y-4 pt-4">
              <div className="text-center">
                <p className="text-muted-foreground mb-4">
                  Join {donorDisplayName} in making an impact
                </p>
                <Button
                  asChild
                  size="lg"
                  className="w-full font-semibold text-lg py-6 rounded-full"
                >
                  <Link to="/f/$slug" params={{ slug: data.campaignSlug }}>
                    Donate Now
                  </Link>
                </Button>
              </div>

              <div className="text-center">
                <Button asChild variant="ghost" className="text-muted-foreground">
                  <Link to="/f/$slug" params={{ slug: data.campaignSlug }}>
                    Learn more about this fundraiser
                  </Link>
                </Button>
              </div>
            </div>

            {/* Footer */}
            <div className="pt-6 border-t border-border w-full">
              <p className="text-sm text-muted-foreground text-center">
                Donated on{" "}
                {new Date(data.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
