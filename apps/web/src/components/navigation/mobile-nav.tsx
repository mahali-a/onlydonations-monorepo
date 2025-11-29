import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, Menu } from "lucide-react";
import type { ComponentType, ReactNode } from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

export interface MobileNavLink {
  id: string;
  label: string;
  url: string;
  icon?: ComponentType<{ className?: string }>;
  hasDropdown?: boolean;
  dropdownItems?: Array<{
    id: string;
    label: string;
    url: string;
    description?: string;
  }>;
}

export interface MobileNavProps {
  /**
   * Logo component to display at the top of the mobile nav
   */
  logo?: ReactNode;

  /**
   * Navigation links to display
   */
  links?: MobileNavLink[];

  /**
   * Content to display in the footer section (e.g., auth buttons)
   */
  footer?: ReactNode;

  /**
   * Additional content to display above the footer
   */
  children?: ReactNode;

  /**
   * Custom trigger button (defaults to hamburger menu icon)
   */
  trigger?: ReactNode;

  /**
   * Side to slide in from
   * @default "left"
   */
  side?: "left" | "right" | "top" | "bottom";

  /**
   * Width of the sheet
   * @default "w-80"
   */
  width?: string;

  /**
   * Custom className for the trigger wrapper
   */
  className?: string;

  /**
   * Hide on large screens (md and up)
   * @default true - hidden on large screens by default
   */
  hideOnLargeScreens?: boolean;
}

/**
 * Mobile navigation component using Sheet pattern
 *
 * Based on the pattern from public-navbar.tsx
 *
 * @example
 * ```tsx
 * <MobileNav
 *   logo={<Logo />}
 *   links={navigationLinks}
 *   footer={
 *     <>
 *       <Button onClick={handleSignIn}>Sign In</Button>
 *       <Button onClick={handleSignUp}>Sign Up</Button>
 *     </>
 *   }
 * />
 * ```
 */
export function MobileNav({
  logo,
  links = [],
  footer,
  children,
  trigger,
  side = "left",
  width = "w-80",
  className,
  hideOnLargeScreens = true,
}: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const [activeLinkId, setActiveLinkId] = useState<string | null>(null);

  const defaultTrigger = (
    <Button variant="ghost" size="icon">
      <Menu className="h-5 w-5" />
      <span className="sr-only">Toggle menu</span>
    </Button>
  );

  const activeLink = activeLinkId ? links.find((link) => link.id === activeLinkId) : null;

  return (
    <div className={cn(hideOnLargeScreens && "md:hidden", className)}>
      <Sheet
        open={open}
        onOpenChange={(val) => {
          setOpen(val);
          if (!val) {
            // Reset state after a short delay to allow closing animation to finish
            setTimeout(() => setActiveLinkId(null), 300);
          }
        }}
      >
        <SheetTrigger asChild>{trigger || defaultTrigger}</SheetTrigger>
        <SheetContent side={side} className={cn("p-0 gap-0 overflow-hidden", width)}>
          <div className="flex flex-col h-full">
            {/* Header Area */}
            <div className="flex items-center min-h-14 px-4 py-4 border-b shrink-0 bg-background z-10">
              {activeLink ? (
                <button
                  type="button"
                  onClick={() => setActiveLinkId(null)}
                  className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Back
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="cursor-pointer w-full"
                >
                  {logo}
                </button>
              )}
            </div>

            {/* Sliding Content Area */}
            <div className="relative flex-1 overflow-hidden bg-background">
              {/* Root View */}
              <div
                className={cn(
                  "absolute inset-0 w-full h-full overflow-y-auto transition-transform duration-300 ease-in-out px-6",
                  activeLinkId ? "-translate-x-full" : "translate-x-0",
                )}
              >
                <div className="flex flex-col gap-6 py-6">
                  {/* Navigation Links */}
                  {links.length > 0 && (
                    <nav className="flex flex-col gap-2">
                      {links.map((link) => (
                        <div key={link.id}>
                          {link.hasDropdown && link.dropdownItems ? (
                            <button
                              type="button"
                              onClick={() => setActiveLinkId(link.id)}
                              className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
                            >
                              <div className="flex items-center gap-2">
                                {link.icon && <link.icon className="h-4 w-4" />}
                                {link.label}
                              </div>
                              <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            </button>
                          ) : (
                            <Link
                              to={link.url}
                              className="flex items-center gap-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground rounded-md px-3 py-2 transition-colors no-underline"
                              onClick={() => setOpen(false)}
                            >
                              {link.icon && <link.icon className="h-4 w-4" />}
                              {link.label}
                            </Link>
                          )}
                        </div>
                      ))}
                    </nav>
                  )}

                  {/* Custom Children */}
                  {children}

                  {/* Footer Section */}
                  {footer && <div className="flex flex-col gap-2 pt-4 border-t">{footer}</div>}
                </div>
              </div>

              {/* Sub View */}
              <div
                className={cn(
                  "absolute inset-0 w-full h-full overflow-y-auto transition-transform duration-300 ease-in-out px-6 py-6 bg-background",
                  activeLinkId ? "translate-x-0" : "translate-x-full",
                )}
              >
                <div className="flex flex-col gap-6">
                  {activeLink && (
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center gap-2 px-1">
                        <span className="font-semibold text-lg">{activeLink.label}</span>
                      </div>

                      <div className="flex flex-col gap-1">
                        {activeLink.dropdownItems?.map((item) => (
                          <Link
                            key={item.id}
                            to={item.url}
                            className="flex flex-col gap-1 rounded-md px-3 py-3 hover:bg-accent hover:text-accent-foreground transition-colors no-underline"
                            onClick={() => setOpen(false)}
                          >
                            <span className="text-sm font-medium">{item.label}</span>
                            {item.description && (
                              <span className="text-xs text-muted-foreground">
                                {item.description}
                              </span>
                            )}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
