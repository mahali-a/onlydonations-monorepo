import type { Setting } from "@repo/types";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { ChevronDown, ChevronRight, Search } from "lucide-react";
import { Navlogo } from "@/components/icons/nav-logo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { authClient } from "@/lib/auth-client";
import { MobileNav } from "./mobile-nav";

interface PublicNavbarProps {
  settings: Setting | null;
}

export function PublicNavbar({ settings }: PublicNavbarProps) {
  const navigate = useNavigate();
  const { data: session, isPending: isSessionPending } = authClient.useSession();

  const { data: orgId, isPending: isOrgPending } = useQuery({
    queryFn: () => authClient.organization.list(),
    queryKey: ["user-organization", session?.user.id],
    enabled: !!session?.user?.id,
    select: ({ data }) => data?.[0]?.id || null,
  });

  const isLoading = isSessionPending || (session?.user?.id && isOrgPending);

  const user = session?.user;
  const fallbackText = user?.name
    ? user.name.charAt(0).toUpperCase()
    : user?.email?.charAt(0).toUpperCase() || "U";

  const navigationLinks = settings?.navigation?.mainNav || [];

  const leftNavItems = navigationLinks.filter((link) => link.position === "left");
  const rightNavItems = navigationLinks.filter((link) => link.position === "right");

  const renderNavItem = (link: (typeof navigationLinks)[0]) => {
    if (link.hasDropdown && link.dropdownItems) {
      return (
        <DropdownMenu key={link.id}>
          <DropdownMenuTrigger className="flex items-center gap-1 text-sm font-medium hover:bg-accent hover:text-accent-foreground rounded-md px-3 py-2 transition-colors cursor-pointer">
            {link.label}
            <ChevronDown className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="w-[600px] p-6 rounded-3xl shadow-[0_6px_30px_rgba(0,0,0,0.1)] border-none"
          >
            <div className="grid grid-cols-2 gap-2">
              {link.dropdownItems.map((item) => (
                <DropdownMenuItem
                  key={item.id}
                  asChild
                  className="rounded-xl px-4 py-3 cursor-pointer focus:bg-accent/50"
                >
                  <Link to={item.url || "/"} className="w-full cursor-pointer no-underline">
                    <div className="flex flex-col gap-1">
                      <span className="font-medium text-base">{item.label}</span>
                      {item.description && (
                        <span className="text-xs text-muted-foreground">{item.description}</span>
                      )}
                    </div>
                  </Link>
                </DropdownMenuItem>
              ))}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }

    return (
      <Link
        key={link.id}
        to={link.url || "/"}
        className="text-sm font-medium hover:bg-accent hover:text-accent-foreground rounded-md px-3 py-2 transition-colors no-underline"
      >
        {link.label}
      </Link>
    );
  };

  return (
    <header className="w-full border-b border-border/30 bg-background">
      <div className="container mx-auto flex h-16 max-w-screen-2xl items-center justify-between px-4 md:px-6 relative">
        {/* Mobile menu */}
        <MobileNav
          logo={
            session && orgId ? (
              <div className="flex w-full flex-col items-center gap-3 py-4 px-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage
                    src={user?.image || undefined}
                    alt={user?.name || "User"}
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                    {fallbackText}
                  </AvatarFallback>
                </Avatar>
                <div className="text-center">
                  <p className="font-semibold text-lg">{user?.name || "User"}</p>
                  <Link
                    to={`/o/$orgId/account`}
                    params={{ orgId }}
                    className="text-sm text-muted-foreground flex items-center justify-center gap-1 hover:text-foreground transition-colors no-underline"
                  >
                    Profile <ChevronRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            ) : (
              <Link to="/" className="flex items-center space-x-2 no-underline py-2">
                <Navlogo className="h-6 w-auto text-foreground" />
              </Link>
            )
          }
          links={[
            ...[...leftNavItems, ...rightNavItems]
              .filter((link): link is typeof link & { id: string } => !!link.id)
              .map((link) => ({
                id: link.id,
                label: link.label,
                url: link.url || "/",
                hasDropdown: link.hasDropdown ?? false,
                dropdownItems: link.dropdownItems
                  ?.filter((item): item is typeof item & { id: string } => !!item.id)
                  .map((item) => ({
                    id: item.id,
                    label: item.label,
                    url: item.url || "/",
                    description: item.description ?? undefined,
                  })),
              })),
          ]}
          footer={
            <div className="flex flex-col gap-4 pt-4">
              <Button asChild size="sm" className="w-full">
                <Link to="/login" search={{ next: "/app" }}>
                  Start fundraider
                </Link>
              </Button>

              {!session && (
                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={() => navigate({ to: "/login", search: { next: "/app" } })}
                >
                  Sign In
                </Button>
              )}

              {session && (
                <Button
                  variant="ghost"
                  className="w-full text-muted-foreground hover:text-foreground"
                  onClick={async () => {
                    await authClient.signOut();
                    navigate({ to: "/" });
                  }}
                >
                  Sign Out
                </Button>
              )}
            </div>
          }
        />

        {/* Mobile: Logo centered */}
        <Link
          to="/"
          className="absolute left-1/2 -translate-x-1/2 flex items-center space-x-2 text-primary hover:text-primary/90 transition-colors no-underline md:hidden"
        >
          <Navlogo className="h-6 w-auto text-foreground" />
        </Link>

        {/* Mobile: Search icon on the right */}
        <div className="md:hidden">
          <Button variant="ghost" size="icon" asChild>
            <Link
              to="/s"
              search={{
                query: "",
                closeToGoal: false,
                timePeriod: "all",
                page: 1,
                limit: 12,
                sortBy: "recent",
              }}
            >
              <Search className="h-5 w-5" />
              <span className="sr-only">Search</span>
            </Link>
          </Button>
        </div>

        {/* Desktop layout: Logo absolutely centered */}
        <div className="hidden md:flex md:items-center md:flex-1 relative">
          {/* Left navigation */}
          <nav className="flex items-center gap-6">
            <Link
              to="/s"
              search={{
                query: "",
                closeToGoal: false,
                timePeriod: "all",
                page: 1,
                limit: 12,
                sortBy: "recent",
              }}
              className="flex items-center gap-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground rounded-md px-3 py-2 transition-colors no-underline"
            >
              <Search className="h-4 w-4" />
              Search
            </Link>
            {leftNavItems.map(renderNavItem)}
          </nav>

          {/* Logo - absolutely centered */}
          <Link
            to="/"
            className="absolute left-1/2 -translate-x-1/2 flex items-center space-x-2 text-primary hover:text-primary/90 transition-colors no-underline"
          >
            <Navlogo className="h-8 w-auto text-foreground" />
          </Link>

          {/* Right side: Right nav + Auth buttons */}
          <div className="flex items-center gap-6 ml-auto">
            {/* Right navigation */}
            {rightNavItems.length > 0 && (
              <nav className="flex items-center gap-6">{rightNavItems.map(renderNavItem)}</nav>
            )}

            {/* Auth buttons */}
            <div className="flex items-center gap-3">
              {isLoading ? (
                <>
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-8 w-32" />
                </>
              ) : session && orgId ? (
                <>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full hover:bg-accent/30 border border-transparent hover:border-border transition-all"
                      >
                        <Avatar className="h-6 w-6">
                          <AvatarImage
                            className="h-6 w-6"
                            src={user?.image || undefined}
                            alt={user?.name || "User"}
                          />
                          <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                            {fallbackText}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 text-left hidden sm:block">
                          <p className="text-sm font-medium">{user?.name || "User"}</p>
                        </div>
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="w-[260px] p-4 rounded-3xl shadow-[0_6px_30px_rgba(0,0,0,0.1)] border-none"
                    >
                      {orgId && (
                        <>
                          <DropdownMenuItem
                            asChild
                            className="rounded-xl px-4 py-3 cursor-pointer focus:bg-accent/50"
                          >
                            <Link
                              to={`/o/$orgId/account`}
                              params={{
                                orgId,
                              }}
                              className="w-full font-medium text-base"
                            >
                              Profile
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            asChild
                            className="rounded-xl px-4 py-3 cursor-pointer focus:bg-accent/50"
                          >
                            <Link
                              to={`/o/$orgId/campaigns`}
                              params={{
                                orgId,
                              }}
                              search={{
                                search: "",
                                sortBy: "created",
                                sortOrder: "desc",
                                page: 1,
                                limit: 10,
                              }}
                              className="w-full font-medium text-base"
                            >
                              Your fundraisers
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            asChild
                            className="rounded-xl px-4 py-3 cursor-pointer focus:bg-accent/50"
                          >
                            <Link
                              to={`/o/$orgId/donations`}
                              params={{
                                orgId,
                              }}
                              search={{
                                search: "",
                                page: 1,
                                limit: 50,
                                sortBy: "createdAt",
                                sortOrder: "desc",
                              }}
                              className="w-full font-medium text-base"
                            >
                              Your impact
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            asChild
                            className="rounded-xl px-4 py-3 cursor-pointer focus:bg-accent/50"
                          >
                            <Link
                              to={`/o/$orgId/account`}
                              params={{
                                orgId,
                              }}
                              className="w-full font-medium text-base"
                            >
                              Account settings
                            </Link>
                          </DropdownMenuItem>
                        </>
                      )}
                      <DropdownMenuItem
                        asChild
                        className="rounded-xl px-4 py-3 cursor-pointer focus:bg-accent/50"
                      >
                        <button
                          type="button"
                          className="w-full text-left font-medium text-base"
                          onClick={async () => {
                            await authClient.signOut();
                            navigate({ to: "/" });
                          }}
                        >
                          Sign out
                        </button>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  {/* <Button asChild size="sm">
                    <Link to="/login" search={{ next: "/app" }}>
                      Start fundraider
                    </Link>
                  </Button> */}
                </>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate({ to: "/login", search: { next: "/app" } })}
                  >
                    Sign In
                  </Button>
                  {/* <Button asChild size="sm">
                    <Link to="/login" search={{ next: "/app" }}>
                      Start fundraider
                    </Link>
                  </Button> */}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
