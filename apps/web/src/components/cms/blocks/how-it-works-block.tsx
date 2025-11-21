import type { HowItWorksBlock as HowItWorksBlockType } from "@repo/types/payload";
import { Link } from "lucide-react";

interface StepCardProps {
  step: string;
  title: string;
  description: string;
  children: React.ReactNode;
}

function StepCard({ step, title, description, children }: StepCardProps) {
  return (
    <div className="bg-[#f8f8f6] rounded-2xl p-6 flex flex-col h-full">
      <div className="text-primary font-bold text-sm mb-4">{step}</div>
      <div className="mb-6">{children}</div>
      <h3 className="text-2xl font-bold mb-4 text-[#2a2e30] leading-tight">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
  );
}

export function HowItWorksBlock({ block }: { block: HowItWorksBlockType }) {
  return (
    <section className="bg-white py-20">
      <nav className="flex justify-center pb-8">
        <div className="flex items-center gap-6 text-sm font-medium text-gray-600">
          <button type="button" className="bg-[#2a2e30] text-white px-4 py-2 rounded-full">
            How to start
          </button>
          <button type="button" className="hover:text-black">
            Tips
          </button>
          <button type="button" className="hover:text-black">
            Examples
          </button>
          <button type="button" className="hover:text-black">
            Resources
          </button>
          <button type="button" className="hover:text-black">
            Questions
          </button>
          <button type="button" className="hover:text-black">
            Why onlydonations
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-4xl font-bold text-center mb-16 text-[#2a2e30]">{block.title}</h2>

        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <StepCard
            step="Step 1"
            title="Our tools help create your fundraiser"
            description="Click the 'Start a onlydonations' button to get started. You'll be guided by prompts to add fundraiser details and set your goal, which can be changed anytime."
          >
            <div className="bg-primary/10 p-6 rounded-xl h-48 flex items-center justify-center">
              <div className="bg-white p-4 rounded-lg shadow-sm w-full max-w-[200px]">
                <div className="text-xs font-medium text-gray-500 mb-2">
                  Tell us who you're raising funds for
                </div>
                <div className="flex gap-2 justify-between">
                  <div className="border rounded p-2 flex-1 flex flex-col items-center gap-1">
                    <div className="w-4 h-4 rounded-full border border-gray-300" />
                    <span className="text-[8px]">Yourself</span>
                  </div>
                  <div className="border rounded p-2 flex-1 flex flex-col items-center gap-1">
                    <div className="w-4 h-4 rounded-full border border-gray-300" />
                    <span className="text-[8px]">Someone else</span>
                  </div>
                  <div className="border rounded p-2 flex-1 flex flex-col items-center gap-1">
                    <div className="w-4 h-4 rounded-full border border-gray-300" />
                    <span className="text-[8px]">Charity</span>
                  </div>
                </div>
              </div>
            </div>
          </StepCard>

          <StepCard
            step="Step 2"
            title="Share your fundraiser link to reach donors"
            description="Once live, share your fundraiser link with friends and family to start gaining momentum. You'll also find helpful resources for running your fundraiser in your onlydonations dashboard."
          >
            <div className="bg-primary/10 p-6 rounded-xl h-48 flex items-center justify-center">
              <div className="bg-white p-3 rounded-lg shadow-sm flex items-center gap-3 w-full max-w-[220px]">
                <div className="bg-primary text-white p-1.5 rounded-full">
                  <Link size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold">Copy link</div>
                  <div className="text-[10px] text-gray-400 truncate">
                    gofund.me/fundraiserurl...
                  </div>
                </div>
              </div>
            </div>
          </StepCard>

          <StepCard
            step="Step 3"
            title="Securely receive the funds you raise"
            description="Add your bank information to securely start receiving funds or invite your intended recipient to add theirs. You don't need to reach your fundraising goal to receive your money."
          >
            <div className="bg-primary/10 p-6 rounded-xl h-48 flex items-center justify-center">
              <div className="bg-white p-4 rounded-lg shadow-sm w-full max-w-[200px]">
                <div className="text-xs font-medium text-gray-500 mb-3">Transfers</div>
                <div className="bg-primary/90 text-white p-3 rounded-lg mb-2">
                  <div className="text-xl font-bold">$2,050</div>
                  <div className="text-[10px] opacity-70">Expected by Nov 6</div>
                </div>
                <div className="flex items-center justify-between text-[10px] text-gray-500">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    <span>Bank account</span>
                  </div>
                  <span className="border px-1 rounded">Edit</span>
                </div>
              </div>
            </div>
          </StepCard>
        </div>

        <div className="text-center mt-20">
          <button
            type="button"
            onClick={() => {
              if (block.ctaLink) {
                window.location.href = block.ctaLink;
              }
            }}
            className="bg-primary hover:bg-primary/90 text-white font-bold py-3 px-8 rounded-xl transition-colors duration-200 shadow-sm"
          >
            {block.ctaText}
          </button>
        </div>
      </main>
    </section>
  );
}
