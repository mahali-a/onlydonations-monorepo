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
import type { DonationThankYouData } from "./donation-thank-you-schema";

export default function DonationThankYouTemplate({
  donorName = "John Doe",
  amount = "100.00",
  currency = "GHS",
  campaignTitle = "Help Support Our Cause",
  campaignUrl = "https://onlydonations.com/campaign/example",
  customThankYouMessage = "",
  donatedAt = new Date().toLocaleDateString(),
  donationShareUrl = "https://onlydonations.com/d/example123",
}: Partial<Omit<DonationThankYouData, "email">>) {
  return (
    <Html>
      <Head />
      <Preview>Thank you for your donation to {campaignTitle}</Preview>
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
                <Text className="text-base text-gray-800 leading-7">Dear {donorName},</Text>
                <Text className="text-base text-gray-800 leading-7 mt-4">
                  Thank you for your generous donation of{" "}
                  <strong>
                    {currency} {amount}
                  </strong>{" "}
                  to <strong>{campaignTitle}</strong>.
                </Text>
              </Section>

              {customThankYouMessage && (
                <Section className="mt-6 rounded-lg bg-gray-50 px-6 py-5">
                  <Text className="mb-2 text-sm uppercase tracking-[0.3em] text-gray-500">
                    Message from Campaign Creator
                  </Text>
                  <Text className="text-base text-gray-800 leading-7">{customThankYouMessage}</Text>
                </Section>
              )}

              <Section className="mt-6">
                <Text className="text-base text-gray-800 leading-7">
                  Your contribution is making a real difference and helping this campaign reach its
                  goal. Thank you for being part of this journey.
                </Text>
              </Section>

              <Section className="mt-6 text-center">
                <Button
                  className="inline-block rounded-md bg-brand px-6 py-3 text-center text-sm font-semibold text-white no-underline"
                  href={campaignUrl}
                >
                  View Campaign
                </Button>
              </Section>

              <Section className="mt-6 rounded-lg bg-blue-50 px-6 py-5">
                <Text className="mb-2 text-base font-semibold text-gray-800 text-center">
                  Share Your Impact
                </Text>
                <Text className="text-sm text-gray-600 leading-relaxed text-center mb-4">
                  Inspire others to join this cause by sharing your donation. Every share helps make
                  a bigger impact!
                </Text>
                <div className="text-center">
                  <Button
                    className="inline-block rounded-full bg-green-600 px-8 py-3 text-center text-sm font-semibold text-white no-underline"
                    href={donationShareUrl}
                  >
                    Share My Donation
                  </Button>
                </div>
              </Section>

              <Hr className="my-6 border-gray-200" />

              <Section>
                <Text className="text-sm text-gray-600 leading-relaxed text-center">
                  Donation Date: {donatedAt}
                </Text>
              </Section>
            </Container>
          </div>
        </Tailwind>
      </Body>
    </Html>
  );
}
