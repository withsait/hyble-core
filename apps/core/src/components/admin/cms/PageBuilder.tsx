"use client";

import { useState, useCallback } from "react";
import {
  Plus,
  Trash2,
  Move,
  Settings,
  Eye,
  EyeOff,
  Copy,
  ChevronUp,
  ChevronDown,
  Image,
  Type,
  Layout,
  Video,
  Code,
  List,
  Quote,
  Link,
  Table,
  Columns,
  Save,
  Undo,
  Redo,
  Smartphone,
  Monitor,
  Tablet,
  GripVertical,
} from "lucide-react";

// Block types
type BlockType =
  | "hero"
  | "text"
  | "image"
  | "video"
  | "gallery"
  | "cta"
  | "features"
  | "testimonials"
  | "pricing"
  | "faq"
  | "contact"
  | "code"
  | "columns"
  | "divider"
  | "spacer"
  | "html";

interface ContentBlock {
  id: string;
  type: BlockType;
  content: Record<string, any>;
  settings: {
    visible: boolean;
    className?: string;
    padding?: string;
    margin?: string;
    backgroundColor?: string;
    animation?: string;
  };
}

interface PageData {
  id: string;
  title: string;
  slug: string;
  blocks: ContentBlock[];
  seo: {
    title: string;
    description: string;
    keywords: string[];
    ogImage?: string;
  };
  status: "draft" | "published" | "scheduled";
  publishedAt?: Date;
}

const blockTemplates: Record<BlockType, { name: string; icon: any; defaultContent: Record<string, any> }> = {
  hero: {
    name: "Hero Section",
    icon: Layout,
    defaultContent: {
      title: "Welcome to Our Site",
      subtitle: "Discover amazing features",
      buttonText: "Get Started",
      buttonLink: "#",
      backgroundImage: "",
      alignment: "center",
    },
  },
  text: {
    name: "Text Block",
    icon: Type,
    defaultContent: {
      content: "<p>Enter your text here...</p>",
      alignment: "left",
    },
  },
  image: {
    name: "Image",
    icon: Image,
    defaultContent: {
      src: "",
      alt: "",
      caption: "",
      size: "full",
    },
  },
  video: {
    name: "Video",
    icon: Video,
    defaultContent: {
      url: "",
      type: "youtube",
      autoplay: false,
      muted: false,
    },
  },
  gallery: {
    name: "Gallery",
    icon: Columns,
    defaultContent: {
      images: [],
      columns: 3,
      gap: "md",
      lightbox: true,
    },
  },
  cta: {
    name: "Call to Action",
    icon: Link,
    defaultContent: {
      title: "Ready to get started?",
      description: "Join thousands of satisfied customers",
      buttonText: "Sign Up Now",
      buttonLink: "/register",
      style: "primary",
    },
  },
  features: {
    name: "Features",
    icon: List,
    defaultContent: {
      title: "Our Features",
      items: [
        { icon: "star", title: "Feature 1", description: "Description 1" },
        { icon: "shield", title: "Feature 2", description: "Description 2" },
        { icon: "zap", title: "Feature 3", description: "Description 3" },
      ],
      columns: 3,
    },
  },
  testimonials: {
    name: "Testimonials",
    icon: Quote,
    defaultContent: {
      title: "What Our Customers Say",
      items: [
        { name: "John Doe", role: "CEO", quote: "Amazing service!", avatar: "" },
      ],
      style: "cards",
    },
  },
  pricing: {
    name: "Pricing",
    icon: Table,
    defaultContent: {
      title: "Choose Your Plan",
      plans: [
        {
          name: "Basic",
          price: "$9/mo",
          features: ["Feature 1", "Feature 2"],
          cta: "Get Started",
        },
        {
          name: "Pro",
          price: "$29/mo",
          features: ["Feature 1", "Feature 2", "Feature 3"],
          cta: "Get Started",
          highlighted: true,
        },
      ],
    },
  },
  faq: {
    name: "FAQ",
    icon: List,
    defaultContent: {
      title: "Frequently Asked Questions",
      items: [
        { question: "Question 1?", answer: "Answer 1" },
        { question: "Question 2?", answer: "Answer 2" },
      ],
    },
  },
  contact: {
    name: "Contact Form",
    icon: Layout,
    defaultContent: {
      title: "Contact Us",
      fields: ["name", "email", "message"],
      submitText: "Send Message",
      recipientEmail: "",
    },
  },
  code: {
    name: "Code Block",
    icon: Code,
    defaultContent: {
      code: "",
      language: "javascript",
      showLineNumbers: true,
    },
  },
  columns: {
    name: "Columns",
    icon: Columns,
    defaultContent: {
      columns: 2,
      gap: "md",
      content: [[], []],
    },
  },
  divider: {
    name: "Divider",
    icon: Layout,
    defaultContent: {
      style: "line",
      color: "#e5e7eb",
    },
  },
  spacer: {
    name: "Spacer",
    icon: Layout,
    defaultContent: {
      height: "40px",
    },
  },
  html: {
    name: "Custom HTML",
    icon: Code,
    defaultContent: {
      html: "",
    },
  },
};

