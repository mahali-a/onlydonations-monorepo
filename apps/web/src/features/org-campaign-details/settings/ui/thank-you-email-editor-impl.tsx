import { type Editor, EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { BoldIcon, ItalicIcon, LinkIcon } from "lucide-react";
import { type FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { getUrlFromString } from "@/lib/tiptap-utils";
import { cn } from "@/lib/utils";

const LinkButton = ({ editor }: { editor: Editor }) => {
  const [link, setLink] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open) {
      setLink(editor?.getAttributes("link").href ?? "");
    }
  }, [open, editor]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const url = getUrlFromString(link);
    if (url) {
      editor?.chain().focus().setLink({ href: url }).run();
      setOpen(false);
      setLink("");
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger disabled={!editor?.can().chain().setLink({ href: "" }).run()} asChild>
            <Button
              variant="ghost"
              size="icon"
              className={cn("h-8 w-8", editor?.isActive("link") && "bg-accent")}
            >
              <LinkIcon className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent>Link</TooltipContent>
      </Tooltip>

      <PopoverContent className="w-80 p-4" onCloseAutoFocus={(e) => e.preventDefault()}>
        <form onSubmit={handleSubmit}>
          <div className="space-y-3">
            <div>
              <label htmlFor="link-input" className="text-sm font-medium">
                Link
              </label>
              <p className="text-xs text-muted-foreground mt-0.5">
                Attach a link to the selected text
              </p>
            </div>
            <Input
              id="link-input"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="https://example.com"
            />
            <div className="flex items-center justify-end gap-2">
              {editor?.getAttributes("link").href && (
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    editor?.chain().focus().unsetLink().run();
                    setLink("");
                    setOpen(false);
                  }}
                >
                  Remove
                </Button>
              )}
              <Button size="sm" type="submit">
                {editor?.getAttributes("link").href ? "Update" : "Add"}
              </Button>
            </div>
          </div>
        </form>
      </PopoverContent>
    </Popover>
  );
};

type ThankYouEmailEditorImplProps = {
  initialContent?: string;
  onContentChange?: (html: string) => void;
  minHeight?: string;
};

export function ThankYouEmailEditorImpl({
  initialContent = "<p>Thank you for your generous donation! Your support means the world to us.</p>",
  onContentChange,
  minHeight = "150px",
}: ThankYouEmailEditorImplProps) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: initialContent,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onContentChange?.(editor.getHTML());
    },
  });

  if (!editor) {
    return null;
  }

  return (
    <div className="border border-border rounded-lg">
      <div className="flex items-center gap-1 border-b border-border p-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              className={cn("h-8 w-8", editor.isActive("bold") && "bg-accent")}
              onClick={() => editor.chain().focus().toggleBold().run()}
            >
              <BoldIcon className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Bold</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              className={cn("h-8 w-8", editor.isActive("italic") && "bg-accent")}
              onClick={() => editor.chain().focus().toggleItalic().run()}
            >
              <ItalicIcon className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Italic</TooltipContent>
        </Tooltip>

        <LinkButton editor={editor} />
      </div>
      <div
        role="button"
        tabIndex={0}
        className="min-h-[150px] p-3 ProseMirror"
        style={{ minHeight }}
        onClick={() => editor.chain().focus().run()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            editor.chain().focus().run();
          }
        }}
      >
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
