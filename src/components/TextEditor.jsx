import React, { useState, useEffect, useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { common, createLowlight } from "lowlight";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  Code,
  Link as LinkIcon,
  Image as ImageIcon,
  Undo,
  Redo,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Highlighter,
  Code2,
  Strikethrough,
  RemoveFormatting,
  ChevronDown,
  Check,
  X,
  Minus,
  Type,
  Pilcrow,
  Upload,
  ExternalLink,
  MoreHorizontal,
  Maximize2,
} from "lucide-react";

const lowlight = createLowlight(common);

const TextEditor = ({
  value,
  onChange,
  placeholder = "Start writing your blog post...",
  minHeight = "400px",
  maxHeight,
  showWordCount = true,
  disabled = false,
}) => {
  const [linkUrl, setLinkUrl] = useState("");
  const [linkOpen, setLinkOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [imageAlt, setImageAlt] = useState("");
  const [imageOpen, setImageOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [headingDropdownOpen, setHeadingDropdownOpen] = useState(false);
  const [alignDropdownOpen, setAlignDropdownOpen] = useState(false);
  const [moreDropdownOpen, setMoreDropdownOpen] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class:
            "text-blue-600 underline decoration-blue-600/30 underline-offset-2 hover:decoration-blue-600 cursor-pointer transition-colors",
          rel: "noopener noreferrer",
        },
      }),
      Image.configure({
        allowBase64: true,
        HTMLAttributes: {
          class: "rounded-lg max-w-full h-auto mx-auto my-4 shadow-md",
        },
      }),
      Placeholder.configure({
        placeholder,
        emptyEditorClass: "is-editor-empty",
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Highlight.configure({
        multicolor: false,
        HTMLAttributes: {
          class: "bg-yellow-200 px-1 rounded-sm",
        },
      }),
      CodeBlockLowlight.configure({
        lowlight,
        HTMLAttributes: {
          class:
            "bg-gray-100 text-gray-800 rounded-lg p-4 font-mono text-sm overflow-x-auto my-4 border border-gray-200",
        },
      }),
    ],
    content: value,
    editable: !disabled,
    editorProps: {
      attributes: {
        class: `prose prose-gray max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-gray-900 prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-p:leading-7 prose-p:text-gray-700 prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-code:bg-gray-100 prose-code:text-gray-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-pre:bg-transparent prose-pre:p-0 prose-img:rounded-lg prose-img:mx-auto prose-blockquote:border-l-4 prose-blockquote:border-blue-500/50 prose-blockquote:bg-gray-50 prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:rounded-r-lg prose-blockquote:text-gray-600 focus:outline-none px-4 sm:px-6 py-4`,
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".dropdown-container")) {
        setHeadingDropdownOpen(false);
        setAlignDropdownOpen(false);
        setMoreDropdownOpen(false);
        setLinkOpen(false);
        setImageOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAddLink = useCallback(() => {
    if (linkUrl && editor) {
      const url = linkUrl.startsWith("http") ? linkUrl : `https://${linkUrl}`;
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: url })
        .run();
      setLinkUrl("");
      setLinkOpen(false);
    }
  }, [editor, linkUrl]);

  const handleRemoveLink = useCallback(() => {
    editor?.chain().focus().unsetLink().run();
    setLinkOpen(false);
  }, [editor]);

  const handleAddImage = useCallback(() => {
    if (imageUrl && editor) {
      editor
        .chain()
        .focus()
        .setImage({
          src: imageUrl,
          alt: imageAlt || "Image",
        })
        .run();
      setImageUrl("");
      setImageAlt("");
      setImageOpen(false);
    }
  }, [editor, imageUrl, imageAlt]);

  useEffect(() => {
    if (editor?.isActive("link")) {
      const href = editor.getAttributes("link").href;
      setLinkUrl(href || "");
    }
  }, [editor?.isActive("link")]);

  if (!editor) {
    return (
      <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
        <div className="h-12 bg-gray-50 border-b border-gray-200 animate-pulse" />
        <div style={{ minHeight }} className="bg-white animate-pulse" />
      </div>
    );
  }

  const ToolbarButton = ({
    onClick,
    isActive = false,
    disabled = false,
    icon,
    title,
  }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`inline-flex items-center justify-center rounded-md text-sm font-medium transition-all duration-200 h-8 w-8 p-0 text-gray-600 hover:bg-gray-100 hover:text-gray-900 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500/30 disabled:pointer-events-none disabled:opacity-50 ${
        isActive ? "bg-gray-100 text-gray-900 shadow-sm" : ""
      }`}
    >
      {icon}
    </button>
  );

  const Separator = () => <div className="w-px h-6 bg-gray-200 mx-1" />;

  return (
    <>
      <div
        className={`border border-gray-200 rounded-lg overflow-hidden bg-white transition-all duration-300 ${
          isFullscreen ? "fixed inset-4 z-50 flex flex-col shadow-2xl" : ""
        } ${disabled ? "opacity-60 pointer-events-none" : ""}`}
      >
        {/* Toolbar */}
        <div className="sticky top-0 z-20 bg-gray-50 border-b border-gray-200">
          <div className="flex flex-wrap items-center gap-0.5 p-1.5 sm:p-2">
            {/* Text Formatting */}
            <div className="flex items-center gap-0.5">
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleBold().run()}
                isActive={editor.isActive("bold")}
                icon={<Bold className="h-4 w-4" />}
                title="Bold (⌘B)"
              />
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleItalic().run()}
                isActive={editor.isActive("italic")}
                icon={<Italic className="h-4 w-4" />}
                title="Italic (⌘I)"
              />
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                isActive={editor.isActive("underline")}
                icon={<UnderlineIcon className="h-4 w-4" />}
                title="Underline (⌘U)"
              />
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleStrike().run()}
                isActive={editor.isActive("strike")}
                icon={<Strikethrough className="h-4 w-4" />}
                title="Strikethrough"
              />
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleHighlight().run()}
                isActive={editor.isActive("highlight")}
                icon={<Highlighter className="h-4 w-4" />}
                title="Highlight"
              />
            </div>

            <Separator />

            {/* Headings Dropdown */}
            <div className="relative dropdown-container">
              <button
                onClick={() => setHeadingDropdownOpen(!headingDropdownOpen)}
                className="inline-flex items-center justify-center gap-1 rounded-md px-2 h-8 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
              >
                {editor.isActive("heading", { level: 1 }) && (
                  <Heading1 className="h-4 w-4" />
                )}
                {editor.isActive("heading", { level: 2 }) && (
                  <Heading2 className="h-4 w-4" />
                )}
                {editor.isActive("heading", { level: 3 }) && (
                  <Heading3 className="h-4 w-4" />
                )}
                {!editor.isActive("heading") && <Type className="h-4 w-4" />}
                <ChevronDown className="h-3 w-3" />
              </button>
              {headingDropdownOpen && (
                <div className="absolute top-full left-0 mt-1 z-50 min-w-[12rem] overflow-hidden rounded-md border border-gray-200 bg-white shadow-lg p-1">
                  <button
                    onClick={() => {
                      editor.chain().focus().setParagraph().run();
                      setHeadingDropdownOpen(false);
                    }}
                    className="flex w-full items-center px-2 py-1.5 text-sm rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <Pilcrow className="h-4 w-4 mr-2" />
                    <span>Paragraph</span>
                    {editor.isActive("paragraph") &&
                      !editor.isActive("heading") && (
                        <Check className="h-4 w-4 ml-auto text-blue-600" />
                      )}
                  </button>
                  <div className="h-px my-1 bg-gray-200" />
                  <button
                    onClick={() => {
                      editor.chain().focus().toggleHeading({ level: 1 }).run();
                      setHeadingDropdownOpen(false);
                    }}
                    className="flex w-full items-center px-2 py-1.5 text-sm rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <Heading1 className="h-4 w-4 mr-2" />
                    <span className="text-lg font-bold">Heading 1</span>
                    {editor.isActive("heading", { level: 1 }) && (
                      <Check className="h-4 w-4 ml-auto text-blue-600" />
                    )}
                  </button>
                  <button
                    onClick={() => {
                      editor.chain().focus().toggleHeading({ level: 2 }).run();
                      setHeadingDropdownOpen(false);
                    }}
                    className="flex w-full items-center px-2 py-1.5 text-sm rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <Heading2 className="h-4 w-4 mr-2" />
                    <span className="text-base font-bold">Heading 2</span>
                    {editor.isActive("heading", { level: 2 }) && (
                      <Check className="h-4 w-4 ml-auto text-blue-600" />
                    )}
                  </button>
                  <button
                    onClick={() => {
                      editor.chain().focus().toggleHeading({ level: 3 }).run();
                      setHeadingDropdownOpen(false);
                    }}
                    className="flex w-full items-center px-2 py-1.5 text-sm rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <Heading3 className="h-4 w-4 mr-2" />
                    <span className="text-sm font-bold">Heading 3</span>
                    {editor.isActive("heading", { level: 3 }) && (
                      <Check className="h-4 w-4 ml-auto text-blue-600" />
                    )}
                  </button>
                </div>
              )}
            </div>

            <Separator />

            {/* Lists */}
            <div className="flex items-center gap-0.5">
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                isActive={editor.isActive("bulletList")}
                icon={<List className="h-4 w-4" />}
                title="Bullet List"
              />
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                isActive={editor.isActive("orderedList")}
                icon={<ListOrdered className="h-4 w-4" />}
                title="Numbered List"
              />
            </div>

            <Separator />

            {/* Alignment - Desktop */}
            <div className="hidden md:flex items-center gap-0.5">
              <ToolbarButton
                onClick={() =>
                  editor.chain().focus().setTextAlign("left").run()
                }
                isActive={editor.isActive({ textAlign: "left" })}
                icon={<AlignLeft className="h-4 w-4" />}
                title="Align Left"
              />
              <ToolbarButton
                onClick={() =>
                  editor.chain().focus().setTextAlign("center").run()
                }
                isActive={editor.isActive({ textAlign: "center" })}
                icon={<AlignCenter className="h-4 w-4" />}
                title="Align Center"
              />
              <ToolbarButton
                onClick={() =>
                  editor.chain().focus().setTextAlign("right").run()
                }
                isActive={editor.isActive({ textAlign: "right" })}
                icon={<AlignRight className="h-4 w-4" />}
                title="Align Right"
              />
              <ToolbarButton
                onClick={() =>
                  editor.chain().focus().setTextAlign("justify").run()
                }
                isActive={editor.isActive({ textAlign: "justify" })}
                icon={<AlignJustify className="h-4 w-4" />}
                title="Justify"
              />
            </div>

            {/* Alignment Dropdown - Mobile */}
            <div className="relative dropdown-container md:hidden">
              <button
                onClick={() => setAlignDropdownOpen(!alignDropdownOpen)}
                className="inline-flex items-center justify-center rounded-md h-8 w-8 text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
              >
                {editor.isActive({ textAlign: "center" }) ? (
                  <AlignCenter className="h-4 w-4" />
                ) : editor.isActive({ textAlign: "right" }) ? (
                  <AlignRight className="h-4 w-4" />
                ) : editor.isActive({ textAlign: "justify" }) ? (
                  <AlignJustify className="h-4 w-4" />
                ) : (
                  <AlignLeft className="h-4 w-4" />
                )}
              </button>
              {alignDropdownOpen && (
                <div className="absolute top-full left-0 mt-1 z-50 min-w-[8rem] overflow-hidden rounded-md border border-gray-200 bg-white shadow-lg p-1">
                  <button
                    onClick={() => {
                      editor.chain().focus().setTextAlign("left").run();
                      setAlignDropdownOpen(false);
                    }}
                    className="flex w-full items-center px-2 py-1.5 text-sm rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <AlignLeft className="h-4 w-4 mr-2" /> Left
                  </button>
                  <button
                    onClick={() => {
                      editor.chain().focus().setTextAlign("center").run();
                      setAlignDropdownOpen(false);
                    }}
                    className="flex w-full items-center px-2 py-1.5 text-sm rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <AlignCenter className="h-4 w-4 mr-2" /> Center
                  </button>
                  <button
                    onClick={() => {
                      editor.chain().focus().setTextAlign("right").run();
                      setAlignDropdownOpen(false);
                    }}
                    className="flex w-full items-center px-2 py-1.5 text-sm rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <AlignRight className="h-4 w-4 mr-2" /> Right
                  </button>
                  <button
                    onClick={() => {
                      editor.chain().focus().setTextAlign("justify").run();
                      setAlignDropdownOpen(false);
                    }}
                    className="flex w-full items-center px-2 py-1.5 text-sm rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <AlignJustify className="h-4 w-4 mr-2" /> Justify
                  </button>
                </div>
              )}
            </div>

            <Separator />

            {/* Insert Elements */}
            <div className="flex items-center gap-0.5">
              {/* Link Popover */}
              <div className="relative dropdown-container">
                <button
                  onClick={() => setLinkOpen(!linkOpen)}
                  className={`inline-flex items-center justify-center rounded-md h-8 w-8 transition-all duration-200 text-gray-600 hover:bg-gray-100 hover:text-gray-900 active:scale-95 ${
                    editor.isActive("link") ? "bg-gray-100 text-gray-900" : ""
                  }`}
                >
                  <LinkIcon className="h-4 w-4" />
                </button>
                {linkOpen && (
                  <div className="absolute top-full left-0 mt-1 z-50 w-80 rounded-lg border border-gray-200 bg-white shadow-xl p-4">
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-gray-700">
                          Link URL
                        </label>
                        <input
                          placeholder="https://example.com"
                          value={linkUrl}
                          onChange={(e) => setLinkUrl(e.target.value)}
                          onKeyDown={(e) =>
                            e.key === "Enter" && handleAddLink()
                          }
                          autoFocus
                          className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all bg-white"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={handleAddLink}
                          className="flex-1 inline-flex items-center justify-center px-3 py-1.5 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 rounded-md transition-all duration-200"
                        >
                          <Check className="h-4 w-4 mr-1" />
                          {editor.isActive("link") ? "Update" : "Add Link"}
                        </button>
                        {editor.isActive("link") && (
                          <button
                            onClick={handleRemoveLink}
                            className="inline-flex items-center justify-center px-3 py-1.5 text-sm font-medium border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 rounded-md transition-all duration-200"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                      {editor.isActive("link") && (
                        <button
                          onClick={() => window.open(linkUrl, "_blank")}
                          className="w-full inline-flex items-center justify-center px-3 py-1.5 text-sm font-medium bg-transparent text-gray-700 hover:bg-gray-100 rounded-md transition-all duration-200"
                        >
                          <ExternalLink className="h-4 w-4 mr-1" />
                          Open Link
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Image Popover */}
              <div className="relative dropdown-container">
                <button
                  onClick={() => setImageOpen(!imageOpen)}
                  className="inline-flex items-center justify-center rounded-md h-8 w-8 text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all duration-200 active:scale-95"
                >
                  <ImageIcon className="h-4 w-4" />
                </button>
                {imageOpen && (
                  <div className="absolute top-full left-0 mt-1 z-50 w-80 rounded-lg border border-gray-200 bg-white shadow-xl p-4">
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-gray-700">
                          Image URL
                        </label>
                        <input
                          placeholder="https://example.com/image.jpg"
                          value={imageUrl}
                          onChange={(e) => setImageUrl(e.target.value)}
                          autoFocus
                          className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all bg-white"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-gray-700">
                          Alt Text (optional)
                        </label>
                        <input
                          placeholder="Image description"
                          value={imageAlt}
                          onChange={(e) => setImageAlt(e.target.value)}
                          onKeyDown={(e) =>
                            e.key === "Enter" && handleAddImage()
                          }
                          className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all bg-white"
                        />
                      </div>
                      <button
                        onClick={handleAddImage}
                        className="w-full inline-flex items-center justify-center px-3 py-1.5 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 rounded-md transition-all duration-200"
                      >
                        <Upload className="h-4 w-4 mr-1" />
                        Insert Image
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <ToolbarButton
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                isActive={editor.isActive("blockquote")}
                icon={<Quote className="h-4 w-4" />}
                title="Blockquote"
              />
              <ToolbarButton
                onClick={() => editor.chain().focus().setHorizontalRule().run()}
                icon={<Minus className="h-4 w-4" />}
                title="Horizontal Rule"
              />
            </div>

            <Separator />

            {/* Code */}
            <div className="flex items-center gap-0.5">
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleCode().run()}
                isActive={editor.isActive("code")}
                icon={<Code className="h-4 w-4" />}
                title="Inline Code"
              />
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                isActive={editor.isActive("codeBlock")}
                icon={<Code2 className="h-4 w-4" />}
                title="Code Block"
              />
            </div>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Undo/Redo */}
            <div className="flex items-center gap-0.5">
              <ToolbarButton
                onClick={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().undo()}
                icon={<Undo className="h-4 w-4" />}
                title="Undo (⌘Z)"
              />
              <ToolbarButton
                onClick={() => editor.chain().focus().redo().run()}
                disabled={!editor.can().redo()}
                icon={<Redo className="h-4 w-4" />}
                title="Redo (⌘⇧Z)"
              />
            </div>

            <Separator />

            {/* More Options - Desktop */}
            <div className="hidden sm:flex items-center gap-0.5">
              <ToolbarButton
                onClick={() =>
                  editor.chain().focus().clearNodes().unsetAllMarks().run()
                }
                icon={<RemoveFormatting className="h-4 w-4" />}
                title="Clear Formatting"
              />
              <ToolbarButton
                onClick={() => setIsFullscreen(!isFullscreen)}
                isActive={isFullscreen}
                icon={<Maximize2 className="h-4 w-4" />}
                title="Fullscreen"
              />
            </div>

            {/* Mobile More Menu */}
            <div className="relative dropdown-container sm:hidden">
              <button
                onClick={() => setMoreDropdownOpen(!moreDropdownOpen)}
                className="inline-flex items-center justify-center rounded-md h-8 w-8 text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
              {moreDropdownOpen && (
                <div className="absolute top-full right-0 mt-1 z-50 min-w-[10rem] overflow-hidden rounded-md border border-gray-200 bg-white shadow-lg p-1">
                  <button
                    onClick={() => {
                      editor.chain().focus().clearNodes().unsetAllMarks().run();
                      setMoreDropdownOpen(false);
                    }}
                    className="flex w-full items-center px-2 py-1.5 text-sm rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <RemoveFormatting className="h-4 w-4 mr-2" /> Clear
                    Formatting
                  </button>
                  <button
                    onClick={() => {
                      setIsFullscreen(!isFullscreen);
                      setMoreDropdownOpen(false);
                    }}
                    className="flex w-full items-center px-2 py-1.5 text-sm rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <Maximize2 className="h-4 w-4 mr-2" />
                    {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Editor Content */}
        <div
          className={`overflow-y-auto bg-white transition-all duration-300 ${
            isFullscreen ? "flex-1" : ""
          }`}
          style={{
            minHeight: isFullscreen ? undefined : minHeight,
            maxHeight: isFullscreen ? undefined : maxHeight,
          }}
        >
          <EditorContent editor={editor} />
        </div>

        {/* Footer with Word Count */}
        {showWordCount && (
          <div className="flex items-center justify-between px-4 py-2 border-t border-gray-200 bg-gray-50 text-xs text-gray-500">
            <div className="flex items-center gap-2">
              {editor.isActive("heading") && (
                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs">
                  Heading
                </span>
              )}
              {editor.isActive("bulletList") && (
                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs">
                  List
                </span>
              )}
              {editor.isActive("codeBlock") && (
                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs">
                  Code
                </span>
              )}
            </div>
            <div className="text-gray-600">
              Words: {editor.storage.characterCount?.words?.() || 0} |
              Characters: {editor.storage.characterCount?.characters?.() || 0}
            </div>
          </div>
        )}
      </div>

      {/* Fullscreen Overlay */}
      {isFullscreen && (
        <div
          className="fixed inset-0 bg-gray-900/20 backdrop-blur-sm z-40"
          onClick={() => setIsFullscreen(false)}
        />
      )}
    </>
  );
};

export default TextEditor;
