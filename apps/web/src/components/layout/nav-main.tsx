import { useNavigate } from "@tanstack/react-router";
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

  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const url = item.path ? `/o/${orgId}/${item.path}` : `/o/${orgId}`;
            const handleClick = () => navigate({ to: url });

            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton tooltip={item.title} onClick={handleClick}>
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
