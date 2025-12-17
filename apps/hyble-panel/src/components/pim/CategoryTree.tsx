"use client";

import { useState } from "react";
import { Button } from "@hyble/ui";
import {
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  Plus,
  Edit,
  Trash2,
  Package
} from "lucide-react";

interface Category {
  id: string;
  nameTr: string;
  nameEn: string;
  slug: string;
  icon?: string | null;
  isActive: boolean;
  parentId?: string | null;
  _count?: { products: number };
  children?: Category[];
}

// Mock categories - will be replaced with tRPC when pim router is ready
const mockCategories: Category[] = [
  {
    id: "1",
    nameTr: "Web Hosting",
    nameEn: "Web Hosting",
    slug: "web-hosting",
    isActive: true,
    _count: { products: 5 },
  },
  {
    id: "2",
    nameTr: "VPS Sunucular",
    nameEn: "VPS Servers",
    slug: "vps-servers",
    isActive: true,
    _count: { products: 3 },
  },
  {
    id: "3",
    nameTr: "Domain",
    nameEn: "Domain",
    slug: "domain",
    isActive: true,
    _count: { products: 0 },
  },
];

interface CategoryTreeProps {
  onEdit?: (category: Category) => void;
  onAdd?: (parentId?: string) => void;
}

export function CategoryTree({ onEdit, onAdd }: CategoryTreeProps) {
  // TODO: Replace with tRPC query when pim router is ready
  const isLoading = false;
  const data = mockCategories;
  const [isDeleting, setIsDeleting] = useState(false);

  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedIds);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedIds(newExpanded);
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`"${name}" kategorisini silmek istediğinize emin misiniz?`)) {
      setIsDeleting(true);
      // TODO: Replace with tRPC mutation when pim router is ready
      await new Promise(resolve => setTimeout(resolve, 300));
      setIsDeleting(false);
    }
  };

  // Build tree structure from flat list
  const buildTree = (categories: Category[]): Category[] => {
    const map = new Map<string, Category>();
    const roots: Category[] = [];

    categories.forEach(cat => {
      map.set(cat.id, { ...cat, children: [] });
    });

    categories.forEach(cat => {
      const node = map.get(cat.id)!;
      if (cat.parentId && map.has(cat.parentId)) {
        map.get(cat.parentId)!.children!.push(node);
      } else {
        roots.push(node);
      }
    });

    return roots;
  };

  const renderCategory = (category: Category, level: number = 0) => {
    const hasChildren = category.children && category.children.length > 0;
    const isExpanded = expandedIds.has(category.id);

    return (
      <div key={category.id}>
        <div
          className={`
            flex items-center gap-2 py-2 px-3 rounded-md
            hover:bg-muted/50 transition-colors group
            ${!category.isActive ? 'opacity-50' : ''}
          `}
          style={{ paddingLeft: `${level * 20 + 12}px` }}
        >
          {/* Expand/Collapse Button */}
          <button
            onClick={() => hasChildren && toggleExpand(category.id)}
            className={`p-0.5 rounded hover:bg-muted ${hasChildren ? 'visible' : 'invisible'}`}
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
          </button>

          {/* Folder Icon */}
          {isExpanded ? (
            <FolderOpen className="h-4 w-4 text-amber-500" />
          ) : (
            <Folder className="h-4 w-4 text-amber-500" />
          )}

          {/* Category Name */}
          <div className="flex-1 min-w-0">
            <span className="font-medium text-sm">{category.nameTr}</span>
            <span className="text-xs text-muted-foreground ml-2">({category.nameEn})</span>
          </div>

          {/* Product Count */}
          {category._count && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Package className="h-3 w-3" />
              {category._count.products}
            </span>
          )}

          {/* Actions */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => onAdd?.(category.id)}
              title="Alt kategori ekle"
            >
              <Plus className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => onEdit?.(category)}
              title="Düzenle"
            >
              <Edit className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-destructive hover:text-destructive/90 hover:bg-destructive/10"
              onClick={() => handleDelete(category.id, category.nameTr)}
              title="Sil"
              disabled={isDeleting}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* Children */}
        {hasChildren && isExpanded && (
          <div>
            {category.children!.map(child => renderCategory(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8 text-muted-foreground">
        Yükleniyor...
      </div>
    );
  }

  const tree = data ? buildTree(data) : [];

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b">
        <h3 className="font-medium text-sm text-muted-foreground">Kategoriler</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onAdd?.()}
          className="h-8"
        >
          <Plus className="h-4 w-4 mr-1" />
          Yeni Kategori
        </Button>
      </div>

      {/* Tree */}
      <div className="rounded-md border bg-card">
        {tree.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <Folder className="h-8 w-8 mb-2 opacity-50" />
            <p className="text-sm">Henüz kategori yok</p>
            <Button
              variant="link"
              size="sm"
              onClick={() => onAdd?.()}
              className="mt-2"
            >
              İlk kategoriyi ekle
            </Button>
          </div>
        ) : (
          <div className="py-2">
            {tree.map(category => renderCategory(category))}
          </div>
        )}
      </div>
    </div>
  );
}
