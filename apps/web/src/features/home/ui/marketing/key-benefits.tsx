import type { CSSProperties } from "react";

const baseAnimation: CSSProperties = {
  animationDuration: "1.3s",
};

const animate: CSSProperties = {
  ...baseAnimation,
  animation: "updownmore ease-out 1s infinite alternate",
};

const benefits = [
  {
    key: 1,
    heading: "Start Garnering Love",
    paragraph: "Launch campaigns that inspire support from family, friends, and communities",
    icon: "/images/marketing/home/smiling-face-with-hearts.png",
  },
  {
    key: 2,
    heading: "Make Huge Impacts",
    paragraph:
      "Empower your organization to make a difference with matched donations and corporate giving",
    icon: "/images/marketing/home/hand-shake.png",
  },
  {
    key: 3,
    heading: "Monitor Your Progress",
    paragraph:
      "Track every donation in real time, and thank supporters easily, all from one control board",
    icon: "/images/marketing/home/bar-chart.png",
  },
];

export function KeyBenefits() {
  return (
    <div className="flex w-full flex-col items-center justify-center px-4 py-12">
      <div className="flex w-full max-w-[1041px] flex-col items-center justify-center gap-8 md:gap-12">
        <div className="flex items-center gap-4">
          <img
            alt="Key benefits icon"
            className="h-8 w-8 md:h-10 md:w-10"
            loading="lazy"
            src="/images/marketing/home/key-benefits.png"
          />
          <h4 className="font-geist text-[10px] font-normal leading-[18px] text-[#AF5903] md:text-[12px]">
            KEY BENEFITS
          </h4>
        </div>

        <div className="relative z-10 px-4 text-center">
          <h2 className="font-eudoxus text-[34px] font-bold leading-tight md:text-4xl md:leading-[1.3] lg:text-[58px] lg:leading-[75.4px]">
            Transforming{" "}
            <span className="relative font-eudoxus">
              Lives
              <span className="absolute inset-x-0 bottom-2 z-[-10] h-3 bg-[#FDD3AA] md:h-7" />
            </span>{" "}
            Through <br className="hidden md:block" /> Love &amp; Generosity
          </h2>
        </div>

        <div className="flex w-full flex-col gap-12 py-5 md:flex-row md:gap-6 md:pr-4 lg:gap-12">
          {benefits.map((benefit) => (
            <div className="relative w-full" key={benefit.key}>
              <img
                alt="Decorative ellipse"
                className="absolute left-0 top-3 h-14 w-14 lg:top-0 lg:h-[68px] lg:w-[68px]"
                loading="lazy"
                src="/images/marketing/home/ellipse.png"
                style={animate}
              />
              <div className="relative left-0 top-5 flex h-[350px] w-full flex-col rounded-3xl border border-[#EFF0F2] bg-white p-6 shadow-sm md:left-4 md:h-[400px] lg:h-[366px]">
                <div className="mb-6 md:mb-8 lg:mb-10">
                  <img
                    alt={benefit.heading}
                    className="h-12 w-12 object-contain"
                    height={48}
                    loading="lazy"
                    src={benefit.icon}
                    width={48}
                  />
                </div>
                <div className="flex flex-grow flex-col gap-4">
                  <h3 className="font-eudoxus text-lg font-bold leading-tight text-[#3B4351] md:text-xl">
                    {benefit.heading}
                  </h3>
                  <p className="font-geist text-base font-medium text-[#5C687D]">
                    {benefit.paragraph}
                  </p>
                </div>
                <div className="mt-auto">
                  <img
                    alt="Gradient"
                    className="mt-auto aspect-[250/54] h-auto w-full"
                    loading="lazy"
                    src="/images/marketing/home/gradient.png"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
