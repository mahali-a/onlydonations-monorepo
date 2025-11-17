import type { Setting } from "@repo/types";
import { Link, useNavigate } from "@tanstack/react-router";
import { ChevronDown, Menu } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Navlogo } from "@/components/icons/nav-logo";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { authClient } from "@/lib/auth-client";
import { useQuery } from "@tanstack/react-query";

interface PublicNavbarProps {
  settings: Setting | null;
}

export function PublicNavbar({ settings }: PublicNavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();
  const { data: session } = authClient.useSession();

  const { data: orgId } = useQuery({
    queryFn: () => authClient.organization.list(),
    queryKey: ["user-organization", session?.user.id],
    enabled: !!session?.user?.id,
    select: ({ data }) => data?.[0]?.id || null,
  });

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const user = session?.user;
  const fallbackText = user?.name
    ? user.name.charAt(0).toUpperCase()
    : user?.email?.charAt(0).toUpperCase() || "U";

  const navigationLinks = settings?.navigation?.mainNav || [];

  const leftNavItems = navigationLinks.filter(
    (link) => link.position === "left",
  );
  const rightNavItems = navigationLinks.filter(
    (link) => link.position === "right",
  );

  const renderNavItem = (link: (typeof navigationLinks)[0]) => {
    if (link.hasDropdown && link.dropdownItems) {
      return (
        <DropdownMenu key={link.id}>
          <DropdownMenuTrigger className="flex items-center gap-1 text-sm font-medium hover:text-primary transition-colors cursor-pointer">
            {link.label}
            <ChevronDown className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            {link.dropdownItems.map((item) => (
              <DropdownMenuItem key={item.id} asChild>
                <Link
                  to={item.url || "/"}
                  className="w-full cursor-pointer no-underline"
                >
                  <div className="flex flex-col gap-1">
                    <span className="font-medium">{item.label}</span>
                    {item.description && (
                      <span className="text-xs text-muted-foreground">
                        {item.description}
                      </span>
                    )}
                  </div>
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }

    return (
      <Link
        key={link.id}
        to={link.url || "/"}
        className="text-sm font-medium hover:text-primary transition-colors no-underline"
      >
        {link.label}
      </Link>
    );
  };

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out",
        isScrolled
          ? "bg-background/80 backdrop-blur-xl border-b border-border/50 shadow-lg shadow-primary/5"
          : "bg-transparent",
      )}
    >
      <div className="container mx-auto flex h-16 max-w-screen-2xl items-center justify-between px-4 md:px-6">
        {/* Mobile menu trigger - shown on mobile */}
        <div className="md:hidden">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80">
              <div className="flex flex-col gap-6 pt-6">
                <Link
                  to="/"
                  className="flex items-center space-x-2 no-underline"
                  onClick={() => setMobileOpen(false)}
                >
                  <Navlogo className="h-6 w-auto" />
                </Link>

                <nav className="flex flex-col gap-4">
                  {navigationLinks.map((link) => (
                    <div key={link.id} className="flex flex-col gap-2">
                      {link.hasDropdown && link.dropdownItems ? (
                        <>
                          <span className="text-sm font-medium text-muted-foreground">
                            {link.label}
                          </span>
                          <div className="flex flex-col gap-1 pl-4">
                            {link.dropdownItems.map((item) => (
                              <Link
                                key={item.id}
                                to={item.url || "/"}
                                className="text-sm hover:text-primary transition-colors no-underline py-1"
                                onClick={() => setMobileOpen(false)}
                              >
                                {item.label}
                              </Link>
                            ))}
                          </div>
                        </>
                      ) : (
                        <Link
                          to={link.url || "/"}
                          className="text-sm font-medium hover:text-primary transition-colors no-underline"
                          onClick={() => setMobileOpen(false)}
                        >
                          {link.label}
                        </Link>
                      )}
                    </div>
                  ))}
                </nav>

                <div className="flex flex-col gap-2 pt-4 border-t">
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => {
                      setMobileOpen(false);
                      navigate({ to: "/login" });
                    }}
                  >
                    Sign In
                  </Button>
                  <Button
                    className="w-full"
                    onClick={() => {
                      setMobileOpen(false);
                      navigate({ to: "/onboarding", search: {} });
                    }}
                  >
                    Get Started
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Desktop layout: 3-column grid */}
        <div className="hidden md:grid md:grid-cols-3 md:gap-4 md:items-center md:flex-1">
          {/* Left column: Left navigation */}
          <nav className="flex items-center gap-6 justify-start">
            {leftNavItems.map(renderNavItem)}
          </nav>

          {/* Center column: Logo */}
          <Link
            to="/"
            className="flex items-center space-x-2 text-primary hover:text-primary/90 transition-colors no-underline justify-center"
          >
            <Navlogo className="h-8 w-auto" />
          </Link>

          {/* Right column: Right nav + Auth buttons */}
          <div className="flex items-center gap-6 justify-end">
            {/* Right navigation */}
            {rightNavItems.length > 0 && (
              <nav className="flex items-center gap-6">
                {rightNavItems.map(renderNavItem)}
              </nav>
            )}

            {/* Auth buttons */}
            <div className="flex items-center gap-3">
              {session && orgId ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center gap-1 px-1 py-1 rounded-lg hover:bg-accent/30"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={user?.image || undefined}
                          alt={user?.name || "User"}
                        />
                        <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                          {fallbackText}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 text-left">
                        <p className="text-sm font-medium">
                          {user?.name || "User"}
                        </p>
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem asChild>
                      <Link
                        to={`/o/$orgId/campaigns`}
                        params={{
                          orgId,
                        }}
                        search={{}}
                        className="cursor-pointer"
                      >
                        Campaigns
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link
                        to={`/o/$orgId/donations`}
                        params={{
                          orgId,
                        }}
                        search={{}}
                        className="cursor-pointer"
                      >
                        Donations
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link
                        to={`/o/$orgId/account`}
                        params={{
                          orgId,
                        }}
                        className="cursor-pointer"
                      >
                        Account Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={async () => {
                        await authClient.signOut();
                        navigate({ to: "/" });
                      }}
                      className="text-destructive focus:text-destructive cursor-pointer"
                    >
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate({ to: "/login" })}
                >
                  Sign In
                </Button>
              )}
              <Button asChild size="sm">
                <Link to="/login">Start fundraider</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile: Just show logo on right side */}
        <div className="md:hidden" />
      </div>
    </header>
  );
}
