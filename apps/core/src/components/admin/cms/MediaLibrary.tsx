"use client";

import { useState, useCallback, useRef } from "react";
import {
  Upload,
  Image,
  Video,
  File,
  Folder,
  FolderPlus,
  Search,
  Grid,
  List,
  Trash2,
  Download,
  Copy,
  Edit2,
  MoreVertical,
  Check,
  X,
  ChevronRight,
  ChevronDown,
  Filter,
  SortAsc,
  SortDesc,
  Eye,
  Link,
  Info,
  RefreshCw,
  HardDrive,
  Clock,
} from "lucide-react";

interface MediaFile {
  id: string;
  name: string;
  type: "image" | "video" | "document" | "audio" | "other";
  mimeType: string;
  url: string;
  thumbnailUrl?: string;
  size: number;
  width?: number;
  height?: number;
  duration?: number;
  folderId: string | null;
  createdAt: Date;
  updatedAt: Date;
  alt?: string;
  caption?: string;
  tags: string[];
  usageCount: number;
}

interface MediaFolder {
  id: string;
  name: string;
  parentId: string | null;
  path: string;
  itemCount: number;
  createdAt: Date;
}

interface MediaLibraryProps {
  mode?: "browse" | "select";
  allowedTypes?: ("image" | "video" | "document" | "audio")[];
  multiple?: boolean;
  onSelect?: (files: MediaFile[]) => void;
  onClose?: () => void;
}

// Mock data
const mockFolders: MediaFolder[] = [
  { id: "1", name: "Products", parentId: null, path: "/Products", itemCount: 45, createdAt: new Date() },
  { id: "2", name: "Blog", parentId: null, path: "/Blog", itemCount: 23, createdAt: new Date() },
  { id: "3", name: "Banners", parentId: null, path: "/Banners", itemCount: 12, createdAt: new Date() },
  { id: "4", name: "Electronics", parentId: "1", path: "/Products/Electronics", itemCount: 15, createdAt: new Date() },
];

const mockFiles: MediaFile[] = [
  {
    id: "f1",
    name: "product-hero.jpg",
    type: "image",
    mimeType: "image/jpeg",
    url: "https://picsum.photos/800/600",
    thumbnailUrl: "https://picsum.photos/200/150",
    size: 245000,
    width: 800,
    height: 600,
    folderId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    alt: "Product hero image",
    tags: ["hero", "product"],
    usageCount: 5,
  },
  {
    id: "f2",
    name: "banner-sale.png",
    type: "image",
    mimeType: "image/png",
    url: "https://picsum.photos/1200/400",
    thumbnailUrl: "https://picsum.photos/300/100",
    size: 512000,
    width: 1200,
    height: 400,
    folderId: "3",
    createdAt: new Date(),
    updatedAt: new Date(),
    alt: "Sale banner",
    tags: ["banner", "sale"],
    usageCount: 3,
  },
  {
    id: "f3",
    name: "intro-video.mp4",
    type: "video",
    mimeType: "video/mp4",
    url: "/videos/intro.mp4",
    thumbnailUrl: "https://picsum.photos/200/150",
    size: 15000000,
    width: 1920,
    height: 1080,
    duration: 120,
    folderId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    tags: ["video", "intro"],
    usageCount: 2,
  },
  {
    id: "f4",
    name: "catalog-2024.pdf",
    type: "document",
    mimeType: "application/pdf",
    url: "/docs/catalog-2024.pdf",
    size: 5200000,
    folderId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    tags: ["catalog", "2024"],
    usageCount: 10,
  },
];

