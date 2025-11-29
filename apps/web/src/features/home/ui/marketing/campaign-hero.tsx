import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export function CampaignHero() {
  return (
    <div className="container relative mx-auto mt-10 mb-24 min-h-[300px] w-full overflow-hidden rounded-3xl bg-gradient-to-t from-[#DD9852] to-[#FEE9D4] lg:mt-20 lg:h-[601px]">
      <div
        className="absolute left-0 top-0 h-full w-full"
        style={{
          backgroundImage: "url('/images/marketing/home/start-campaign/ellipse-588.png')",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
        }}
      />
      <img
        alt="Decorative ellipse"
        className="absolute -ml-10 -mt-10"
        loading="lazy"
        src="/images/marketing/home/ellipse.png"
        style={{
          animation: "diagonalUpDown 1.3s infinite alternate cubic-bezier(0.445, 0.05, 0.55, 0.95)",
        }}
      />
      <img
        alt="Decorative ellipse"
        className="absolute bottom-0 -ml-10 -mb-20 h-40 md:h-[346px]"
        loading="lazy"
        src="/images/marketing/home/ellipse.png"
        style={{
          animation: "updownBig 1.3s infinite alternate cubic-bezier(0.445, 0.05, 0.55, 0.95)",
        }}
      />
      <img
        alt="Decorative ellipse"
        className="absolute left-1/3 -mt-7 h-24 lg:h-[118px]"
        loading="lazy"
        src="/images/marketing/home/ellipse.png"
        style={{
          animation: "updownBig2 1.3s infinite alternate cubic-bezier(0.445, 0.05, 0.55, 0.95)",
        }}
      />
      <img
        alt="Decorative ellipse"
        className="absolute bottom-0 left-1/2 -mb-20 h-52 lg:h-[230px]"
        loading="lazy"
        src="/images/marketing/home/ellipse.png"
        style={{
          animation: "updownBig2 1.3s infinite alternate cubic-bezier(0.445, 0.05, 0.55, 0.95)",
        }}
      />
      <img
        alt="Decorative ellipse"
        className="absolute bottom-0 right-0 -mb-12 -mr-12 h-10 z-20 md:h-[430px]"
        loading="lazy"
        src="/images/marketing/home/ellipse.png"
        style={{
          animation:
            "diagonalUpDown2 1.3s infinite alternate cubic-bezier(0.445, 0.05, 0.55, 0.95)",
        }}
      />
      <img
        alt="Decorative ellipse"
        className="absolute right-0 -mt-14 z-20 mr-20 h-[253px]"
        loading="lazy"
        src="/images/marketing/home/ellipse.png"
        style={{
          animation: "updownBig 1.3s infinite alternate cubic-bezier(0.445, 0.05, 0.55, 0.95)",
        }}
      />
      <div className="relative z-10 flex min-h-[600px] flex-col items-center justify-center px-4 text-center">
        <h1 className="mb-4 font-eudoxus text-4xl font-bold text-[#643302] md:text-5xl lg:text-6xl">
          Ready to Make a Difference?
        </h1>
        <h2 className="mb-8 font-eudoxus text-3xl font-bold text-[#643302] md:text-4xl lg:text-5xl">
          Start Your Campaign Today
        </h2>
        <div className="flex flex-col gap-4 sm:flex-row">
          <Button
            asChild
            className="rounded-lg bg-black font-geist text-sm font-semibold text-white hover:bg-black/90"
            size="lg"
          >
            <a href="/login?next=/my-campaigns/create">Start Your Campaign</a>
          </Button>
          <Button
            asChild
            className="rounded-lg border border-[#b85c38] bg-transparent px-6 text-[#AF5903] transition-colors hover:bg-[#b85c38] hover:text-white"
            size="lg"
            variant="outline"
          >
            <Link to="/discover">Donate to a Cause</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
