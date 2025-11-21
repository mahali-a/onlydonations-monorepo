import {
  Body,
  Button,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  pixelBasedPreset,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";
import type { CampaignApprovedData } from "./campaign-approved-schema";

export default function CampaignApprovedTemplate({
  campaignTitle = "My Campaign",
  campaignUrl = "https://onlydonations.com/campaign/example",
  recipientName = "Creator",
}: Partial<Omit<CampaignApprovedData, "email">>) {
  return (
    <Html>
      <Head />
      <Preview>Your campaign "{campaignTitle}" is now live!</Preview>
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
                  Great news! Your campaign <strong>"{campaignTitle}"</strong> has been reviewed and
                  approved. It's now live and ready to receive donations from supporters.
                </Text>
              </Section>

              <Section className="mt-6 text-center">
                <Button
                  className="inline-block rounded-md bg-brand px-6 py-3 text-center text-sm font-semibold text-white no-underline"
                  href={campaignUrl}
                >
                  View Your Campaign
                </Button>
              </Section>

              <Section className="mt-6 rounded-lg bg-gray-50 px-6 py-5">
                <Text className="mb-2 text-sm uppercase tracking-[0.3em] text-gray-500">
                  Share Your Campaign
                </Text>
                <Link href={campaignUrl} className="break-all text-sm text-brand underline">
                  {campaignUrl}
                </Link>
              </Section>

              <Section className="mt-6">
                <Text className="mb-2 text-base font-semibold text-gray-900">
                  Tips for Success:
                </Text>
                <Text className="text-base text-gray-800 leading-7">
                  • Share your campaign on social media
                </Text>
                <Text className="text-base text-gray-800 leading-7">
                  • Update your donors regularly on your progress
                </Text>
                <Text className="text-base text-gray-800 leading-7">
                  • Thank donors for their contributions
                </Text>
              </Section>

              <Hr className="my-6 border-gray-200" />

              <Section>
                <Text className="text-sm text-gray-600 leading-relaxed text-center">
                  Need help? Contact our support team anytime.
                </Text>
              </Section>
            </Container>
          </div>
        </Tailwind>
      </Body>
    </Html>
  );
}
