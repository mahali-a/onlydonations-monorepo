import { useEffect, useState, lazy, Suspense } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import { liveCampaignQueryOptions } from "./public-live-campaign-loaders";
import { LiveProgressBar, LiveDonationsFeed, LiveQrCode } from "./ui";

const ShaderGradientCanvas = lazy(() =>
  import("@shadergradient/react").then((mod) => ({
    default: mod.ShaderGradientCanvas,
  }))
);

const ShaderGradient = lazy(() =>
  import("@shadergradient/react").then((mod) => ({
    default: mod.ShaderGradient,
  }))
);

function ClientOnly({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted ? <>{children}</> : null;
}

export function LiveCampaignComponent() {
  const { slug } = useParams({ from: "/live/$slug" });
  const { data } = useSuspenseQuery(liveCampaignQueryOptions(slug));

  if (!data) {
    return (
      <div className="flex h-screen items-center justify-center bg-black text-white">
        <div className="text-center">
          <h1 className="text-4xl font-bold">Campaign Not Found</h1>
          <p className="mt-2 text-white/60">
            The campaign you're looking for doesn't exist or is no longer active.
          </p>
        </div>
      </div>
    );
  }

  const { campaign, donations } = data;

  return (
    <div className="relative h-screen w-full overflow-hidden text-white bg-black">
      {/* Shader Gradient Background */}
      <ClientOnly>
        <div className="absolute inset-0 z-0">
          <Suspense fallback={<div className="absolute inset-0 bg-black" />}>
            <ShaderGradientCanvas
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                pointerEvents: "none",
              }}
            >
              <ShaderGradient
                control="query"
                urlString="https://www.shadergradient.co/customize?animate=on&axesHelper=off&bgColor1=%23000000&bgColor2=%23000000&brightness=1.2&cAzimuthAngle=180&cDistance=3.6&cPolarAngle=90&cameraZoom=1&color1=%23FF8C1A&color2=%23F9A54B&color3=%23E67E22&destination=onCanvas&embedMode=off&envPreset=city&format=gif&fov=50&frameRate=10&gizmoHelper=hide&grain=on&lightType=3d&pixelDensity=1&positionX=-1.4&positionY=0&positionZ=0&range=enabled&rangeEnd=40&rangeStart=0&reflection=0.1&rotationX=0&rotationY=10&rotationZ=50&shader=defaults&type=plane&uAmplitude=0&uDensity=1.1&uFrequency=5.5&uSpeed=0.1&uStrength=4&uTime=0&wireframe=off&zoomOut=false"
              />
            </ShaderGradientCanvas>
          </Suspense>
        </div>
      </ClientOnly>

      <div className="flex h-full w-full relative z-10">
        {/* Left Column - Campaign Info */}
        <div className="flex w-1/2 flex-col justify-between p-12">
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-medium text-white/90">{campaign.categoryName}</h2>
              <h1 className="mt-2 text-5xl font-bold leading-tight">{campaign.title}</h1>
            </div>

            <LiveProgressBar
              raised={campaign.totalRaised}
              target={campaign.amount}
              currency={campaign.currency}
              supportersCount={campaign.donationCount}
            />
          </div>

          <LiveQrCode slug={campaign.slug} />
        </div>

        {/* Right Column - Feed */}
        <div className="relative flex w-1/2 flex-col bg-black/10 backdrop-blur-sm">
          <div className="flex-1 overflow-y-auto p-12">
            <LiveDonationsFeed donations={donations} />
          </div>

          <div className="absolute bottom-8 right-8">
            <div className="text-right text-sm font-medium text-white/80">
              Powered by <span className="font-bold text-white">OnlyDonations</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
