import { useEffect, useState, type FormEvent } from "react";
import { TextStyleKit } from "@tiptap/extension-text-style";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import { useEditorState } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import type { AnyFieldApi } from "@tanstack/react-form";
import { Label } from "@/components/ui/label";
import { Field, FieldError } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { getUrlFromString } from "@/lib/tiptap-utils";
import {
  BoldIcon,
  ItalicIcon,
  StrikethroughIcon,
  CodeIcon,
  Heading1Icon,
  Heading2Icon,
  Heading3Icon,
  ListIcon,
  ListOrderedIcon,
  FileCodeIcon,
  QuoteIcon,
  Undo2Icon,
  Redo2Icon,
  LinkIcon,
  Trash2,
} from "lucide-react";

const LinkExtension = StarterKit.configure({
  link: {
    openOnClick: false,
  },
});

const extensions = [TextStyleKit, LinkExtension];

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
      setLink("");
      setOpen(false);
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
              <Label htmlFor="link-input" className="text-sm font-medium">
                Link
              </Label>
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
                  <Trash2 className="mr-2 h-4 w-4" />
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

function MenuBar({ editor }: { editor: Editor }) {
  const editorState = useEditorState({
    editor,
    selector: (ctx) => {
      return {
        isBold: ctx.editor.isActive("bold") ?? false,
        canBold: ctx.editor.can().chain().toggleBold().run() ?? false,
        isItalic: ctx.editor.isActive("italic") ?? false,
        canItalic: ctx.editor.can().chain().toggleItalic().run() ?? false,
        isStrike: ctx.editor.isActive("strike") ?? false,
        canStrike: ctx.editor.can().chain().toggleStrike().run() ?? false,
        isCode: ctx.editor.isActive("code") ?? false,
        canCode: ctx.editor.can().chain().toggleCode().run() ?? false,
        canClearMarks: ctx.editor.can().chain().unsetAllMarks().run() ?? false,
        isParagraph: ctx.editor.isActive("paragraph") ?? false,
        isHeading1: ctx.editor.isActive("heading", { level: 1 }) ?? false,
        isHeading2: ctx.editor.isActive("heading", { level: 2 }) ?? false,
        isHeading3: ctx.editor.isActive("heading", { level: 3 }) ?? false,
        isHeading4: ctx.editor.isActive("heading", { level: 4 }) ?? false,
        isHeading5: ctx.editor.isActive("heading", { level: 5 }) ?? false,
        isHeading6: ctx.editor.isActive("heading", { level: 6 }) ?? false,
        isBulletList: ctx.editor.isActive("bulletList") ?? false,
        isOrderedList: ctx.editor.isActive("orderedList") ?? false,
        isCodeBlock: ctx.editor.isActive("codeBlock") ?? false,
        isBlockquote: ctx.editor.isActive("blockquote") ?? false,
        canUndo: ctx.editor.can().chain().undo().run() ?? false,
        canRedo: ctx.editor.can().chain().redo().run() ?? false,
      };
    },
  });

  return (
    <div className="flex flex-wrap gap-1 p-2 border-b border-border">
      <Button
        variant="ghost"
        size="icon"
        className={cn("h-8 w-8", editorState.isBold && "bg-accent")}
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editorState.canBold}
      >
        <BoldIcon className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className={cn("h-8 w-8", editorState.isItalic && "bg-accent")}
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editorState.canItalic}
      >
        <ItalicIcon className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className={cn("h-8 w-8", editorState.isStrike && "bg-accent")}
        onClick={() => editor.chain().focus().toggleStrike().run()}
        disabled={!editorState.canStrike}
      >
        <StrikethroughIcon className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className={cn("h-8 w-8", editorState.isCode && "bg-accent")}
        onClick={() => editor.chain().focus().toggleCode().run()}
        disabled={!editorState.canCode}
      >
        <CodeIcon className="h-4 w-4" />
      </Button>

      <LinkButton editor={editor} />

      <div className="mx-1 w-px bg-border" />

      <Button
        variant="ghost"
        size="icon"
        className={cn("h-8 w-8", editorState.isHeading1 && "bg-accent")}
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
      >
        <Heading1Icon className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className={cn("h-8 w-8", editorState.isHeading2 && "bg-accent")}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        <Heading2Icon className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className={cn("h-8 w-8", editorState.isHeading3 && "bg-accent")}
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
      >
        <Heading3Icon className="h-4 w-4" />
      </Button>

      <div className="mx-1 w-px bg-border" />

      <Button
        variant="ghost"
        size="icon"
        className={cn("h-8 w-8", editorState.isBulletList && "bg-accent")}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        <ListIcon className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className={cn("h-8 w-8", editorState.isOrderedList && "bg-accent")}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <ListOrderedIcon className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className={cn("h-8 w-8", editorState.isBlockquote && "bg-accent")}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      >
        <QuoteIcon className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className={cn("h-8 w-8", editorState.isCodeBlock && "bg-accent")}
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
      >
        <FileCodeIcon className="h-4 w-4" />
      </Button>

      <div className="mx-1 w-px bg-border" />

      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editorState.canUndo}
      >
        <Undo2Icon className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editorState.canRedo}
      >
        <Redo2Icon className="h-4 w-4" />
      </Button>
    </div>
  );
}

export function CampaignStory({
  field,
  editable = true,
}: {
  field: AnyFieldApi;
  editable?: boolean;
}) {
  const editor = useEditor({
    extensions,
    content: field.state.value || "",
    immediatelyRender: false,
    editable,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      field.handleChange(html);
    },
  });

  if (!editor) {
    return null;
  }

  return (
    <div className="grid grid-cols-12 gap-4">
      <div className="col-span-full md:col-span-4">
        <div className="text-lg font-medium">Story</div>
        <p className="text-sm text-foreground">
          Add a story to your campaign. This appears directly below the title.
        </p>
      </div>

      <section className="col-span-full md:col-span-7 md:col-start-6 space-y-4">
        <Field>
          <Label htmlFor={field.name}>Campaign Story</Label>
          <div className="border border-border rounded-lg focus-within:ring-1 focus-within:ring-ring">
            <MenuBar editor={editor} />
            <div
              role="button"
              tabIndex={editable ? 0 : -1}
              className="min-h-[300px] max-h-[600px] overflow-y-auto w-full p-3"
              style={{ cursor: editable ? "text" : "default" }}
              onClick={() => editable && editor.chain().focus().run()}
              onKeyDown={(e) => {
                if (editable && (e.key === "Enter" || e.key === " ")) {
                  e.preventDefault();
                  editor.chain().focus().run();
                }
              }}
            >
              <EditorContent className="w-full min-w-full" editor={editor} />
            </div>
          </div>
          <FieldError errors={field.state.meta.errors} />
        </Field>
      </section>
    </div>
  );
}
