import { Link } from "@tanstack/react-router";
import type { CSSProperties } from "react";

import { Button } from "@/components/ui/button";

const baseAnimation: CSSProperties = {
  animationDuration: "1.3s",
};

const animateOne: CSSProperties = {
  ...baseAnimation,
  animation: "updown ease-out 1s infinite alternate",
};

const animateTwo: CSSProperties = {
  ...baseAnimation,
  animation: "updown2 ease-out 1s infinite alternate",
};

export function Hero() {
  return (
    <div
      className="h-fit w-full"
      style={{
        backgroundImage: "url('/images/marketing/home/transparent-landing-image.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="top-0 left-0 flex w-full flex-col items-center md:gap-12 lg:mt-14">
        <div className="flex h-fit max-w-[724px] flex-col items-center gap-4 p-2 md:gap-6">
          <div className="mt-10 flex items-center gap-2 rounded-full border border-[#EFF0F2] px-2 lg:mt-0 lg:w-[550px] lg:gap-4 lg:px-4 lg:py-2">
            <img alt="Payment methods" src="/images/marketing/home/frame.png" />
            <h4 className="flex-wrap font-geist font-medium text-[#AF5903] text-[12px] lg:text-sm">
              Secure donations with mobile money and other payment methods
            </h4>
          </div>
          <h1 className="relative z-10 text-center font-eudoxus text-[40px] font-bold leading-[48px] md:text-[70px] md:leading-[84px]">
            Donating money shouldn&apos;t be{" "}
            <span className="relative font-eudoxus">
              difficult
              <span className="absolute inset-x-0 bottom-2 z-[-10] h-4 bg-[#FDD3AA] md:h-9" />
            </span>
          </h1>
          <div className="px-4 text-center font-geist text-sm font-medium lg:text-base">
            From personal causes to community projects and corporate initiatives,
            <br /> you can start raising funds for your dreams with Onlydonations
          </div>
          <div className="flex w-full flex-col justify-center gap-4 sm:w-auto sm:flex-row">
            <Button
              asChild
              className="bg-black font-geist text-sm font-semibold text-white shadow-[0_4px_8px_#FCA85580] hover:bg-black/90"
            >
              <a href="/login?next=/my-campaigns/create">Start Your Campaign</a>
            </Button>
            <Button
              asChild
              className="rounded-lg font-geist text-sm font-semibold text-[#333333] shadow-[0px_2px_2px_0px_#0000000A]"
              variant="outline"
            >
              <Link to="/discover">Donate to a Cause</Link>
            </Button>
          </div>
        </div>

        <div className="relative w-auto min-w-[200px] origin-center scale-50 sm:scale-75 md:scale-100 md:p-10">
          <img
            alt="Decorative ellipse"
            className="absolute bottom-12 -ml-24 animate-updown md:bottom-28"
            src="/images/marketing/home/donating-money/ellipse-light-left.png"
            style={animateOne}
          />
          <img
            alt="Happy family"
            className="relative z-10 min-w-[400px] sm:min-w-[440px]"
            src="/images/marketing/home/donating-money/mum.png"
          />
          <img
            alt="Boy planting"
            className="absolute top-6 z-20 -ml-28 animate-updown md:top-16"
            src="/images/marketing/home/donating-money/frame-9.png"
            style={animateOne}
          />
          <img
            alt="Hammer"
            className="absolute right-0 bottom-6 z-20 -mr-32 animate-updown md:bottom-16 lg:-mr-20"
            src="/images/marketing/home/donating-money/frame-10.png"
            style={animateTwo}
          />
          <img
            alt="Decorative ellipse"
            className="absolute right-0 top-10 z-0 -mr-20 animate-updown md:top-24"
            src="/images/marketing/home/donating-money/ellipse-light-right.png"
            style={animateTwo}
          />
          <img
            alt="Thumbs up"
            className="absolute top-0 left-1/2 z-20 -mt-8 -ml-10 animate-updown md:mt-4"
            src="/images/marketing/home/donating-money/thumbs-up.png"
            style={animateOne}
          />
          <img
            alt="Happy emoji"
            className="absolute top-12 right-0 z-20 -mr-10 mt-4 animate-updown md:top-28 md:mr-0"
            src="/images/marketing/home/donating-money/happy.png"
            style={animateOne}
          />
          <img
            alt="Party face"
            className="absolute bottom-28 z-20 -ml-10 animate-updown md:bottom-44"
            src="/images/marketing/home/donating-money/party-face.png"
            style={animateOne}
          />
          <img
            alt="Party popper"
            className="absolute bottom-4 left-1/2 z-20 -ml-10 mt-4 animate-updown"
            src="/images/marketing/home/donating-money/party-popper.png"
            style={animateTwo}
          />
        </div>
      </div>
    </div>
  );
}
