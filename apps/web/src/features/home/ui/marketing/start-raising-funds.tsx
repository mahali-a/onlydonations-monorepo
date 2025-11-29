import { type ComponentType, useState } from "react";

import { NoteIcon, RaisingFunds, SpeakingIcon, TrophyIcon } from "@/components/icons/marketing";

type Step = {
  id: number;
  title: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
  image: string;
};

const steps: Step[] = [
  {
    id: 1,
    title: "Tell Your Story",
    description:
      "Start by creating a campaign. Let your family, friends and community know why your cause matters.",
    icon: NoteIcon,
    image: "/images/marketing/home/tell-your-story.png",
  },
  {
    id: 2,
    title: "Spread the Word",
    description:
      "Share your campaign to friends and family, even on social media. Watch your supporters become advocates.",
    icon: SpeakingIcon,
    image: "/images/marketing/home/spread-the-word.png",
  },
  {
    id: 3,
    title: "Make It Happen",
    description:
      "Start receiving donations from earth's loving hands. See your goals and needs turn into reality.",
    icon: TrophyIcon,
    image: "/images/marketing/home/chemistry.svg",
  },
];

export function StartRaisingFunds() {
  const [activeStep, setActiveStep] = useState<number>(1);

  const currentStep = steps.find((step) => step.id === activeStep) ?? steps[0]!;

  return (
    <div
      className="mx-auto mt-10 mb-6 flex max-w-[1313.41px] flex-col items-center gap-8 px-4 md:gap-20 lg:mb-10"
      data-section="how-it-works"
    >
      <div className="relative z-10 flex flex-col items-center gap-4">
        <div className="flex items-center justify-center gap-2">
          <RaisingFunds />
          <h4 className="font-geist text-[12px] font-normal leading-[18px] tracking-[4%] text-[#AF5903]">
            HOW IT WORKS
          </h4>
        </div>
        <h2 className="text-center font-eudoxus text-[34px] font-bold text-[#010101] leading-[75.4px] md:text-[58px]">
          Start Raising Funds -{" "}
          <span className="relative font-eudoxus">
            Easy
            <span className="absolute inset-x-0 bottom-2 z-[-10] h-3 bg-[#FDD3AA] md:h-7" />
          </span>
        </h2>
      </div>

      <div className="flex w-full flex-col gap-8 lg:hidden">
        {steps.map((step) => {
          const StepIcon = step.icon;

          return (
            <div className="flex flex-col gap-6" key={step.id}>
              <div className="flex flex-col gap-4 p-6">
                <div className="flex justify-start">
                  <span className="flex h-12 w-12 items-center justify-start font-eudoxus text-xl font-bold text-[#828EA3]">
                    {step.id}
                  </span>
                </div>

                <div className="flex items-center gap-3 font-eudoxus text-xl font-bold leading-[30px] text-[#010101]">
                  <StepIcon className="h-10 w-10" />
                  {step.title}
                </div>

                <p className="font-geist text-base font-medium leading-6 tracking-[-2%] text-[#5C687D]">
                  {step.description}
                </p>
              </div>

              <div className="flex justify-center">
                <div className="relative flex h-[300px] w-full max-w-[400px] items-center justify-center">
                  <img
                    alt={`${step.title} illustration`}
                    className="h-auto max-w-full object-contain"
                    loading="lazy"
                    src={step.image}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="hidden h-[644px] w-[973px] gap-20 lg:flex lg:flex-row lg:items-center">
        <div className="flex flex-1 justify-center lg:justify-start">
          <div className="relative flex h-[400px] w-full max-w-[500px] items-center justify-center lg:h-[500px]">
            <img
              alt={`${currentStep.title} illustration`}
              className="h-auto max-w-full object-contain transition-opacity duration-300"
              loading="lazy"
              src={currentStep.image}
            />
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-8 lg:max-w-lg">
          <div className="flex flex-col gap-8">
            {steps.map((step) => {
              const StepIcon = step.icon;
              const isActive = step.id === activeStep;

              return (
                <button
                  className={`w-full border p-6 text-left transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FB922A]/60 focus-visible:ring-offset-2 ${
                    isActive
                      ? "rounded-2xl border-[#FB922A] shadow-[0_2px_4px_-1px_rgba(16,25,40,0.02),0_5px_13px_25px_rgba(16,25,40,0.05)]"
                      : "rounded-2xl border-transparent hover:border-gray-200"
                  }`}
                  key={step.id}
                  onClick={() => setActiveStep(step.id)}
                  onFocus={() => setActiveStep(step.id)}
                  onMouseEnter={() => setActiveStep(step.id)}
                  type="button"
                >
                  <div className="flex flex-col gap-4">
                    <div className="flex justify-start">
                      <span
                        className={`flex h-12 w-12 items-center justify-start font-eudoxus text-xl font-bold transition-all duration-200 ${
                          isActive ? "text-[#AF5903]" : "text-[#828EA3]"
                        }`}
                      >
                        {step.id}
                      </span>
                    </div>

                    <div
                      className={`flex items-center gap-3 font-eudoxus text-xl font-bold leading-[30px] transition-all duration-200 ${
                        isActive ? "text-[#010101]" : "text-[#828EA3]"
                      }`}
                    >
                      <StepIcon className="h-10 w-10" />
                      {step.title}
                    </div>

                    <p
                      className={`font-geist text-base font-medium leading-6 tracking-[-2%] transition-all duration-200 ${
                        isActive ? "text-[#5C687D]" : "text-[#9CA3AF]"
                      }`}
                    >
                      {step.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
