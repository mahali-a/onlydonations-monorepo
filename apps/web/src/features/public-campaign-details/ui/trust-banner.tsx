import { Link } from "@tanstack/react-router";
import { Atom, Rocket, ShieldCheck } from "lucide-react";

export function TrustBanner() {
  return (
    <div className="bg-background py-16">
      <div className="mx-auto max-w-[1152px] px-4 sm:px-4">
        <h2 className="mb-12 text-center text-xl font-bold text-foreground sm:text-2xl">
          Your easy, powerful, and trusted home for help
        </h2>

        <div className="grid gap-8 md:grid-cols-3">
          {/* Easy */}
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <Rocket className="h-8 w-8 text-foreground" strokeWidth={1.5} />
            </div>
            <div>
              <h3 className="font-bold text-foreground">Easy</h3>
              <p className="text-sm text-muted-foreground">Donate quickly and easily</p>
            </div>
          </div>

          {/* Powerful */}
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <Atom className="h-8 w-8 text-foreground" strokeWidth={1.5} />
            </div>
            <div>
              <h3 className="font-bold text-foreground">Powerful</h3>
              <p className="text-sm text-muted-foreground">
                Send help right to the people and causes you care about
              </p>
            </div>
          </div>

          {/* Trusted */}
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <ShieldCheck className="h-8 w-8 text-foreground" strokeWidth={1.5} />
            </div>
            <div>
              <h3 className="font-bold text-foreground">Trusted</h3>
              <p className="text-sm text-muted-foreground">
                Your donation is protected by the{" "}
                <Link to="/" className="underline hover:no-underline">
                  OnlyDonations Giving Guarantee
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