export function MediaLibrary({
  mode = "browse",
  allowedTypes,
  multiple = false,
  onSelect,
  onClose,
}: MediaLibraryProps) {
  const [files, setFiles] = useState<MediaFile[]>(mockFiles);
  const [folders, setFolders] = useState<MediaFolder[]>(mockFolders);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "date" | "size">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [filterType, setFilterType] = useState<string>("all");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [showDetails, setShowDetails] = useState<string | null>(null);
  const [editingName, setEditingName] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  // Get current folder breadcrumb
  const getBreadcrumb = () => {
    const crumbs: { id: string | null; name: string }[] = [{ id: null, name: "All Files" }];
    if (currentFolderId) {
      let folder = folders.find((f) => f.id === currentFolderId);
      const path: MediaFolder[] = [];
      while (folder) {
        path.unshift(folder);
        folder = folder.parentId ? folders.find((f) => f.id === folder!.parentId) : undefined;
      }
      path.forEach((f) => crumbs.push({ id: f.id, name: f.name }));
    }
    return crumbs;
  };

  // Filter and sort files
  const getVisibleFiles = () => {
    let result = files.filter((f) => f.folderId === currentFolderId);

    if (searchQuery) {
      result = result.filter(
        (f) =>
          f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          f.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    if (filterType !== "all") {
      result = result.filter((f) => f.type === filterType);
    }

    if (allowedTypes) {
      result = result.filter((f) => allowedTypes.includes(f.type as any));
    }

    result.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "date":
          comparison = a.createdAt.getTime() - b.createdAt.getTime();
          break;
        case "size":
          comparison = a.size - b.size;
          break;
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

    return result;
  };

  // Get visible folders
  const getVisibleFolders = () => {
    return folders.filter((f) => f.parentId === currentFolderId);
  };

  // Format file size
  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  };

  // Get file icon
  const getFileIcon = (type: string) => {
    switch (type) {
      case "image":
        return Image;
      case "video":
        return Video;
      default:
        return File;
    }
  };

  // Handle file selection
  const toggleFileSelection = (fileId: string) => {
    if (multiple) {
      setSelectedFiles((prev) =>
        prev.includes(fileId) ? prev.filter((id) => id !== fileId) : [...prev, fileId]
      );
    } else {
      setSelectedFiles([fileId]);
    }
  };

  // Handle file upload
  const handleFileUpload = async (uploadedFiles: FileList) => {
    setIsUploading(true);

    for (let i = 0; i < uploadedFiles.length; i++) {
      const file = uploadedFiles[i];
      if (!file) continue;

      const fileId = `upload_${Date.now()}_${i}`;

      setUploadProgress((prev) => ({ ...prev, [fileId]: 0 }));

      // Simulate upload progress
      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        setUploadProgress((prev) => ({ ...prev, [fileId]: progress }));
      }

      // Add file to list
      const newFile: MediaFile = {
        id: fileId,
        name: file.name,
        type: file.type.startsWith("image/")
          ? "image"
          : file.type.startsWith("video/")
          ? "video"
          : file.type.startsWith("audio/")
          ? "audio"
          : "document",
        mimeType: file.type,
        url: URL.createObjectURL(file),
        thumbnailUrl: file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined,
        size: file.size,
        folderId: currentFolderId,
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: [],
        usageCount: 0,
      };

      setFiles((prev) => [newFile, ...prev]);
      setUploadProgress((prev) => {
        const updated = { ...prev };
        delete updated[fileId];
        return updated;
      });
    }

    setIsUploading(false);
  };

  // Handle drag and drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files);
    }
  }, [currentFolderId]);

  // Create new folder
  const createFolder = () => {
    if (!newFolderName.trim()) return;

    const newFolder: MediaFolder = {
      id: `folder_${Date.now()}`,
      name: newFolderName,
      parentId: currentFolderId,
      path: currentFolderId
        ? `${folders.find((f) => f.id === currentFolderId)?.path}/${newFolderName}`
        : `/${newFolderName}`,
      itemCount: 0,
      createdAt: new Date(),
    };

    setFolders((prev) => [...prev, newFolder]);
    setNewFolderName("");
    setShowNewFolderModal(false);
  };

  // Rename file
  const renameFile = (fileId: string) => {
    if (!newName.trim()) return;

    setFiles((prev) =>
      prev.map((f) => (f.id === fileId ? { ...f, name: newName, updatedAt: new Date() } : f))
    );
    setEditingName(null);
    setNewName("");
  };

  // Delete files
  const deleteFiles = (fileIds: string[]) => {
    if (!confirm(`Are you sure you want to delete ${fileIds.length} file(s)?`)) return;
    setFiles((prev) => prev.filter((f) => !fileIds.includes(f.id)));
    setSelectedFiles([]);
  };

  // Copy URL to clipboard
  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
  };

  // Handle select confirmation
  const handleSelectConfirm = () => {
    const selected = files.filter((f) => selectedFiles.includes(f.id));
    onSelect?.(selected);
    onClose?.();
  };

  const visibleFiles = getVisibleFiles();
  const visibleFolders = getVisibleFolders();
  const breadcrumb = getBreadcrumb();
  const detailFile = showDetails ? files.find((f) => f.id === showDetails) : null;

  // Storage stats
  const totalSize = files.reduce((acc, f) => acc + f.size, 0);
  const imageCount = files.filter((f) => f.type === "image").length;
  const videoCount = files.filter((f) => f.type === "video").length;
  const docCount = files.filter((f) => f.type === "document").length;

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Media Library</h2>
          <div className="flex items-center gap-2">
            {mode === "select" && (
              <>
                <button
                  onClick={onClose}
                  className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSelectConfirm}
                  disabled={selectedFiles.length === 0}
                  className="px-4 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  Select ({selectedFiles.length})
                </button>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search files..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>

          {/* Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="all">All Types</option>
            <option value="image">Images</option>
            <option value="video">Videos</option>
            <option value="document">Documents</option>
            <option value="audio">Audio</option>
          </select>

          {/* Sort */}
          <div className="flex items-center gap-1">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="date">Date</option>
              <option value="name">Name</option>
              <option value="size">Size</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {sortOrder === "asc" ? (
                <SortAsc size={18} className="text-gray-600 dark:text-gray-400" />
              ) : (
                <SortDesc size={18} className="text-gray-600 dark:text-gray-400" />
              )}
            </button>
          </div>

          {/* View mode */}
          <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded ${
                viewMode === "grid" ? "bg-white dark:bg-gray-700 shadow" : ""
              }`}
            >
              <Grid size={18} className="text-gray-600 dark:text-gray-400" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded ${
                viewMode === "list" ? "bg-white dark:bg-gray-700 shadow" : ""
              }`}
            >
              <List size={18} className="text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
          {/* Upload button */}
          <div className="p-4">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Upload size={18} />
              Upload Files
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
            />
          </div>

          {/* Quick stats */}
          <div className="px-4 pb-4">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                  <HardDrive size={14} /> Storage
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {formatSize(totalSize)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                  <Image size={14} /> Images
                </span>
                <span className="font-medium text-gray-900 dark:text-white">{imageCount}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                  <Video size={14} /> Videos
                </span>
                <span className="font-medium text-gray-900 dark:text-white">{videoCount}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                  <File size={14} /> Documents
                </span>
                <span className="font-medium text-gray-900 dark:text-white">{docCount}</span>
              </div>
            </div>
          </div>

          {/* Folder tree */}
          <div className="px-4 pb-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Folders</h3>
              <button
                onClick={() => setShowNewFolderModal(true)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <FolderPlus size={16} className="text-gray-500" />
              </button>
            </div>

            <div className="space-y-1">
              <button
                onClick={() => setCurrentFolderId(null)}
                className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-left ${
                  currentFolderId === null
                    ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400"
                    : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                }`}
              >
                <Folder size={16} />
                <span className="text-sm">All Files</span>
              </button>

              {folders
                .filter((f) => f.parentId === null)
                .map((folder) => (
                  <FolderItem
                    key={folder.id}
                    folder={folder}
                    folders={folders}
                    currentFolderId={currentFolderId}
                    onSelect={setCurrentFolderId}
                    level={0}
                  />
                ))}
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Breadcrumb */}
          <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700 flex items-center gap-1 text-sm">
            {breadcrumb.map((crumb, index) => (
              <span key={crumb.id || "root"} className="flex items-center">
                {index > 0 && <ChevronRight size={14} className="mx-1 text-gray-400" />}
                <button
                  onClick={() => setCurrentFolderId(crumb.id)}
                  className={`hover:text-blue-600 ${
                    index === breadcrumb.length - 1
                      ? "font-medium text-gray-900 dark:text-white"
                      : "text-gray-600 dark:text-gray-400"
                  }`}
                >
                  {crumb.name}
                </button>
              </span>
            ))}
          </div>

          {/* Actions bar */}
          {selectedFiles.length > 0 && (
            <div className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-100 dark:border-blue-900 flex items-center justify-between">
              <span className="text-sm text-blue-700 dark:text-blue-400">
                {selectedFiles.length} selected
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => deleteFiles(selectedFiles)}
                  className="p-1.5 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 rounded"
                >
                  <Trash2 size={16} />
                </button>
                <button
                  onClick={() => setSelectedFiles([])}
                  className="p-1.5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Drop zone */}
          <div
            ref={dropZoneRef}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className="flex-1 overflow-y-auto p-4"
          >
            {/* Upload progress */}
            {Object.keys(uploadProgress).length > 0 && (
              <div className="mb-4 space-y-2">
                {Object.entries(uploadProgress).map(([id, progress]) => (
                  <div key={id} className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-700 dark:text-gray-300">Uploading...</span>
                      <span className="text-gray-500">{progress}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Folders */}
            {visibleFolders.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Folders
                </h3>
                <div className="grid grid-cols-4 gap-4">
                  {visibleFolders.map((folder) => (
                    <button
                      key={folder.id}
                      onClick={() => setCurrentFolderId(folder.id)}
                      className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-left"
                    >
                      <Folder size={24} className="text-blue-500" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{folder.name}</p>
                        <p className="text-xs text-gray-500">{folder.itemCount} items</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Files */}
            {visibleFiles.length === 0 && visibleFolders.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                <Upload size={48} className="mb-4 opacity-50" />
                <p className="text-lg mb-2">Drop files here to upload</p>
                <p className="text-sm">or click the upload button</p>
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-4 gap-4">
                {visibleFiles.map((file) => {
                  const Icon = getFileIcon(file.type);
                  const isSelected = selectedFiles.includes(file.id);

                  return (
                    <div
                      key={file.id}
                      onClick={() => toggleFileSelection(file.id)}
                      className={`relative group cursor-pointer rounded-lg overflow-hidden border-2 transition-colors ${
                        isSelected
                          ? "border-blue-500"
                          : "border-transparent hover:border-gray-300 dark:hover:border-gray-600"
                      }`}
                    >
                      {/* Thumbnail */}
                      <div className="aspect-square bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                        {file.thumbnailUrl ? (
                          <img
                            src={file.thumbnailUrl}
                            alt={file.alt || file.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Icon size={48} className="text-gray-400" />
                        )}
                      </div>

                      {/* Selection indicator */}
                      <div
                        className={`absolute top-2 left-2 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          isSelected
                            ? "bg-blue-500 border-blue-500"
                            : "border-white bg-black/20 opacity-0 group-hover:opacity-100"
                        }`}
                      >
                        {isSelected && <Check size={12} className="text-white" />}
                      </div>

                      {/* Actions */}
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 flex gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowDetails(file.id);
                          }}
                          className="p-1 bg-white dark:bg-gray-800 rounded shadow hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <Info size={14} className="text-gray-600 dark:text-gray-400" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            copyUrl(file.url);
                          }}
                          className="p-1 bg-white dark:bg-gray-800 rounded shadow hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <Link size={14} className="text-gray-600 dark:text-gray-400" />
                        </button>
                      </div>

                      {/* Info */}
                      <div className="p-2 bg-white dark:bg-gray-800">
                        {editingName === file.id ? (
                          <input
                            type="text"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") renameFile(file.id);
                              if (e.key === "Escape") setEditingName(null);
                            }}
                            onBlur={() => renameFile(file.id)}
                            autoFocus
                            className="w-full text-sm px-1 border-b border-blue-500 bg-transparent text-gray-900 dark:text-white focus:outline-none"
                          />
                        ) : (
                          <p
                            className="text-sm font-medium text-gray-900 dark:text-white truncate"
                            onDoubleClick={() => {
                              setEditingName(file.id);
                              setNewName(file.name);
                            }}
                          >
                            {file.name}
                          </p>
                        )}
                        <p className="text-xs text-gray-500">{formatSize(file.size)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-1">
                {visibleFiles.map((file) => {
                  const Icon = getFileIcon(file.type);
                  const isSelected = selectedFiles.includes(file.id);

                  return (
                    <div
                      key={file.id}
                      onClick={() => toggleFileSelection(file.id)}
                      className={`flex items-center gap-4 p-3 rounded-lg cursor-pointer ${
                        isSelected
                          ? "bg-blue-50 dark:bg-blue-900/20"
                          : "hover:bg-gray-50 dark:hover:bg-gray-800"
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                          isSelected
                            ? "bg-blue-500 border-blue-500"
                            : "border-gray-300 dark:border-gray-600"
                        }`}
                      >
                        {isSelected && <Check size={12} className="text-white" />}
                      </div>

                      {file.thumbnailUrl ? (
                        <img
                          src={file.thumbnailUrl}
                          alt={file.alt || file.name}
                          className="w-10 h-10 rounded object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center">
                          <Icon size={20} className="text-gray-400" />
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 dark:text-white truncate">
                          {file.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {file.type} • {formatSize(file.size)}
                        </p>
                      </div>

                      <div className="text-sm text-gray-500">
                        {file.createdAt.toLocaleDateString()}
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowDetails(file.id);
                          }}
                          className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                        >
                          <Info size={16} className="text-gray-500" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            copyUrl(file.url);
                          }}
                          className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                        >
                          <Copy size={16} className="text-gray-500" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteFiles([file.id]);
                          }}
                          className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/20 rounded"
                        >
                          <Trash2 size={16} className="text-red-500" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Details sidebar */}
        {detailFile && (
          <div className="w-80 border-l border-gray-200 dark:border-gray-700 overflow-y-auto bg-white dark:bg-gray-800">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 dark:text-white">Details</h3>
                <button
                  onClick={() => setShowDetails(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Preview */}
              <div className="mb-4">
                {detailFile.thumbnailUrl ? (
                  <img
                    src={detailFile.url}
                    alt={detailFile.alt || detailFile.name}
                    className="w-full rounded-lg"
                  />
                ) : (
                  <div className="aspect-video bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                    {(() => {
                      const Icon = getFileIcon(detailFile.type);
                      return <Icon size={48} className="text-gray-400" />;
                    })()}
                  </div>
                )}
              </div>

              {/* File info */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Filename
                  </label>
                  <p className="text-sm text-gray-900 dark:text-white break-all">
                    {detailFile.name}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Type
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white">{detailFile.mimeType}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Size
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {formatSize(detailFile.size)}
                    </p>
                  </div>
                </div>

                {detailFile.width && detailFile.height && (
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Dimensions
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {detailFile.width} x {detailFile.height}
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Alt Text
                  </label>
                  <input
                    type="text"
                    value={detailFile.alt || ""}
                    onChange={(e) => {
                      setFiles((prev) =>
                        prev.map((f) =>
                          f.id === detailFile.id ? { ...f, alt: e.target.value } : f
                        )
                      );
                    }}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Describe the image"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                    URL
                  </label>
                  <div className="flex gap-1">
                    <input
                      type="text"
                      value={detailFile.url}
                      readOnly
                      className="flex-1 px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    <button
                      onClick={() => copyUrl(detailFile.url)}
                      className="p-1.5 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <Copy size={14} className="text-gray-600 dark:text-gray-400" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Created
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {detailFile.createdAt.toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Used
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {detailFile.usageCount} times
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-200 dark:border-gray-700 flex gap-2">
                  <button className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300">
                    <Download size={14} />
                    Download
                  </button>
                  <button
                    onClick={() => deleteFiles([detailFile.id])}
                    className="flex items-center justify-center gap-1 px-3 py-2 text-sm border border-red-300 dark:border-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600"
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* New folder modal */}
      {showNewFolderModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Create New Folder
            </h3>
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && createFolder()}
              placeholder="Folder name"
              autoFocus
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white mb-4"
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setShowNewFolderModal(false);
                  setNewFolderName("");
                }}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={createFolder}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Recursive folder item component
function FolderItem({
  folder,
  folders,
  currentFolderId,
  onSelect,
  level,
}: {
  folder: MediaFolder;
  folders: MediaFolder[];
  currentFolderId: string | null;
  onSelect: (id: string) => void;
  level: number;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const children = folders.filter((f) => f.parentId === folder.id);
  const hasChildren = children.length > 0;
  const isActive = currentFolderId === folder.id;

  return (
    <div>
      <button
        onClick={() => {
          onSelect(folder.id);
          if (hasChildren) setIsExpanded(!isExpanded);
        }}
        className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-left ${
          isActive
            ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400"
            : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
        }`}
        style={{ paddingLeft: `${8 + level * 16}px` }}
      >
        {hasChildren && (
          <ChevronRight
            size={14}
            className={`transition-transform ${isExpanded ? "rotate-90" : ""}`}
          />
        )}
        {!hasChildren && <span className="w-3.5" />}
        <Folder size={16} />
        <span className="text-sm truncate">{folder.name}</span>
        <span className="ml-auto text-xs text-gray-400">{folder.itemCount}</span>
      </button>

      {isExpanded &&
        children.map((child) => (
          <FolderItem
            key={child.id}
            folder={child}
            folders={folders}
            currentFolderId={currentFolderId}
            onSelect={onSelect}
            level={level + 1}
          />
        ))}
    </div>
  );
}

export default MediaLibrary;
