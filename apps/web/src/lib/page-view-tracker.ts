import { useLocation, useParams } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { getOp } from "./openpanel";

function normalizePath(pathname: string, params: Record<string, string | undefined>): string {
  let normalized = pathname;
  for (const value of Object.values(params)) {
    if (value) {
      normalized = normalized.replace(value, "?");
    }
  }
  return normalized;
}

export function usePageViewTracker() {
  const location = useLocation();
  const params = useParams({ strict: false });
  const lastTrackedPath = useRef<string | null>(null);

  useEffect(() => {
    const op = getOp();
    if (!op) return;

    const normalizedPath = normalizePath(location.pathname, params);

    if (normalizedPath !== lastTrackedPath.current) {
      lastTrackedPath.current = normalizedPath;
      op.track("screen_view", { __path: normalizedPath });
    }
  }, [location.pathname, params]);
}