interface PageBuilderProps {
  initialData?: PageData;
  onSave?: (data: PageData) => void;
}

export function PageBuilder({ initialData, onSave }: PageBuilderProps) {
  const [page, setPage] = useState<PageData>(
    initialData || {
      id: "",
      title: "Untitled Page",
      slug: "untitled-page",
      blocks: [],
      seo: {
        title: "",
        description: "",
        keywords: [],
      },
      status: "draft",
    }
  );
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [showBlockPicker, setShowBlockPicker] = useState(false);
  const [showSeoPanel, setShowSeoPanel] = useState(false);
  const [history, setHistory] = useState<PageData[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [draggedBlock, setDraggedBlock] = useState<string | null>(null);

  const saveToHistory = useCallback((newPage: PageData) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newPage);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      const prevPage = history[historyIndex - 1];
      if (prevPage) setPage(prevPage);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      const nextPage = history[historyIndex + 1];
      if (nextPage) setPage(nextPage);
    }
  };

  const addBlock = (type: BlockType, index?: number) => {
    const template = blockTemplates[type];
    const newBlock: ContentBlock = {
      id: `block_${Date.now()}`,
      type,
      content: { ...template.defaultContent },
      settings: {
        visible: true,
        padding: "py-8",
      },
    };

    const newBlocks = [...page.blocks];
    if (index !== undefined) {
      newBlocks.splice(index, 0, newBlock);
    } else {
      newBlocks.push(newBlock);
    }

    const newPage = { ...page, blocks: newBlocks };
    setPage(newPage);
    saveToHistory(newPage);
    setSelectedBlockId(newBlock.id);
    setShowBlockPicker(false);
  };

  const updateBlock = (blockId: string, updates: Partial<ContentBlock>) => {
    const newBlocks = page.blocks.map((block) =>
      block.id === blockId ? { ...block, ...updates } : block
    );
    const newPage = { ...page, blocks: newBlocks };
    setPage(newPage);
    saveToHistory(newPage);
  };

  const deleteBlock = (blockId: string) => {
    const newBlocks = page.blocks.filter((block) => block.id !== blockId);
    const newPage = { ...page, blocks: newBlocks };
    setPage(newPage);
    saveToHistory(newPage);
    setSelectedBlockId(null);
  };

  const duplicateBlock = (blockId: string) => {
    const blockIndex = page.blocks.findIndex((b) => b.id === blockId);
    if (blockIndex === -1) return;

    const block = page.blocks[blockIndex];
    const newBlock: ContentBlock = {
      ...block,
      id: `block_${Date.now()}`,
    };

    const newBlocks = [...page.blocks];
    newBlocks.splice(blockIndex + 1, 0, newBlock);

    const newPage = { ...page, blocks: newBlocks };
    setPage(newPage);
    saveToHistory(newPage);
  };

  const moveBlock = (blockId: string, direction: "up" | "down") => {
    const index = page.blocks.findIndex((b) => b.id === blockId);
    if (index === -1) return;
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === page.blocks.length - 1) return;

    const newBlocks = [...page.blocks];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    [newBlocks[index], newBlocks[targetIndex]] = [newBlocks[targetIndex], newBlocks[index]];

    const newPage = { ...page, blocks: newBlocks };
    setPage(newPage);
    saveToHistory(newPage);
  };

  const toggleBlockVisibility = (blockId: string) => {
    const newBlocks = page.blocks.map((block) =>
      block.id === blockId
        ? { ...block, settings: { ...block.settings, visible: !block.settings.visible } }
        : block
    );
    const newPage = { ...page, blocks: newBlocks };
    setPage(newPage);
    saveToHistory(newPage);
  };

  const handleDragStart = (blockId: string) => {
    setDraggedBlock(blockId);
  };

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedBlock || draggedBlock === targetId) return;
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedBlock || draggedBlock === targetId) return;

    const draggedIndex = page.blocks.findIndex((b) => b.id === draggedBlock);
    const targetIndex = page.blocks.findIndex((b) => b.id === targetId);

    const newBlocks = [...page.blocks];
    const [removed] = newBlocks.splice(draggedIndex, 1);
    newBlocks.splice(targetIndex, 0, removed);

    const newPage = { ...page, blocks: newBlocks };
    setPage(newPage);
    saveToHistory(newPage);
    setDraggedBlock(null);
  };

  const handleSave = () => {
    onSave?.(page);
  };

  const selectedBlock = page.blocks.find((b) => b.id === selectedBlockId);

  const viewModeWidth = {
    desktop: "100%",
    tablet: "768px",
    mobile: "375px",
  };

  return (
    <div className="h-screen flex flex-col bg-gray-100 dark:bg-gray-900">
      {/* Toolbar */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={page.title}
            onChange={(e) => setPage({ ...page, title: e.target.value })}
            className="font-semibold bg-transparent border-none focus:ring-0 dark:text-white"
          />
          <span className="text-sm text-gray-500 dark:text-gray-400">
            /{page.slug}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* View mode toggles */}
          <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setViewMode("desktop")}
              className={`p-1.5 rounded ${
                viewMode === "desktop"
                  ? "bg-white dark:bg-gray-600 shadow"
                  : "hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              <Monitor size={16} className="text-gray-600 dark:text-gray-300" />
            </button>
            <button
              onClick={() => setViewMode("tablet")}
              className={`p-1.5 rounded ${
                viewMode === "tablet"
                  ? "bg-white dark:bg-gray-600 shadow"
                  : "hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              <Tablet size={16} className="text-gray-600 dark:text-gray-300" />
            </button>
            <button
              onClick={() => setViewMode("mobile")}
              className={`p-1.5 rounded ${
                viewMode === "mobile"
                  ? "bg-white dark:bg-gray-600 shadow"
                  : "hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              <Smartphone size={16} className="text-gray-600 dark:text-gray-300" />
            </button>
          </div>

          <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />

          {/* History controls */}
          <button
            onClick={undo}
            disabled={historyIndex <= 0}
            className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
          >
            <Undo size={16} className="text-gray-600 dark:text-gray-300" />
          </button>
          <button
            onClick={redo}
            disabled={historyIndex >= history.length - 1}
            className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
          >
            <Redo size={16} className="text-gray-600 dark:text-gray-300" />
          </button>

          <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />

          {/* SEO button */}
          <button
            onClick={() => setShowSeoPanel(!showSeoPanel)}
            className={`px-3 py-1.5 text-sm rounded ${
              showSeoPanel
                ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
            }`}
          >
            SEO
          </button>

          {/* Status dropdown */}
          <select
            value={page.status}
            onChange={(e) =>
              setPage({ ...page, status: e.target.value as PageData["status"] })
            }
            className="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="scheduled">Scheduled</option>
          </select>

          {/* Save button */}
          <button
            onClick={handleSave}
            className="flex items-center gap-1 px-4 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
          >
            <Save size={16} />
            Save
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Block picker sidebar */}
        {showBlockPicker && (
          <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                Add Block
              </h3>
              <div className="space-y-2">
                {Object.entries(blockTemplates).map(([type, template]) => (
                  <button
                    key={type}
                    onClick={() => addBlock(type as BlockType)}
                    className="w-full flex items-center gap-2 p-2 text-left rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                  >
                    <template.icon size={18} />
                    <span className="text-sm">{template.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Canvas */}
        <div className="flex-1 overflow-auto p-8 flex justify-center">
          <div
            className="bg-white dark:bg-gray-800 shadow-lg transition-all"
            style={{ width: viewModeWidth[viewMode], minHeight: "600px" }}
          >
            {page.blocks.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                <Layout size={48} className="mb-4 opacity-50" />
                <p className="text-lg mb-2">No blocks yet</p>
                <button
                  onClick={() => setShowBlockPicker(true)}
                  className="flex items-center gap-1 text-blue-600 hover:text-blue-700"
                >
                  <Plus size={16} />
                  Add your first block
                </button>
              </div>
            ) : (
              <div className="min-h-full">
                {page.blocks.map((block, index) => (
                  <div
                    key={block.id}
                    draggable
                    onDragStart={() => handleDragStart(block.id)}
                    onDragOver={(e) => handleDragOver(e, block.id)}
                    onDrop={(e) => handleDrop(e, block.id)}
                    onClick={() => setSelectedBlockId(block.id)}
                    className={`relative group ${
                      block.settings.padding || ""
                    } ${block.settings.margin || ""} ${
                      !block.settings.visible ? "opacity-50" : ""
                    } ${
                      selectedBlockId === block.id
                        ? "ring-2 ring-blue-500"
                        : "hover:ring-1 hover:ring-gray-300 dark:hover:ring-gray-600"
                    }`}
                    style={{ backgroundColor: block.settings.backgroundColor }}
                  >
                    {/* Block controls */}
                    <div className="absolute -left-12 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1">
                      <button
                        className="p-1 bg-gray-800 text-white rounded hover:bg-gray-700"
                        onMouseDown={(e) => e.stopPropagation()}
                      >
                        <GripVertical size={14} />
                      </button>
                    </div>

                    <div className="absolute -right-10 top-0 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          moveBlock(block.id, "up");
                        }}
                        className="p-1 bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                        disabled={index === 0}
                      >
                        <ChevronUp size={14} className="text-gray-600 dark:text-gray-300" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          moveBlock(block.id, "down");
                        }}
                        className="p-1 bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                        disabled={index === page.blocks.length - 1}
                      >
                        <ChevronDown size={14} className="text-gray-600 dark:text-gray-300" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleBlockVisibility(block.id);
                        }}
                        className="p-1 bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                      >
                        {block.settings.visible ? (
                          <Eye size={14} className="text-gray-600 dark:text-gray-300" />
                        ) : (
                          <EyeOff size={14} className="text-gray-600 dark:text-gray-300" />
                        )}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          duplicateBlock(block.id);
                        }}
                        className="p-1 bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                      >
                        <Copy size={14} className="text-gray-600 dark:text-gray-300" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteBlock(block.id);
                        }}
                        className="p-1 bg-red-100 dark:bg-red-900/30 rounded hover:bg-red-200 dark:hover:bg-red-900/50"
                      >
                        <Trash2 size={14} className="text-red-600 dark:text-red-400" />
                      </button>
                    </div>

                    {/* Block content preview */}
                    <BlockPreview block={block} />
                  </div>
                ))}

                {/* Add block button at bottom */}
                <div className="p-4 border-t border-dashed border-gray-300 dark:border-gray-600">
                  <button
                    onClick={() => setShowBlockPicker(true)}
                    className="w-full py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-400 hover:border-blue-500 hover:text-blue-500 transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus size={20} />
                    Add Block
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Settings sidebar */}
        {selectedBlock && (
          <div className="w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 overflow-y-auto">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {blockTemplates[selectedBlock.type].name}
                </h3>
                <button
                  onClick={() => setSelectedBlockId(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  ×
                </button>
              </div>

              <BlockEditor
                block={selectedBlock}
                onChange={(updates) => updateBlock(selectedBlock.id, updates)}
              />
            </div>
          </div>
        )}

        {/* SEO Panel */}
        {showSeoPanel && (
          <div className="w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 overflow-y-auto">
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                SEO Settings
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Page Title
                  </label>
                  <input
                    type="text"
                    value={page.seo.title}
                    onChange={(e) =>
                      setPage({
                        ...page,
                        seo: { ...page.seo, title: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="SEO title"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {page.seo.title.length}/60 characters
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Meta Description
                  </label>
                  <textarea
                    value={page.seo.description}
                    onChange={(e) =>
                      setPage({
                        ...page,
                        seo: { ...page.seo, description: e.target.value },
                      })
                    }
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Page description for search engines"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {page.seo.description.length}/160 characters
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Keywords
                  </label>
                  <input
                    type="text"
                    value={page.seo.keywords.join(", ")}
                    onChange={(e) =>
                      setPage({
                        ...page,
                        seo: {
                          ...page.seo,
                          keywords: e.target.value.split(",").map((k) => k.trim()),
                        },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="keyword1, keyword2, keyword3"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    OG Image URL
                  </label>
                  <input
                    type="text"
                    value={page.seo.ogImage || ""}
                    onChange={(e) =>
                      setPage({
                        ...page,
                        seo: { ...page.seo, ogImage: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="https://..."
                  />
                </div>

                {/* Preview */}
                <div className="mt-6">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Search Preview
                  </h4>
                  <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-blue-600 dark:text-blue-400 text-sm font-medium truncate">
                      {page.seo.title || page.title}
                    </p>
                    <p className="text-green-700 dark:text-green-400 text-xs truncate">
                      hyble.co/{page.slug}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400 text-xs mt-1 line-clamp-2">
                      {page.seo.description || "No description set"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add block FAB */}
      {!showBlockPicker && (
        <button
          onClick={() => setShowBlockPicker(true)}
          className="fixed bottom-6 left-6 w-12 h-12 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 flex items-center justify-center"
        >
          <Plus size={24} />
        </button>
      )}
    </div>
  );
}

// Block preview component
function BlockPreview({ block }: { block: ContentBlock }) {
  const { type, content } = block;

  switch (type) {
    case "hero":
      return (
        <div className="text-center py-12 px-4" style={{ backgroundImage: content.backgroundImage ? `url(${content.backgroundImage})` : undefined }}>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {content.title}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{content.subtitle}</p>
          <button className="px-6 py-2 bg-blue-600 text-white rounded-lg">
            {content.buttonText}
          </button>
        </div>
      );

    case "text":
      return (
        <div
          className="prose dark:prose-invert max-w-none px-4"
          dangerouslySetInnerHTML={{ __html: content.content }}
        />
      );

    case "image":
      return (
        <div className="px-4">
          {content.src ? (
            <img src={content.src} alt={content.alt} className="max-w-full h-auto" />
          ) : (
            <div className="bg-gray-200 dark:bg-gray-700 h-48 flex items-center justify-center">
              <Image size={48} className="text-gray-400" />
            </div>
          )}
          {content.caption && (
            <p className="text-sm text-gray-500 mt-2 text-center">{content.caption}</p>
          )}
        </div>
      );

    case "cta":
      return (
        <div className="text-center py-8 px-4 bg-blue-50 dark:bg-blue-900/20">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {content.title}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{content.description}</p>
          <button className="px-6 py-2 bg-blue-600 text-white rounded-lg">
            {content.buttonText}
          </button>
        </div>
      );

    case "features":
      return (
        <div className="px-4">
          <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-6">
            {content.title}
          </h2>
          <div className={`grid grid-cols-${content.columns} gap-4`}>
            {content.items?.map((item: any, i: number) => (
              <div key={i} className="text-center p-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full mx-auto mb-3 flex items-center justify-center">
                  <span className="text-blue-600 dark:text-blue-400">★</span>
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white">{item.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      );

    case "divider":
      return (
        <hr
          className="mx-4"
          style={{ borderColor: content.color }}
        />
      );

    case "spacer":
      return <div style={{ height: content.height }} />;

    default:
      return (
        <div className="p-4 text-center text-gray-500 dark:text-gray-400">
          [{blockTemplates[type]?.name || type}]
        </div>
      );
  }
}

// Block editor component
function BlockEditor({
  block,
  onChange,
}: {
  block: ContentBlock;
  onChange: (updates: Partial<ContentBlock>) => void;
}) {
  const updateContent = (key: string, value: any) => {
    onChange({ content: { ...block.content, [key]: value } });
  };

  const updateSettings = (key: string, value: any) => {
    onChange({ settings: { ...block.settings, [key]: value } });
  };

  const { type, content, settings } = block;

  return (
    <div className="space-y-4">
      {/* Content fields based on block type */}
      {type === "hero" && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Title
            </label>
            <input
              type="text"
              value={content.title}
              onChange={(e) => updateContent("title", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Subtitle
            </label>
            <input
              type="text"
              value={content.subtitle}
              onChange={(e) => updateContent("subtitle", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Button Text
            </label>
            <input
              type="text"
              value={content.buttonText}
              onChange={(e) => updateContent("buttonText", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Button Link
            </label>
            <input
              type="text"
              value={content.buttonLink}
              onChange={(e) => updateContent("buttonLink", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </>
      )}

      {type === "text" && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Content
          </label>
          <textarea
            value={content.content}
            onChange={(e) => updateContent("content", e.target.value)}
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm"
          />
        </div>
      )}

      {type === "image" && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Image URL
            </label>
            <input
              type="text"
              value={content.src}
              onChange={(e) => updateContent("src", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="https://..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Alt Text
            </label>
            <input
              type="text"
              value={content.alt}
              onChange={(e) => updateContent("alt", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Caption
            </label>
            <input
              type="text"
              value={content.caption}
              onChange={(e) => updateContent("caption", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </>
      )}

      {type === "cta" && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Title
            </label>
            <input
              type="text"
              value={content.title}
              onChange={(e) => updateContent("title", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              value={content.description}
              onChange={(e) => updateContent("description", e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Button Text
            </label>
            <input
              type="text"
              value={content.buttonText}
              onChange={(e) => updateContent("buttonText", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </>
      )}

      {/* Common settings */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <h4 className="font-medium text-gray-900 dark:text-white mb-3">Settings</h4>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Background Color
            </label>
            <input
              type="color"
              value={settings.backgroundColor || "#ffffff"}
              onChange={(e) => updateSettings("backgroundColor", e.target.value)}
              className="w-full h-10 rounded cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Padding
            </label>
            <select
              value={settings.padding || "py-8"}
              onChange={(e) => updateSettings("padding", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="py-0">None</option>
              <option value="py-4">Small</option>
              <option value="py-8">Medium</option>
              <option value="py-12">Large</option>
              <option value="py-16">Extra Large</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Custom CSS Class
            </label>
            <input
              type="text"
              value={settings.className || ""}
              onChange={(e) => updateSettings("className", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm"
              placeholder="e.g. my-custom-class"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default PageBuilder;
