interface WelcomeHeaderProps {
  userName?: string | null;
}

export function WelcomeHeader({ userName }: WelcomeHeaderProps) {
  const displayName = userName ? userName.split(" ")[0] : "there";

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight">Welcome back, {displayName}! 👋</h1>
      <p className="text-muted-foreground mt-2">
        Here's your fundraising dashboard. Track your progress and celebrate your impact.
      </p>
    </div>
  );
}
