export function getUrlFromString(str: string): string | null {
  if (!str) return null;

  const trimmed = str.trim();

  if (trimmed.match(/^https?:\/\//)) {
    try {
      const url = new URL(trimmed);
      return url.href;
    } catch {
      return null;
    }
  }

  try {
    const url = new URL(`https://${trimmed}`);
    return url.href;
  } catch {
    return null;
  }
}
