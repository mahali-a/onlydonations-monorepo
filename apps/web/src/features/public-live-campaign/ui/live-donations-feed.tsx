import confetti from "canvas-confetti";
import { formatDistanceToNow } from "date-fns";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { formatCurrency } from "@/lib/money";
import type { LiveDonation } from "../public-live-campaign-models";

type LiveDonationsFeedProps = {
  donations: LiveDonation[];
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

export function LiveDonationsFeed({ donations }: LiveDonationsFeedProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [prevDonationIds, setPrevDonationIds] = useState<Set<string>>(new Set());

  // Auto-scroll to bottom and fire confetti on new donations
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }

    // Check for new donations
    const currentIds = new Set(donations.map((d) => d.id));
    const hasNewDonation = donations.some((d) => !prevDonationIds.has(d.id));

    if (hasNewDonation && prevDonationIds.size > 0) {
      fireConfetti();
    }

    setPrevDonationIds(currentIds);
  }, [donations, prevDonationIds.has, prevDonationIds.size]);

  if (donations.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <p className="text-2xl font-semibold text-white/90">Be the first to support!</p>
          <p className="mt-2 text-white/60">Scan the QR code to donate</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={scrollRef} className="h-full overflow-y-auto live-scrollbar">
      <div className="space-y-3 pb-4">
        <AnimatePresence mode="popLayout" initial={false}>
          {donations.map((donation) => (
            <motion.div
              key={donation.id}
              layout
              initial={{ opacity: 0, x: 100, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -100, scale: 0.8 }}
              transition={{
                type: "spring",
                stiffness: 500,
                damping: 40,
                mass: 1,
              }}
              className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 p-4"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-white/20">
                    <span className="text-lg font-bold text-white">
                      {donation.donorName ? donation.donorName.charAt(0).toUpperCase() : "A"}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-white truncate">
                      {donation.donorName || "Anonymous"}
                    </p>
                    <p className="text-sm text-white/50">
                      {formatDistanceToNow(new Date(donation.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xl font-bold text-white">
                    {formatCurrency(donation.amount, donation.currency)}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
