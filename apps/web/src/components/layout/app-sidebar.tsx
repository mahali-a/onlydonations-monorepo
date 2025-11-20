import {
  IconChartBar,
  IconCreditCard,
  IconGift,
  IconHome,
  IconSettings,
  IconSpeakerphone,
} from "@tabler/icons-react";
import { Link, useParams } from "@tanstack/react-router";
import type * as React from "react";
import { WordmarkIcon } from "@/components/icons/wordmark";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { NavMain } from "./nav-main";
import { NavUser } from "./nav-user";

const navItems = [
  {
    title: "Home",
    path: "",
    icon: IconHome,
  },
  {
    title: "Campaigns",
    path: "campaigns",
    icon: IconSpeakerphone,
  },
  {
    title: "Donations",
    path: "donations",
    icon: IconGift,
  },
  {
    title: "Financial Insights",
    path: "finance",
    icon: IconChartBar,
  },
  {
    title: "Payments",
    path: "payments",
    icon: IconCreditCard,
  },
  {
    title: "Account Settings",
    path: "account",
    icon: IconSettings,
  },
];

export function AppSidebar({
  user,
  onAccountClick,
  onLogoutClick,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  user?: {
    name: string;
    email: string;
    avatar: string;
  };
  onAccountClick?: () => void;
  onLogoutClick?: () => void;
}) {
  const params = useParams({ from: "/o/$orgId" });
  const orgId = params.orgId;

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <Link to="/" className="inline-block">
              <WordmarkIcon className="ml-1 h-7 w-auto" />
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} orgId={orgId} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser
          onAccountClick={onAccountClick}
          onLogoutClick={onLogoutClick}
          user={
            user || {
              name: "User",
              email: "user@example.com",
              avatar: "/placeholder.svg",
            }
          }
        />
      </SidebarFooter>
    </Sidebar>
  );
}
