import { Link, useLocation } from "@tanstack/react-router";
import type { ComponentType } from "react";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

type NavItem = {
  title: string;
  path: string;
  icon?: ComponentType<{ className?: string }>;
};

export function NavMain({ items, orgId }: { items: NavItem[]; orgId?: string }) {
  const location = useLocation();

  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const url = item.path ? `/o/${orgId}/${item.path}` : `/o/${orgId}`;
            const isActive = item.path
              ? location.pathname.startsWith(url)
              : location.pathname === url;

            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton tooltip={item.title} isActive={isActive} asChild>
                  <Link to={url} preload="intent">
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
