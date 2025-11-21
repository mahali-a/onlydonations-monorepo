import { QrCode } from "lucide-react";
import confetti from "canvas-confetti";

type LiveQrCodeProps = {
  slug: string;
  baseUrl?: string;
};

function fireConfetti() {
  const defaults = {
    spread: 100,
    ticks: 200,
    gravity: 0.6,
    decay: 0.94,
    startVelocity: 45,
    colors: ["#FF8C1A", "#F9A54B", "#E67E22", "#ffffff", "#ffd700"],
    shapes: ["square", "circle"] as confetti.Shape[],
    scalar: 1.2,
  };

  // Fire from bottom left
  confetti({
    ...defaults,
    particleCount: 200,
    origin: { x: 0, y: 1 },
    angle: 60,
  });

  // Fire from bottom right
  confetti({
    ...defaults,
    particleCount: 200,
    origin: { x: 1, y: 1 },
    angle: 120,
  });

  // Fire from bottom center for extra impact
  setTimeout(() => {
    confetti({
      ...defaults,
      particleCount: 150,
      spread: 120,
      origin: { x: 0.5, y: 1 },
      angle: 90,
      startVelocity: 55,
      scalar: 1.5,
    });
  }, 100);
}

export function LiveQrCode({ slug, baseUrl = "" }: LiveQrCodeProps) {
  const donationUrl = `${baseUrl}/c/${slug}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(donationUrl)}`;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-xl font-medium">
        <QrCode className="h-6 w-6" />
        <span>Scan-to-Donate</span>
      </div>
      <button
        type="button"
        className="w-fit rounded-2xl bg-white p-4 shadow-2xl cursor-pointer hover:scale-105 transition-transform"
        onClick={fireConfetti}
      >
        <div className="h-64 w-64 bg-white">
          <img src={qrCodeUrl} alt="Scan to donate" className="h-full w-full" loading="eager" />
        </div>
      </button>
    </div>
  );
}
