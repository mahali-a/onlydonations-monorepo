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
import type { ChangeEmailData } from "./change-email-schema";

export default function ChangeEmailTemplate({
  newEmail = "newemail@example.com",
  url = "https://onlydonations.com/verify-email",
}: Partial<Omit<ChangeEmailData, "email">>) {
  return (
    <Html>
      <Head />
      <Preview>Approve your email change request</Preview>
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
                <Text className="text-base text-gray-800 leading-7">
                  You recently requested to change your email address to:
                </Text>
              </Section>

              <Section className="mt-6 rounded-lg bg-gray-50 px-6 py-5 text-center">
                <Text className="font-semibold text-base text-gray-900">{newEmail}</Text>
              </Section>

              <Section className="mt-6">
                <Text className="text-base text-gray-800 leading-7">
                  To approve this change and update your account, click the button below:
                </Text>
              </Section>

              <Section className="mt-6 text-center">
                <Button
                  className="inline-block rounded-md bg-brand px-6 py-3 text-center text-sm font-semibold text-white no-underline"
                  href={url}
                >
                  Approve Email Change
                </Button>
              </Section>

              <Hr className="my-6 border-gray-200" />

              <Section>
                <Text className="text-sm text-gray-600 leading-relaxed text-center">
                  If you didn't request this change, please ignore this email or contact support.
                </Text>
              </Section>
            </Container>
          </div>
        </Tailwind>
      </Body>
    </Html>
  );
}
