import type { SelectMember, SelectOrganization, SelectUser } from "@repo/core/database/types";
import type { Setting } from "@repo/types";
import * as Sentry from "@sentry/tanstackstart-react";
import type { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import {
  createRootRouteWithContext,
  HeadContent,
  Outlet,
  Scripts,
  useMatches,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import type * as React from "react";
import { useEffect } from "react";
import { Toaster } from "sonner";
import { DefaultCatchBoundary } from "@/components/default-catch-boundary";
import { NotFound } from "@/components/not-found";
import { ThemeProvider } from "@/components/theme";
import { authClient } from "@/lib/auth-client";
import { logger } from "@/lib/logger";
import { clearUserIdentity, getOpenPanel, identifyUser } from "@/lib/openpanel";
import { seo } from "@/lib/seo";
import { retrieveSettingsFromServer } from "@/server/functions/cms";
import { retrieveOpenPanelClientId } from "@/server/functions/openpanel";
import appCss from "@/styles.css?url";

const rootLogger = logger.createChildLogger("root");

type RouterContext = {
  queryClient: QueryClient;
  organization?: (SelectOrganization & { members?: SelectMember[] }) | null;
  user?: SelectUser | null;
  settings?: Setting | null;
  openPanelClientId?: string;
};

export const Route = createRootRouteWithContext<RouterContext>()({
  beforeLoad: async () => {
    const [settings, openPanelClientId] = await Promise.all([
      retrieveSettingsFromServer(),
      retrieveOpenPanelClientId(),
    ]);

    return {
      settings,
      openPanelClientId,
    };
  },
  loader: async ({ context }) => {
    return {
      settings: context.settings,
      openPanelClientId: context.openPanelClientId,
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
    Sentry.captureException(props.error);
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
  const matches = useMatches();
  const hasOrgId = matches.some((match) => "orgId" in match.params && !!match.params.orgId);
  const { openPanelClientId } = Route.useLoaderData();
  const { data: session } = authClient.useSession();

  // Initialize OpenPanel
  useEffect(() => {
    if (openPanelClientId) {
      getOpenPanel(openPanelClientId);
    }
  }, [openPanelClientId]);

  // Identify user when session changes
  useEffect(() => {
    if (session?.user && !session.user.isAnonymous) {
      identifyUser({
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        image: session.user.image,
      });
    } else if (!session) {
      clearUserIdentity();
    }
  }, [session]);

  return (
    <RootDocument>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange={false}
        forcedTheme={hasOrgId ? undefined : "light"}
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
                  
                  var pathParts = window.location.pathname.split('/');
                  var hasOrgId = pathParts.length > 2 && pathParts[1] === 'o' && pathParts[2];
                  
                  if (!hasOrgId) {
                    document.documentElement.classList.add('light');
                    document.documentElement.classList.remove('dark');
                    return;
                  }
                  
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
