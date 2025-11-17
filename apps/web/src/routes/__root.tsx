import type { SelectMember, SelectOrganization, SelectUser } from "@repo/core/database/types";
import type { Setting } from "@repo/types";
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
import { retrieveSettingsFromServer } from "@/server/functions/cms";
import appCss from "@/styles.css?url";
import { seo } from "@/utils/seo";

const rootLogger = logger.createChildLogger("root");

type RouterContext = {
  queryClient: QueryClient;
  organization?: (SelectOrganization & { members?: SelectMember[] }) | null;
  user?: SelectUser | null;
  settings?: Setting | null;
};

export const Route = createRootRouteWithContext<RouterContext>()({
  beforeLoad: async () => {
    const settings = await retrieveSettingsFromServer();
    return {
      settings,
    };
  },
  loader: async ({ context }) => {
    return {
      settings: context.settings,
    };
  },
  head: ({ loaderData }) => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        name: "apple-mobile-web-app-title",
        content: "MyWebSite",
      },
      ...seo({
        title: loaderData?.settings?.siteName ?? "",
        description: loaderData?.settings?.siteDescription ?? "",
        ...(loaderData?.settings?.meta?.image &&
        typeof loaderData.settings.meta.image !== "number" &&
        "url" in loaderData.settings.meta.image
          ? {
              image: loaderData.settings.meta.image.url ?? "",
            }
          : {}),
      }),
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      {
        rel: "icon",
        type: "image/png",
        href: "/favicon-96x96.png",
        sizes: "96x96",
      },
      {
        rel: "icon",
        type: "image/svg+xml",
        href: "/favicon.svg",
      },
      {
        rel: "shortcut icon",
        href: "/favicon.ico",
      },
      {
        rel: "apple-touch-icon",
        sizes: "180x180",
        href: "/apple-touch-icon.png",
      },
      {
        rel: "manifest",
        href: "/site.webmanifest",
      },
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
        <script
          // biome-ignore lint/security/noDangerouslySetInnerHtml: Critical theme initialization script that must run before render
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
