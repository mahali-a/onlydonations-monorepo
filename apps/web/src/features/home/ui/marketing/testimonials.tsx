import { QuotesIcon, SmileyFaceIcon } from "@/components/icons/marketing";

const testimonials = [
  {
    key: 1,
    testimony:
      "Onlydonations made it so easy to support a cause I truly believe in. I'm amazed by the impact my small donation has made. It's inspiring to see the power of collective giving.",
    name: "Chijioke Okonkwo",
    title: "Donor",
    image: "/images/marketing/home/landing-page/donor.png",
  },
  {
    key: 2,
    testimony:
      "I was skeptical at first, but Onlydonations exceeded my expectations. The transparency and efficiency are unmatched. I'm proud to be a part of this community.",
    name: "Kwame Mensah",
    title: "Fundraiser",
    image: "/images/marketing/home/landing-page/donor2.png",
  },
  {
    key: 3,
    testimony:
      "What an incredible platform Onlydonations is! I feel privileged to be able to contribute to such meaningful projects. This platform is truly a game-changer.",
    name: "Leila Patel",
    title: "Donor",
    image: "/images/marketing/home/landing-page/donor3.png",
  },
];

export function Testimonials() {
  return (
    <div className="w-full py-8 md:py-16">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-8 px-4 sm:px-6 md:gap-20 lg:px-8">
        <div className="relative z-10 flex w-full max-w-2xl flex-col items-center gap-4 text-center">
          <h4 className="flex items-center gap-2 font-geist text-xs font-medium leading-[18px] tracking-[4%] text-[#6C7A93]">
            <SmileyFaceIcon className="h-6 w-6" /> TESTIMONIALS
          </h4>
          <h2 className="font-eudoxus text-[34px] font-bold leading-10 text-[#010101] md:text-4xl lg:text-[58px] lg:leading-[75px]">
            Words on These Busy Streets About{" "}
            <span className="relative font-eudoxus">
              Us
              <span className="absolute inset-x-0 bottom-2 z-[-10] h-3 bg-[#FDD3AA] md:h-7" />
            </span>
          </h2>
        </div>

        <div className="w-full rounded-2xl border border-[#EFF0F2]">
          <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-3 md:p-8">
            <StatBlock label="Supporters Strong" value="10,000+" withDivider />
            <StatBlock label="Campaign Success Rate" value="90%" withDivider />
            <StatBlock label="Impact Created" value="₵1M+" />
          </div>
        </div>

        <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <div
              className="flex w-full flex-col gap-8 rounded-2xl border p-6 md:p-8"
              key={testimonial.key}
            >
              <div className="flex gap-2 font-geist text-base font-medium text-[#4C5667]">
                <span>
                  <QuotesIcon className="h-6 w-6" />
                </span>
                {testimonial.testimony}
              </div>
              <div className="flex flex-col">
                <span className="font-eudoxus text-lg font-bold text-[#010101] md:text-xl">
                  {testimonial.name}
                </span>
                <span className="font-geist text-sm font-medium">{testimonial.title}</span>
              </div>
              <div className="relative mx-auto flex items-center justify-center">
                <img
                  alt="Decorative sphere"
                  className="absolute right-20 h-40 w-40 md:h-[190px] md:w-[190px]"
                  loading="lazy"
                  src="/images/marketing/home/ellipse.png"
                />
                <div className="relative ml-20 flex items-center justify-center">
                  <img
                    alt={`${testimonial.name} - ${testimonial.title}`}
                    className="h-40 w-40 rounded-full border-4 border-[#FDD3AA] object-cover md:h-[190px] md:w-[190px]"
                    loading="lazy"
                    src={testimonial.image}
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

function StatBlock({
  value,
  label,
  withDivider = false,
}: {
  value: string;
  label: string;
  withDivider?: boolean;
}) {
  return (
    <div
      className={`flex flex-col items-center gap-4 py-6 ${
        withDivider ? "border-b md:border-r md:border-b-0" : ""
      }`}
    >
      <span className="font-eudoxus text-3xl font-bold md:text-4xl">{value}</span>
      <span className="font-geist text-sm font-medium text-[#828EA3] md:text-base">{label}</span>
    </div>
  );
}
