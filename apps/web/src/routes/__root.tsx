/// <reference types="vite/client" />

import type { SelectMember, SelectOrganization, SelectUser } from "@repo/core/database/types";
import type { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { createRootRouteWithContext, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import type * as React from "react";
import { Toaster } from "sonner";
import { DefaultCatchBoundary } from "@/components/default-catch-boundary";
import { NotFound } from "@/components/not-found";
import { ThemeProvider } from "@/components/theme";
import { logger } from "@/lib/logger";
import appCss from "@/styles.css?url";
import { seo } from "@/utils/seo";

const rootLogger = logger.child("root");

interface RouterContext {
  queryClient: QueryClient;
  organization?: (SelectOrganization & { members?: SelectMember[] }) | null;
  user?: SelectUser | null;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      ...seo({
        title: "OnlyDonations",
        description: "We are building a reliable platform to help Africans donate to worthy causes",
        image: "https://assets.onlydonations.com/thumbnail.jpg",
      }),
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      {
        rel: "apple-touch-icon",
        sizes: "180x180",
        href: "/apple-touch-icon.png",
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "32x32",
        href: "/favicon-32x32.png",
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "16x16",
        href: "/favicon-16x16.png",
      },
      { rel: "manifest", href: "/site.webmanifest", color: "#fffff" },
      { rel: "icon", href: "/favicon.ico" },
    ],
  }),
  errorComponent: (props) => {
    rootLogger.error("Root error boundary caught error", props.error);
    return (
      <RootDocument>
        <DefaultCatchBoundary {...props} />
      </RootDocument>
    );
  },
  notFoundComponent: () => <NotFound />,
  component: RootComponent,
});

function RootComponent() {
  return (
    <RootDocument>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange={false}
      >
        <Outlet />
      </ThemeProvider>
    </RootDocument>
  );
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
        {/* Prevent theme flash by applying theme before React hydrates */}
        <script
          // biome-ignore lint/security/noDangerouslySetInnerHtml: Safe hardcoded script to prevent theme flash on page load
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var storageKey = 'ui-theme';
                  var defaultTheme = 'system';
                  var theme = localStorage.getItem(storageKey) || defaultTheme;
                  var systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                  var resolvedTheme = theme === 'system' ? systemTheme : theme;
                  
                  if (resolvedTheme === 'dark') {
                    document.documentElement.classList.add('dark');
                    document.documentElement.classList.remove('light');
                  } else {
                    document.documentElement.classList.add('light');
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body>
        {children}
        <TanStackRouterDevtools position="bottom-right" />
        <ReactQueryDevtools buttonPosition="bottom-left" />
        <Scripts />
        <Toaster />
      </body>
    </html>
  );
}
