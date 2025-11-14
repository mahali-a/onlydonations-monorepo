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
import type { ChangeEmailData } from "./schema";

export const ChangeEmailTemplate = ({ newEmail, url }: Omit<ChangeEmailData, "email">) => {
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
                  alt="Logo"
                  height={32}
                  src="https://via.placeholder.com/150x32/FB922A/FFFFFF?text=Logo"
                />
              </Section>

              <Section className="mt-6">
                <Text className="text-base text-gray-800 leading-7">
                  You recently requested to change your email address to <strong>{newEmail}</strong>
                  .
                </Text>
                <Text className="text-base text-gray-800 leading-7">
                  To approve this change, click the button below:
                </Text>
              </Section>

              <Section className="mt-6 text-center">
                <Button
                  className="rounded-lg bg-brand px-6 py-3 text-base font-medium text-white"
                  href={url}
                >
                  Approve Email Change
                </Button>
              </Section>

              <Hr className="my-6 border-gray-200" />

              <Section>
                <Text className="text-sm text-gray-600 leading-relaxed">
                  If you didn't request this email change, please ignore this email or contact
                  support if you're concerned about your account security.
                </Text>
              </Section>
            </Container>
          </div>
        </Tailwind>
      </Body>
    </Html>
  );
};

export default ChangeEmailTemplate;
