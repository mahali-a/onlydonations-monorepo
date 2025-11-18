import { cn } from "@/lib/utils";
import { convertLexicalToHTML, defaultHTMLConverters } from "@payloadcms/richtext-lexical/html";

// Lexical editor state type from Payload CMS
export interface LexicalContent {
  root: {
    type: string;
    children: {
      type: unknown;
      version: number;
      [k: string]: unknown;
    }[];
    direction: ("ltr" | "rtl") | null;
    format: "left" | "start" | "center" | "right" | "end" | "justify" | "";
    indent: number;
    version: number;
  };
  [k: string]: unknown;
}

interface RichTextProps {
  content: LexicalContent | null | undefined;
  className?: string;
}

/**
 * Renders Payload CMS Lexical rich text content with Tailwind Typography styling.
 *
 * Uses Payload's official Lexical to HTML converter for accurate rendering.
 *
 * @example
 * ```tsx
 * <RichText content={block.content} className="mt-8" />
 * ```
 */
export function RichText({ content, className }: RichTextProps) {
  if (!content) {
    return null;
  }

  // Cast to the expected type - Payload's types are compatible
  const html = convertLexicalToHTML({
    data: content as Parameters<typeof convertLexicalToHTML>[0]["data"],
    converters: defaultHTMLConverters,
  });

  return <div className={cn("typography", className)} dangerouslySetInnerHTML={{ __html: html }} />;
}
