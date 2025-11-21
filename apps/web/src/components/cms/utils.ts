import type { Media } from "@repo/types/payload";

// Helper to get background color class
export function getBgColorClass(
  color: "white" | "gray-light" | "green-light" | "primary" | null | undefined,
) {
  switch (color) {
    case "gray-light":
      return "bg-muted";
    case "green-light":
      return "bg-green-50 dark:bg-green-950";
    case "primary":
      return "bg-primary text-primary-foreground";
    default:
      return "bg-background";
  }
}

// Helper to get image URL with CMS base
export function getImageUrl(
  image: Media | number | string | null | undefined,
  cmsBaseUrl: string,
): string | null {
  if (!image) return null;
  if (typeof image === "number") return null;
  if (typeof image === "string") return image;
  const url = image.url;
  if (!url) return null;
  return url.startsWith("http") ? url : `${cmsBaseUrl}${url}`;
}

// Helper to extract video embed
export function getVideoEmbed(url: string | null | undefined) {
  if (!url) return null;

  // YouTube
  const youtubeMatch = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
  );
  if (youtubeMatch) {
    return {
      type: "youtube" as const,
      embedUrl: `https://www.youtube.com/embed/${youtubeMatch[1]}`,
    };
  }

  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeoMatch) {
    return {
      type: "vimeo" as const,
      embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}`,
    };
  }

  return null;
}
