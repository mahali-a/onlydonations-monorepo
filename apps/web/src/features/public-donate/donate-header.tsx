import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { ChevronDown, ChevronLeft } from "lucide-react";
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
import { authClient, useAnonymousAuth } from "@/lib/auth-client";

type DonateHeaderProps = {
  campaignSlug: string;
};

export function DonateHeader({ campaignSlug }: DonateHeaderProps) {
  const navigate = useNavigate();

  // Auto-create anonymous session for donation tracking
  const { session, isPending: isSessionPending } = useAnonymousAuth();

  const { data: orgId, error: orgError } = useQuery({
    queryFn: () => authClient.organization.list(),
    queryKey: ["user-organization", session?.user.id],
    enabled: !!session?.user?.id,
    select: ({ data }) => data?.[0]?.id || null,
  });

  const isLoading = isSessionPending && !orgError;
  const user = session?.user;
  const fallbackText = user?.name
    ? user.name.charAt(0).toUpperCase()
    : user?.email?.charAt(0).toUpperCase() || "U";

  return (
    <header className="sticky top-0 z-10 bg-white px-4 py-3 shadow-none">
      <div className="mx-auto flex max-w-5xl items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            to="/f/$slug"
            params={{ slug: campaignSlug }}
            className="flex items-center gap-1 text-sm font-medium text-[#333] hover:underline"
          >
            <ChevronLeft className="h-5 w-5" />
            <span className="hidden sm:inline">Return to Fundraiser</span>
          </Link>
        </div>
        <div className="absolute left-1/2 -translate-x-1/2">
          <Link
            to="/"
            className="flex items-center gap-2 text-primary hover:text-primary/90 transition-colors"
          >
            <Navlogo className="h-8 w-auto text-foreground" />
          </Link>
        </div>
        <div className="flex items-center gap-2">
          {isLoading ? (
            <>
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-32" />
            </>
          ) : session && orgId ? (
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
                    onClick={() => authClient.signOut()}
                  >
                    Sign out
                  </button>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate({ to: "/login", search: { next: "/app" } })}
            >
              Sign In
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
