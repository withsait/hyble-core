"use client";

import { useState, useRef, useCallback } from "react";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Link,
  Image,
  List,
  ListOrdered,
  Quote,
  Code,
  Heading1,
  Heading2,
  Heading3,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Undo,
  Redo,
  Eye,
  Save,
  Send,
  Clock,
  Tag,
  User,
  Calendar,
  Globe,
  Lock,
  Settings,
  X,
  Plus,
  ChevronDown,
  Check,
  FileText,
  Trash2,
} from "lucide-react";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage?: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  category: string;
  tags: string[];
  status: "draft" | "published" | "scheduled";
  visibility: "public" | "private" | "password";
  password?: string;
  publishedAt?: Date;
  scheduledAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  seo: {
    title: string;
    description: string;
    keywords: string[];
    ogImage?: string;
    canonical?: string;
  };
  readingTime: number;
}

interface BlogEditorProps {
  initialPost?: Partial<BlogPost>;
  categories?: string[];
  onSave?: (post: BlogPost) => void;
  onPublish?: (post: BlogPost) => void;
}

const defaultCategories = [
  "Technology",
  "Business",
  "Marketing",
  "Design",
  "Development",
  "News",
  "Tutorial",
  "Case Study",
];

export function BlogEditor({
  initialPost,
  categories = defaultCategories,
  onSave,
  onPublish,
}: BlogEditorProps) {
  const [post, setPost] = useState<Partial<BlogPost>>({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    category: "",
    tags: [],
    status: "draft",
    visibility: "public",
    seo: {
      title: "",
      description: "",
      keywords: [],
    },
    ...initialPost,
  });

  const [showPreview, setShowPreview] = useState(false);
  const [showSeoPanel, setShowSeoPanel] = useState(false);
  const [showPublishOptions, setShowPublishOptions] = useState(false);
  const [newTag, setNewTag] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [wordCount, setWordCount] = useState(0);

  const editorRef = useRef<HTMLDivElement>(null);

  // Calculate reading time
  const calculateReadingTime = (text: string) => {
    const words = text.trim().split(/\s+/).length;
    return Math.ceil(words / 200); // Average reading speed
  };

  // Update content
  const updateContent = (html: string) => {
    const text = html.replace(/<[^>]*>/g, "");
    setWordCount(text.trim().split(/\s+/).filter(Boolean).length);
    setPost((prev) => ({
      ...prev,
      content: html,
      readingTime: calculateReadingTime(text),
    }));
  };

  // Generate slug from title
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  };

  // Execute formatting command
  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  // Insert link
  const insertLink = () => {
    const url = prompt("Enter URL:");
    if (url) {
      execCommand("createLink", url);
    }
  };

  // Insert image
  const insertImage = () => {
    const url = prompt("Enter image URL:");
    if (url) {
      execCommand("insertImage", url);
    }
  };

  // Add tag
  const addTag = () => {
    if (newTag.trim() && !post.tags?.includes(newTag.trim())) {
      setPost((prev) => ({
        ...prev,
        tags: [...(prev.tags || []), newTag.trim()],
      }));
      setNewTag("");
    }
  };

  // Remove tag
  const removeTag = (tag: string) => {
    setPost((prev) => ({
      ...prev,
      tags: prev.tags?.filter((t) => t !== tag) || [],
    }));
  };

  // Auto-save
  const handleAutoSave = useCallback(async () => {
    setIsSaving(true);
    // Simulate save
    await new Promise((resolve) => setTimeout(resolve, 500));
    setLastSaved(new Date());
    setIsSaving(false);
  }, [post]);

  // Save draft
  const handleSave = () => {
    const fullPost: BlogPost = {
      id: post.id || `post_${Date.now()}`,
      title: post.title || "Untitled",
      slug: post.slug || generateSlug(post.title || "untitled"),
      excerpt: post.excerpt || "",
      content: post.content || "",
      category: post.category || "",
      tags: post.tags || [],
      status: "draft",
      visibility: post.visibility || "public",
      password: post.password,
      author: post.author || { id: "1", name: "Admin" },
      seo: post.seo || { title: "", description: "", keywords: [] },
      readingTime: post.readingTime || 0,
      createdAt: post.createdAt || new Date(),
      updatedAt: new Date(),
    };
    onSave?.(fullPost);
    setLastSaved(new Date());
  };

  // Publish
  const handlePublish = () => {
    const fullPost: BlogPost = {
      id: post.id || `post_${Date.now()}`,
      title: post.title || "Untitled",
      slug: post.slug || generateSlug(post.title || "untitled"),
      excerpt: post.excerpt || "",
      content: post.content || "",
      category: post.category || "",
      tags: post.tags || [],
      status: post.scheduledAt ? "scheduled" : "published",
      visibility: post.visibility || "public",
      password: post.password,
      author: post.author || { id: "1", name: "Admin" },
      seo: post.seo || { title: "", description: "", keywords: [] },
      readingTime: post.readingTime || 0,
      publishedAt: post.scheduledAt ? undefined : new Date(),
      scheduledAt: post.scheduledAt,
      createdAt: post.createdAt || new Date(),
      updatedAt: new Date(),
    };
    onPublish?.(fullPost);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
            <X size={20} />
          </button>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {isSaving ? (
              <span className="flex items-center gap-1">
                <span className="animate-spin">⟳</span> Saving...
              </span>
            ) : lastSaved ? (
              <span>Saved {lastSaved.toLocaleTimeString()}</span>
            ) : (
              <span>Draft</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className={`flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg ${
              showPreview
                ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
            }`}
          >
            <Eye size={16} />
            Preview
          </button>

          <button
            onClick={handleSave}
            className="flex items-center gap-1 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
          >
            <Save size={16} />
            Save Draft
          </button>

          <div className="relative">
            <button
              onClick={() => setShowPublishOptions(!showPublishOptions)}
              className="flex items-center gap-1 px-4 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Send size={16} />
              Publish
              <ChevronDown size={14} />
            </button>

            {showPublishOptions && (
              <div className="absolute right-0 top-full mt-1 w-72 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
                <div className="p-4 space-y-4">
                  {/* Visibility */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Visibility
                    </label>
                    <div className="space-y-2">
                      {[
                        { value: "public", icon: Globe, label: "Public" },
                        { value: "private", icon: Lock, label: "Private" },
                        { value: "password", icon: Lock, label: "Password Protected" },
                      ].map((option) => (
                        <label
                          key={option.value}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <input
                            type="radio"
                            name="visibility"
                            value={option.value}
                            checked={post.visibility === option.value}
                            onChange={(e) =>
                              setPost((prev) => ({
                                ...prev,
                                visibility: e.target.value as any,
                              }))
                            }
                            className="text-blue-600"
                          />
                          <option.icon size={14} className="text-gray-500" />
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {option.label}
                          </span>
                        </label>
                      ))}
                    </div>

                    {post.visibility === "password" && (
                      <input
                        type="password"
                        placeholder="Enter password"
                        value={post.password || ""}
                        onChange={(e) =>
                          setPost((prev) => ({ ...prev, password: e.target.value }))
                        }
                        className="mt-2 w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    )}
                  </div>

                  {/* Schedule */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Publish Date
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="schedule"
                        checked={!post.scheduledAt}
                        onChange={() =>
                          setPost((prev) => ({ ...prev, scheduledAt: undefined }))
                        }
                        className="text-blue-600"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        Immediately
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <input
                        type="radio"
                        name="schedule"
                        checked={!!post.scheduledAt}
                        onChange={() =>
                          setPost((prev) => ({
                            ...prev,
                            scheduledAt: new Date(),
                          }))
                        }
                        className="text-blue-600"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        Schedule
                      </span>
                    </div>

                    {post.scheduledAt && (
                      <input
                        type="datetime-local"
                        value={post.scheduledAt.toISOString().slice(0, 16)}
                        onChange={(e) =>
                          setPost((prev) => ({
                            ...prev,
                            scheduledAt: new Date(e.target.value),
                          }))
                        }
                        className="mt-2 w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    )}
                  </div>

                  <button
                    onClick={handlePublish}
                    className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                  >
                    {post.scheduledAt ? "Schedule" : "Publish Now"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Main editor */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto py-8 px-4">
            {/* Featured Image */}
            <div className="mb-6">
              {post.featuredImage ? (
                <div className="relative">
                  <img
                    src={post.featuredImage}
                    alt="Featured"
                    className="w-full h-64 object-cover rounded-lg"
                  />
                  <button
                    onClick={() => setPost((prev) => ({ ...prev, featuredImage: undefined }))}
                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    const url = prompt("Enter featured image URL:");
                    if (url) setPost((prev) => ({ ...prev, featuredImage: url }));
                  }}
                  className="w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center text-gray-500 hover:border-blue-500 hover:text-blue-500 transition-colors"
                >
                  <div className="text-center">
                    <Image size={32} className="mx-auto mb-2" />
                    <span className="text-sm">Add Featured Image</span>
                  </div>
                </button>
              )}
            </div>

            {/* Title */}
            <input
              type="text"
              value={post.title}
              onChange={(e) => {
                const title = e.target.value;
                setPost((prev) => ({
                  ...prev,
                  title,
                  slug: prev.slug || generateSlug(title),
                }));
              }}
              placeholder="Enter title..."
              className="w-full text-4xl font-bold bg-transparent border-none focus:outline-none focus:ring-0 text-gray-900 dark:text-white placeholder-gray-400 mb-4"
            />

            {/* Slug */}
            <div className="flex items-center gap-2 mb-6 text-sm">
              <span className="text-gray-500">hyble.co/blog/</span>
              <input
                type="text"
                value={post.slug}
                onChange={(e) => setPost((prev) => ({ ...prev, slug: e.target.value }))}
                className="flex-1 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>

            {/* Excerpt */}
            <textarea
              value={post.excerpt}
              onChange={(e) => setPost((prev) => ({ ...prev, excerpt: e.target.value }))}
              placeholder="Write a short excerpt..."
              rows={2}
              className="w-full px-0 py-2 bg-transparent border-none focus:outline-none focus:ring-0 text-gray-600 dark:text-gray-400 placeholder-gray-400 resize-none mb-6"
            />

            {/* Toolbar */}
            <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 py-2 mb-4 flex flex-wrap items-center gap-1 z-10">
              <button
                onClick={() => execCommand("bold")}
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                title="Bold"
              >
                <Bold size={18} className="text-gray-600 dark:text-gray-400" />
              </button>
              <button
                onClick={() => execCommand("italic")}
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                title="Italic"
              >
                <Italic size={18} className="text-gray-600 dark:text-gray-400" />
              </button>
              <button
                onClick={() => execCommand("underline")}
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                title="Underline"
              >
                <Underline size={18} className="text-gray-600 dark:text-gray-400" />
              </button>
              <button
                onClick={() => execCommand("strikeThrough")}
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                title="Strikethrough"
              >
                <Strikethrough size={18} className="text-gray-600 dark:text-gray-400" />
              </button>

              <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

              <button
                onClick={() => execCommand("formatBlock", "h1")}
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                title="Heading 1"
              >
                <Heading1 size={18} className="text-gray-600 dark:text-gray-400" />
              </button>
              <button
                onClick={() => execCommand("formatBlock", "h2")}
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                title="Heading 2"
              >
                <Heading2 size={18} className="text-gray-600 dark:text-gray-400" />
              </button>
              <button
                onClick={() => execCommand("formatBlock", "h3")}
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                title="Heading 3"
              >
                <Heading3 size={18} className="text-gray-600 dark:text-gray-400" />
              </button>

              <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

              <button
                onClick={() => execCommand("insertUnorderedList")}
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                title="Bullet List"
              >
                <List size={18} className="text-gray-600 dark:text-gray-400" />
              </button>
              <button
                onClick={() => execCommand("insertOrderedList")}
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                title="Numbered List"
              >
                <ListOrdered size={18} className="text-gray-600 dark:text-gray-400" />
              </button>
              <button
                onClick={() => execCommand("formatBlock", "blockquote")}
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                title="Quote"
              >
                <Quote size={18} className="text-gray-600 dark:text-gray-400" />
              </button>
              <button
                onClick={() => execCommand("formatBlock", "pre")}
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                title="Code Block"
              >
                <Code size={18} className="text-gray-600 dark:text-gray-400" />
              </button>

              <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

              <button
                onClick={() => execCommand("justifyLeft")}
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                title="Align Left"
              >
                <AlignLeft size={18} className="text-gray-600 dark:text-gray-400" />
              </button>
              <button
                onClick={() => execCommand("justifyCenter")}
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                title="Align Center"
              >
                <AlignCenter size={18} className="text-gray-600 dark:text-gray-400" />
              </button>
              <button
                onClick={() => execCommand("justifyRight")}
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                title="Align Right"
              >
                <AlignRight size={18} className="text-gray-600 dark:text-gray-400" />
              </button>

              <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

              <button
                onClick={insertLink}
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                title="Insert Link"
              >
                <Link size={18} className="text-gray-600 dark:text-gray-400" />
              </button>
              <button
                onClick={insertImage}
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                title="Insert Image"
              >
                <Image size={18} className="text-gray-600 dark:text-gray-400" />
              </button>

              <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

              <button
                onClick={() => execCommand("undo")}
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                title="Undo"
              >
                <Undo size={18} className="text-gray-600 dark:text-gray-400" />
              </button>
              <button
                onClick={() => execCommand("redo")}
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                title="Redo"
              >
                <Redo size={18} className="text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            {/* Content editor */}
            <div
              ref={editorRef}
              contentEditable
              onInput={(e) => updateContent(e.currentTarget.innerHTML)}
              dangerouslySetInnerHTML={{ __html: post.content || "" }}
              className="min-h-[400px] prose dark:prose-invert max-w-none focus:outline-none"
              style={{ minHeight: "400px" }}
            />

            {/* Word count */}
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center gap-4">
                <span>{wordCount} words</span>
                <span>{post.readingTime || 0} min read</span>
              </div>
            </div>
          </div>
        </div>

        {/* Preview */}
        {showPreview && (
          <div className="w-1/2 border-l border-gray-200 dark:border-gray-700 overflow-y-auto bg-white dark:bg-gray-800">
            <div className="max-w-2xl mx-auto py-8 px-6">
              {post.featuredImage && (
                <img
                  src={post.featuredImage}
                  alt="Featured"
                  className="w-full h-64 object-cover rounded-lg mb-6"
                />
              )}
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                {post.title || "Untitled"}
              </h1>
              {post.excerpt && (
                <p className="text-xl text-gray-600 dark:text-gray-400 mb-6">
                  {post.excerpt}
                </p>
              )}
              <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-8">
                <span className="flex items-center gap-1">
                  <User size={14} />
                  {post.author?.name || "Admin"}
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={14} />
                  {post.readingTime || 0} min read
                </span>
                <span className="flex items-center gap-1">
                  <Calendar size={14} />
                  {new Date().toLocaleDateString()}
                </span>
              </div>
              <div
                className="prose dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: post.content || "" }}
              />
            </div>
          </div>
        )}

        {/* Sidebar */}
        <div className="w-80 border-l border-gray-200 dark:border-gray-700 overflow-y-auto bg-white dark:bg-gray-800">
          <div className="p-4 space-y-6">
            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category
              </label>
              <select
                value={post.category}
                onChange={(e) => setPost((prev) => ({ ...prev, category: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tags
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {post.tags?.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-sm text-gray-700 dark:text-gray-300"
                  >
                    {tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addTag()}
                  placeholder="Add tag"
                  className="flex-1 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <button
                  onClick={addTag}
                  className="p-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  <Plus size={16} className="text-gray-600 dark:text-gray-400" />
                </button>
              </div>
            </div>

            {/* SEO */}
            <div>
              <button
                onClick={() => setShowSeoPanel(!showSeoPanel)}
                className="w-full flex items-center justify-between text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                <span className="flex items-center gap-2">
                  <Globe size={16} />
                  SEO Settings
                </span>
                <ChevronDown
                  size={16}
                  className={`transform transition-transform ${showSeoPanel ? "rotate-180" : ""}`}
                />
              </button>

              {showSeoPanel && (
                <div className="space-y-3 mt-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                      SEO Title
                    </label>
                    <input
                      type="text"
                      value={post.seo?.title || ""}
                      onChange={(e) =>
                        setPost((prev) => ({
                          ...prev,
                          seo: { ...prev.seo!, title: e.target.value },
                        }))
                      }
                      placeholder={post.title}
                      className="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      {(post.seo?.title || post.title || "").length}/60
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Meta Description
                    </label>
                    <textarea
                      value={post.seo?.description || ""}
                      onChange={(e) =>
                        setPost((prev) => ({
                          ...prev,
                          seo: { ...prev.seo!, description: e.target.value },
                        }))
                      }
                      placeholder={post.excerpt}
                      rows={3}
                      className="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      {(post.seo?.description || post.excerpt || "").length}/160
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Focus Keywords
                    </label>
                    <input
                      type="text"
                      value={post.seo?.keywords?.join(", ") || ""}
                      onChange={(e) =>
                        setPost((prev) => ({
                          ...prev,
                          seo: {
                            ...prev.seo!,
                            keywords: e.target.value.split(",").map((k) => k.trim()),
                          },
                        }))
                      }
                      placeholder="keyword1, keyword2"
                      className="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  {/* SEO Preview */}
                  <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                      Google Preview
                    </p>
                    <p className="text-blue-600 dark:text-blue-400 text-sm font-medium truncate">
                      {post.seo?.title || post.title || "Untitled"}
                    </p>
                    <p className="text-green-700 dark:text-green-400 text-xs truncate">
                      hyble.co/blog/{post.slug || "untitled"}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400 text-xs mt-1 line-clamp-2">
                      {post.seo?.description || post.excerpt || "No description"}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Post info */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Status</span>
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-medium ${
                      post.status === "published"
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : post.status === "scheduled"
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                        : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {post.status || "Draft"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Author</span>
                  <span className="text-gray-900 dark:text-white">
                    {post.author?.name || "Admin"}
                  </span>
                </div>
                {post.publishedAt && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Published</span>
                    <span className="text-gray-900 dark:text-white">
                      {post.publishedAt.toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BlogEditor;
