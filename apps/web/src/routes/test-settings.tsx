import { createFileRoute } from "@tanstack/react-router";
import { PublicNavbar } from "@/components/navigation/public-navbar";

export const Route = createFileRoute("/test-settings")({
  component: TestSettings,
});

function TestSettings() {
  const { settings } = Route.useRouteContext();

  if (!settings) {
    return <div>Loading settings...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <PublicNavbar settings={settings} />
      <div className="container mx-auto p-8">
        <h1 className="text-3xl font-bold mb-6">CMS Settings Test</h1>

        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
          <h3 className="font-semibold mb-2">🎨 Navbar Layout</h3>
          <p className="text-sm text-muted-foreground">
            The navbar above uses a 3-column layout: <strong>Left Nav</strong> |{" "}
            <strong>Logo (Center)</strong> | <strong>Right Nav + Auth Buttons</strong>
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Currently showing items with{" "}
            <code className="px-1 bg-background rounded">position: "left"</code> on the left. Add
            items with <code className="px-1 bg-background rounded">position: "right"</code> in CMS
            to see them appear before the Sign In button!
          </p>
        </div>

        <div className="space-y-6">
          <section className="border rounded-lg p-4">
            <h2 className="text-xl font-semibold mb-2">Site Information</h2>
            <dl className="space-y-2">
              <div>
                <dt className="font-medium text-gray-600">Site Name:</dt>
                <dd>{settings.siteName}</dd>
              </div>
              <div>
                <dt className="font-medium text-gray-600">Description:</dt>
                <dd>{settings.siteDescription || "N/A"}</dd>
              </div>
              <div>
                <dt className="font-medium text-gray-600">Contact Email:</dt>
                <dd>{settings.contactEmail || "N/A"}</dd>
              </div>
            </dl>
          </section>

          <section className="border rounded-lg p-4">
            <h2 className="text-xl font-semibold mb-2">Fee Configuration</h2>
            <dl className="space-y-2">
              <div>
                <dt className="font-medium text-gray-600">Creation Fee:</dt>
                <dd>{settings.feeConfiguration?.creationFee || 0}</dd>
              </div>
              <div>
                <dt className="font-medium text-gray-600">Transaction Fee %:</dt>
                <dd>{settings.feeConfiguration?.transactionFeePercentage || 0}%</dd>
              </div>
              <div>
                <dt className="font-medium text-gray-600">Donor Contribution %:</dt>
                <dd>{settings.feeConfiguration?.donorContributionPercentage || 0}%</dd>
              </div>
            </dl>
          </section>

          <section className="border rounded-lg p-4">
            <h2 className="text-xl font-semibold mb-2">Navigation</h2>
            <div>
              <h3 className="font-medium text-gray-600 mb-2">Main Navigation:</h3>
              <ul className="space-y-2">
                {settings.navigation?.mainNav?.map((item) => (
                  <li key={item.id} className="pl-4">
                    <span className="font-medium">{item.label}</span>
                    {item.hasDropdown && item.dropdownItems && (
                      <ul className="pl-4 mt-1 text-sm text-gray-600">
                        {item.dropdownItems.map((dropdownItem) => (
                          <li key={dropdownItem.id}>
                            → {dropdownItem.label} ({dropdownItem.url})
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section className="border rounded-lg p-4">
            <h2 className="text-xl font-semibold mb-2">Raw Settings Object</h2>
            <pre className="bg-gray-100 p-4 rounded overflow-auto text-xs">
              {JSON.stringify(settings, null, 2)}
            </pre>
          </section>
        </div>
      </div>
    </div>
  );
}
