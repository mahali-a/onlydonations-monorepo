import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Preview,
  pixelBasedPreset,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";
import type { CampaignRejectedData } from "./schema";

export const CampaignRejectedTemplate = ({
  campaignTitle,
  reason,
  recipientName,
  dashboardUrl,
}: Omit<CampaignRejectedData, "email">) => {
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
                  alt="Logo"
                  className="my-0"
                  height="48"
                  src="https://onlydonations.com/logo.png"
                />
              </Section>

              <Heading className="mx-0 my-7 p-0 text-center text-xl font-semibold text-black">
                Campaign Review Update
              </Heading>

              <Text className="text-sm leading-6 text-black">Hi {recipientName},</Text>

              <Text className="text-sm leading-6 text-black">
                Thank you for submitting your campaign <strong>"{campaignTitle}"</strong>. After
                reviewing your campaign, we need you to make some updates before it can go live.
              </Text>

              <Section className="my-6 rounded-md border border-red-200 bg-red-50 p-4">
                <Text className="m-0 text-sm font-semibold text-red-800">Reason:</Text>
                <Text className="mt-2 text-sm leading-6 text-red-700">{reason}</Text>
              </Section>

              <Text className="text-sm leading-6 text-black">
                Please review our community guidelines and update your campaign accordingly. If you
                believe this was a mistake, please contact our support team.
              </Text>

              <Section className="my-8 text-center">
                <Button
                  className="rounded-md bg-brand px-5 py-3 text-center text-sm font-semibold text-white no-underline"
                  href={dashboardUrl}
                >
                  Go to Dashboard
                </Button>
              </Section>

              <Hr className="mx-0 my-6 w-full border border-solid border-gray-300" />

              <Text className="text-xs leading-5 text-gray-500">
                If you have any questions or need assistance, please contact our support team. We're
                here to help you create a successful campaign.
              </Text>
            </Container>
          </div>
        </Tailwind>
      </Body>
    </Html>
  );
};
