import {
  Body,
  Button,
  Container,
  Head,
  Heading,
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
import type { CampaignApprovedData } from "./schema";

export const CampaignApprovedTemplate = ({
  campaignTitle,
  campaignUrl,
  recipientName,
}: Omit<CampaignApprovedData, "email">) => {
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
                  alt="Logo"
                  className="my-0"
                  height="48"
                  src="https://onlydonations.com/logo.png"
                />
              </Section>

              <Heading className="mx-0 my-7 p-0 text-center text-xl font-semibold text-black">
                🎉 Your Campaign is Live!
              </Heading>

              <Text className="text-sm leading-6 text-black">Hi {recipientName},</Text>

              <Text className="text-sm leading-6 text-black">
                Great news! Your campaign <strong>"{campaignTitle}"</strong> has been reviewed and
                approved. It's now live and accepting donations.
              </Text>

              <Section className="my-8 text-center">
                <Button
                  className="rounded-md bg-brand px-5 py-3 text-center text-sm font-semibold text-white no-underline"
                  href={campaignUrl}
                >
                  View Your Campaign
                </Button>
              </Section>

              <Text className="text-sm leading-6 text-black">
                Share your campaign link to start receiving donations:
              </Text>

              <Section className="my-4 rounded-md bg-gray-100 p-4">
                <Link href={campaignUrl} className="break-all text-sm text-brand no-underline">
                  {campaignUrl}
                </Link>
              </Section>

              <Text className="text-sm leading-6 text-black">Tips for success:</Text>

              <ul className="text-sm leading-6 text-black">
                <li>Share your campaign on social media</li>
                <li>Update your donors regularly on your progress</li>
                <li>Thank donors for their contributions</li>
              </ul>

              <Hr className="mx-0 my-6 w-full border border-solid border-gray-300" />

              <Text className="text-xs leading-5 text-gray-500">
                If you have any questions, feel free to reach out to our support team.
              </Text>
            </Container>
          </div>
        </Tailwind>
      </Body>
    </Html>
  );
};
