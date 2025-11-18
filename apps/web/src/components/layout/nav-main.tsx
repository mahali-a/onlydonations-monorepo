import { useLocation, useNavigate } from "@tanstack/react-router";
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
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const url = item.path ? `/o/${orgId}/${item.path}` : `/o/${orgId}`;
            const handleClick = () => navigate({ to: url });
            const isActive = item.path
              ? location.pathname.startsWith(url)
              : location.pathname === url;

            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton tooltip={item.title} onClick={handleClick} isActive={isActive}>
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
