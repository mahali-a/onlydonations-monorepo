import {
  Body,
  Button,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Preview,
  pixelBasedPreset,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";
import type { CampaignRejectedData } from "./campaign-rejected-schema";

export default function CampaignRejectedTemplate({
  campaignTitle = "My Campaign",
  reason = "Campaign needs updates to meet our guidelines",
  recipientName = "Creator",
  dashboardUrl = "https://onlydonations.com/dashboard",
}: Partial<Omit<CampaignRejectedData, "email">>) {
  return (
    <Html>
      <Head />
      <Preview>Update required for your campaign "{campaignTitle}"</Preview>
      <Body>
        <Tailwind
          config={{
            presets: [pixelBasedPreset],
            theme: {
              extend: {
                colors: {
                  brand: "#FB922A",
                },
              },
            },
          }}
        >
          <div className="bg-white font-sans">
            <Container className="mx-auto max-w-[560px] py-5 pb-12">
              <Section align="center">
                <Img
                  alt="OnlyDonations Logo"
                  height={32}
                  src="https://assets.stg.onlydonations.com/public/onlydonations-logo.png"
                />
              </Section>

              <Section className="mt-6">
                <Text className="text-base text-gray-800 leading-7">Hi {recipientName},</Text>
                <Text className="text-base text-gray-800 leading-7 mt-4">
                  Thank you for submitting your campaign <strong>"{campaignTitle}"</strong>. After
                  reviewing your submission, we need you to make some updates before it can be
                  published.
                </Text>
              </Section>

              <Section className="mt-6 rounded-lg bg-red-50 px-6 py-5">
                <Text className="mb-2 text-sm uppercase tracking-[0.3em] text-red-800">
                  Reason for Review
                </Text>
                <Text className="text-base text-red-700 leading-7">{reason}</Text>
              </Section>

              <Section className="mt-6">
                <Text className="text-base text-gray-800 leading-7">
                  Please review our community guidelines and update your campaign accordingly. If
                  you believe this was a mistake or need assistance, please contact our support
                  team.
                </Text>
              </Section>

              <Section className="mt-6 text-center">
                <Button
                  className="inline-block rounded-md bg-brand px-6 py-3 text-center text-sm font-semibold text-white no-underline"
                  href={dashboardUrl}
                >
                  Go to Dashboard
                </Button>
              </Section>

              <Hr className="my-6 border-gray-200" />

              <Section>
                <Text className="text-sm text-gray-600 leading-relaxed text-center">
                  We're here to help you create a successful campaign. Contact support anytime.
                </Text>
              </Section>
            </Container>
          </div>
        </Tailwind>
      </Body>
    </Html>
  );
}
