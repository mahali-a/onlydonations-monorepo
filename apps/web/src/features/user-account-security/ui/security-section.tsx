import { useForm } from "@tanstack/react-form";
import { useRouter } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { deleteSessionOnServer } from "../server";

type Session = {
  id: string;
  token: string;
  ipAddress: string | null | undefined;
  browser: string;
  os: string;
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date;
  isCurrent: boolean;
};

type SecuritySectionProps = {
  sessions: Session[];
  loginMethod: string;
};

function formatLastActive(updatedAt: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - new Date(updatedAt).getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return "a moment ago";
  if (diffMins < 60) return `${diffMins} minute${diffMins === 1 ? "" : "s"} ago`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
}

function SessionItem({ session }: { session: Session }) {
  const router = useRouter();

  const form = useForm({
    defaultValues: {
      token: session.token,
    },
    validators: {
      onSubmitAsync: async ({ value }) => {
        const formData = new FormData();
        formData.append("token", value.token);

        const result = await deleteSessionOnServer({ data: formData });

        if (result?.error) {
          return {
            form: result.error,
          };
        }

        router.invalidate();
        return null;
      },
    },
  });

  const lastActive = formatLastActive(session.updatedAt);

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-1">
        <p className="font-medium">
          {session.browser} on {session.os} · {session.ipAddress || "Unknown location"}
        </p>
        <p className="text-sm text-muted-foreground">Last active {lastActive}</p>
      </div>
      {session.isCurrent ? (
        <Badge variant="secondary">Current</Badge>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <form.Subscribe selector={(state) => [state.isSubmitting]}>
            {([isSubmitting]) => (
              <Button type="submit" variant="destructive" size="sm" disabled={isSubmitting}>
                {isSubmitting ? "Revoking..." : "Revoke"}
              </Button>
            )}
          </form.Subscribe>
        </form>
      )}
    </div>
  );
}

export function SecuritySection({ sessions, loginMethod }: SecuritySectionProps) {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-background shadow-sm">
        <div className="flex flex-col space-y-4 p-5 sm:p-10">
          <div className="space-y-3">
            <h2 className="text-xl font-semibold">Current sign-in method</h2>
            <p className="text-sm text-muted-foreground">
              Keep your login flow tight so only trusted teammates can access sensitive data.
            </p>
          </div>
          <div className="flex flex-col gap-3 rounded-lg border border-dashed border-border p-4">
            <div className="space-y-1">
              <p className="font-medium">{loginMethod}</p>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-3 rounded-b-xl border-t border-border bg-muted/40 p-4 text-sm text-muted-foreground">
          <p>You can sign in using magic links, one-time codes, or your social accounts.</p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-background shadow-sm">
        <div className="flex flex-col space-y-4 p-5 sm:p-10">
          <div className="space-y-3">
            <h2 className="text-xl font-semibold">Active sessions</h2>
            <p className="text-sm text-muted-foreground">
              Review every device signed in and revoke access instantly.
            </p>
          </div>
          <div className="flex flex-col gap-4">
            {sessions.length > 0 ? (
              sessions.map((session) => <SessionItem key={session.id} session={session} />)
            ) : (
              <div className="flex flex-col gap-2 rounded-lg border border-border p-4">
                <p className="text-sm text-muted-foreground">No active sessions found.</p>
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-3 rounded-b-xl border-t border-border bg-muted/40 p-4 text-sm text-muted-foreground">
          <p>Don't recognize a device? Revoke it immediately to keep your account secure.</p>
        </div>
      </div>
    </div>
  );
}
