import {
  Body,
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
import type { EmailOtpData } from "./schema";

const ACTION_COPY: Record<EmailOtpData["type"], string> = {
  "sign-in": "sign in to your account",
  "email-verification": "verify your email address",
  "forget-password": "reset your password",
};

export const EmailOtpTemplate = ({
  otp,
  type,
  expiresIn = "5 minutes",
}: Omit<EmailOtpData, "email">) => {
  const actionText = ACTION_COPY[type];

  return (
    <Html>
      <Head />
      <Preview>Your verification code</Preview>
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
                  Use the one-time password below to {actionText}. This code expires in {expiresIn}.
                </Text>
              </Section>

              <Section className="mt-6 rounded-lg bg-gray-50 px-6 py-5 text-center">
                <Text className="mb-4 text-sm uppercase tracking-[0.3em] text-gray-500">
                  Your code
                </Text>
                <Text className="font-semibold text-3xl tracking-[0.4em] text-gray-900">{otp}</Text>
              </Section>

              <Hr className="my-6 border-gray-200" />

              <Section>
                <Text className="text-sm text-gray-600 leading-relaxed">
                  If you didn't request this email, you can safely ignore it. Someone else may have
                  entered your email address by mistake.
                </Text>
              </Section>
            </Container>
          </div>
        </Tailwind>
      </Body>
    </Html>
  );
};

export default EmailOtpTemplate;
