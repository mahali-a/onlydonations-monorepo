import { IconDotsVertical, IconLogout, IconUserCircle } from "@tabler/icons-react";
import * as React from "react";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { ThemeToggle } from "../theme/theme-toggle";

export function NavUser({
  user,
  onAccountClick,
  onLogoutClick,
}: {
  user: {
    name: string;
    email: string;
    avatar: string;
  };
  onAccountClick?: () => void;
  onLogoutClick?: () => void;
}) {
  const [isOpen, setIsOpen] = React.useState(false);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setIsOpen(!isOpen);
    }
    if (event.key === "Escape" && isOpen) {
      setIsOpen(false);
    }
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <div className="relative">
          <SidebarMenuButton
            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            size="lg"
            onClick={() => setIsOpen(!isOpen)}
            onKeyDown={handleKeyDown}
            aria-expanded={isOpen}
            aria-haspopup="true"
          >
            <img className="h-8 w-8 rounded-lg object-cover" alt={user.name} src={user.avatar} />
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">{user.name}</span>
              <span className="truncate text-muted-foreground text-xs">{user.email}</span>
            </div>
            <IconDotsVertical className="ml-auto size-4" />
          </SidebarMenuButton>
          {isOpen && (
            <>
              <button
                type="button"
                className="fixed inset-0 z-40 bg-transparent border-0 p-0"
                onClick={() => setIsOpen(false)}
                onKeyDown={(e) => e.key === "Escape" && setIsOpen(false)}
                aria-label="Close menu"
              />
              <div className="absolute bottom-full left-0 z-50 mb-1 w-56 rounded-lg bg-popover p-1 shadow-md">
                <div className="flex items-center gap-2 px-3 py-2 text-left text-sm">
                  <img
                    className="h-8 w-8 rounded-lg object-cover"
                    alt={user.name}
                    src={user.avatar}
                  />
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{user.name}</span>
                    <span className="truncate text-muted-foreground text-xs">{user.email}</span>
                  </div>
                </div>
                <div className="h-px bg-border my-1" />
                <div className="flex items-center justify-between px-3 py-2">
                  <span className="text-sm">Theme</span>
                  <ThemeToggle />
                </div>
                <div className="h-px bg-border my-1" />
                <button
                  type="button"
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                  onClick={() => {
                    onAccountClick?.();
                    setIsOpen(false);
                  }}
                >
                  <IconUserCircle className="size-4" />
                  Account
                </button>
                <div className="h-px bg-border my-1" />
                <button
                  type="button"
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                  onClick={() => {
                    onLogoutClick?.();
                    setIsOpen(false);
                  }}
                >
                  <IconLogout className="size-4" />
                  Log out
                </button>
              </div>
            </>
          )}
        </div>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
