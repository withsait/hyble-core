"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Eye,
  Undo,
  Redo,
  Smartphone,
  Tablet,
  Monitor,
  Settings,
  Layers,
  Palette,
  Type,
  Image,
  Square,
  Grid3X3,
  List,
  MessageSquare,
  Mail,
  MapPin,
  Video,
  Code,
  Box,
  ChevronRight,
  GripVertical,
  Trash2,
  Copy,
  Plus,
  X,
  Loader2,
  Check,
  Globe,
  Play,
  Star,
  Users,
  Calendar,
  DollarSign,
  HelpCircle,
  Newspaper,
  Share2,
  Clock,
  Award,
  Target,
  TrendingUp,
  Zap,
  Shield,
  Heart,
  ThumbsUp,
  Quote,
  FileText,
  Download,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Sparkles,
  LayoutGrid,
  Rows,
  Columns,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Underline,
  Link,
  ImagePlus,
  Heading1,
  Heading2,
  Heading3,
  ListOrdered,
  ListIcon,
  Table,
  Minus,
  CircleDot,
  ToggleLeft,
  Upload,
  Megaphone,
  Bookmark,
  Tag,
  Package,
  ShoppingCart,
  CreditCard,
  Truck,
  BarChart3,
  PieChart,
  LineChart,
  Activity,
  Search,
  Filter,
  SlidersHorizontal,
  MoreHorizontal,
  Edit3,
  Move,
  Lock,
  Unlock,
  EyeOff,
  RefreshCw,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { Card } from "@hyble/ui";

// Extended Block Types
const blockTypes = [
  // Layout
  { id: "hero", name: "Hero", icon: Box, category: "layout", description: "Etkileyici giri\u015f bolumu" },
  { id: "columns", name: "Kolonlar", icon: Columns, category: "layout", description: "2-6 sutunlu duzen" },
  { id: "grid", name: "Grid", icon: LayoutGrid, category: "layout", description: "Izgara yap\u0131s\u0131" },
  { id: "container", name: "Container", icon: Square, category: "layout", description: "Iceri\u011fi s\u0131n\u0131rla" },
  { id: "divider", name: "Ayirici", icon: Minus, category: "layout", description: "Bolumler aras\u0131 cizgi" },
  { id: "spacer", name: "Bosluk", icon: Rows, category: "layout", description: "Dikey bo\u015fluk" },

  // Content
  { id: "text", name: "Metin", icon: Type, category: "content", description: "Paragraf ve metin" },
  { id: "heading", name: "Baslik", icon: Heading1, category: "content", description: "H1-H6 ba\u015fl\u0131k" },
  { id: "image", name: "Gorsel", icon: Image, category: "content", description: "Tek gorsel" },
  { id: "gallery", name: "Galeri", icon: Grid3X3, category: "content", description: "Gorsel galerisi" },
  { id: "video", name: "Video", icon: Video, category: "content", description: "YouTube, Vimeo" },
  { id: "button", name: "Buton", icon: Square, category: "content", description: "Aksiyon butonu" },
  { id: "icon", name: "Ikon", icon: Star, category: "content", description: "Tek ikon" },
  { id: "list", name: "Liste", icon: ListIcon, category: "content", description: "Madde listesi" },
  { id: "quote", name: "Alinti", icon: Quote, category: "content", description: "Al\u0131nt\u0131 blogu" },
  { id: "code", name: "Kod", icon: Code, category: "content", description: "Kod blogu" },

  // Sections
  { id: "features", name: "Ozellikler", icon: Zap, category: "sections", description: "Ozellik kartlar\u0131" },
  { id: "services", name: "Hizmetler", icon: Package, category: "sections", description: "Hizmet listesi" },
  { id: "about", name: "Hakkimizda", icon: Users, category: "sections", description: "Tan\u0131t\u0131m bolumu" },
  { id: "team", name: "Ekip", icon: Users, category: "sections", description: "Ekip uyeleri" },
  { id: "testimonials", name: "Yorumlar", icon: MessageSquare, category: "sections", description: "Musteri yorumlar\u0131" },
  { id: "pricing", name: "Fiyatlar", icon: DollarSign, category: "sections", description: "Fiyat tablosu" },
  { id: "faq", name: "SSS", icon: HelpCircle, category: "sections", description: "S\u0131k sorulanlar" },
  { id: "stats", name: "Istatistikler", icon: BarChart3, category: "sections", description: "Say\u0131sal veriler" },
  { id: "timeline", name: "Zaman Cizgisi", icon: Clock, category: "sections", description: "Kronolojik ak\u0131\u015f" },
  { id: "process", name: "Surec", icon: Target, category: "sections", description: "Ad\u0131m ad\u0131m surec" },
  { id: "cta", name: "CTA", icon: Megaphone, category: "sections", description: "Cagr\u0131 aksiyonu" },
  { id: "clients", name: "Musteriler", icon: Award, category: "sections", description: "Logo galerisi" },

  // E-Commerce
  { id: "products", name: "Urunler", icon: ShoppingCart, category: "ecommerce", description: "Urun listesi" },
  { id: "product-card", name: "Urun Karti", icon: Package, category: "ecommerce", description: "Tek urun" },
  { id: "cart", name: "Sepet", icon: ShoppingCart, category: "ecommerce", description: "Al\u0131\u015fveri\u015f sepeti" },
  { id: "checkout", name: "Odeme", icon: CreditCard, category: "ecommerce", description: "Odeme formu" },

  // Forms & Interactive
  { id: "contact", name: "Iletisim", icon: Mail, category: "forms", description: "Ileti\u015fim formu" },
  { id: "newsletter", name: "Bulten", icon: Newspaper, category: "forms", description: "E-posta aboneli\u011fi" },
  { id: "search", name: "Arama", icon: Search, category: "forms", description: "Arama kutusu" },
  { id: "booking", name: "Rezervasyon", icon: Calendar, category: "forms", description: "Randevu/rezervasyon" },
  { id: "login", name: "Giris", icon: Lock, category: "forms", description: "Giri\u015f formu" },
  { id: "register", name: "Kayit", icon: Users, category: "forms", description: "Kay\u0131t formu" },

  // Media
  { id: "map", name: "Harita", icon: MapPin, category: "media", description: "Google Maps" },
  { id: "social", name: "Sosyal", icon: Share2, category: "media", description: "Sosyal medya" },
  { id: "embed", name: "Embed", icon: Code, category: "media", description: "Harici icerik" },
  { id: "audio", name: "Ses", icon: Play, category: "media", description: "Ses oynat\u0131c\u0131" },
  { id: "file", name: "Dosya", icon: FileText, category: "media", description: "Dosya indirme" },

  // Blog
  { id: "blog-posts", name: "Blog Yazilari", icon: Newspaper, category: "blog", description: "Yaz\u0131 listesi" },
  { id: "blog-card", name: "Blog Karti", icon: FileText, category: "blog", description: "Tek yaz\u0131" },
  { id: "categories", name: "Kategoriler", icon: Tag, category: "blog", description: "Kategori listesi" },
  { id: "tags", name: "Etiketler", icon: Bookmark, category: "blog", description: "Etiket bulutu" },

  // Advanced
  { id: "tabs", name: "Sekmeler", icon: Rows, category: "advanced", description: "Sekmeli icerik" },
  { id: "accordion", name: "Akordeon", icon: ChevronDown, category: "advanced", description: "Ac\u0131l\u0131r icerik" },
  { id: "slider", name: "Slider", icon: Play, category: "advanced", description: "Gorsel kayd\u0131r\u0131c\u0131" },
  { id: "countdown", name: "Geri Sayim", icon: Clock, category: "advanced", description: "Geri say\u0131m" },
  { id: "progress", name: "Ilerleme", icon: Activity, category: "advanced", description: "\u0130lerleme cubugu" },
  { id: "popup", name: "Popup", icon: Maximize2, category: "advanced", description: "Ac\u0131l\u0131r pencere" },
  { id: "table", name: "Tablo", icon: Table, category: "advanced", description: "Veri tablosu" },
  { id: "html", name: "HTML", icon: Code, category: "advanced", description: "Ozel HTML" },
];

const blockCategories = [
  { id: "layout", name: "Duzen", icon: LayoutGrid },
  { id: "content", name: "Icerik", icon: Type },
  { id: "sections", name: "Bolumler", icon: Layers },
  { id: "ecommerce", name: "E-Ticaret", icon: ShoppingCart },
  { id: "forms", name: "Formlar", icon: Mail },
  { id: "media", name: "Medya", icon: Image },
  { id: "blog", name: "Blog", icon: Newspaper },
  { id: "advanced", name: "Gelismis", icon: Code },
];

interface Block {
  id: string;
  type: string;
  content: Record<string, any>;
  style: Record<string, any>;
  settings?: Record<string, any>;
}

interface Page {
  id: string;
  title: string;
  slug: string;
  isPublished: boolean;
  blocks: Block[];
}

type DeviceView = "desktop" | "tablet" | "mobile";
type SidebarTab = "blocks" | "pages" | "settings" | "layers" | "styles";

export default function SiteEditorPage() {
  const params = useParams();
  const router = useRouter();
  const websiteId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pages, setPages] = useState<Page[]>([]);
  const [currentPage, setCurrentPage] = useState<Page | null>(null);
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);
  const [deviceView, setDeviceView] = useState<DeviceView>("desktop");
  const [showSidebar, setShowSidebar] = useState(true);
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>("blocks");
  const [history, setHistory] = useState<Page[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [draggedBlock, setDraggedBlock] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [showPropertiesPanel, setShowPropertiesPanel] = useState(true);
  const [expandedCategory, setExpandedCategory] = useState<string | null>("layout");
  const [searchBlocks, setSearchBlocks] = useState("");
  const [zoom, setZoom] = useState(100);

  // Load website data
  useEffect(() => {
    setLoading(false);
    const initialPage: Page = {
      id: "home",
      title: "Ana Sayfa",
      slug: "/",
      isPublished: true,
      blocks: [
        {
          id: "hero-1",
          type: "hero",
          content: {
            title: "Web Sitenize Hos Geldiniz",
            subtitle: "Modern ve profesyonel web sitesi cozumleri",
            buttonText: "Baslayin",
            buttonLink: "#contact",
            secondaryButtonText: "Daha Fazla",
            secondaryButtonLink: "#about",
            backgroundType: "gradient",
            alignment: "center",
          },
          style: {
            backgroundColor: "#3b82f6",
            backgroundGradient: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
            textColor: "#ffffff",
            padding: "120px",
            minHeight: "90vh",
          },
          settings: {
            animation: "fade-up",
            fullWidth: true,
          },
        },
        {
          id: "features-1",
          type: "features",
          content: {
            title: "Ozelliklerimiz",
            subtitle: "Neden bizi tercih etmelisiniz?",
            features: [
              { icon: "zap", title: "Hizli", description: "Yildirim hizinda yukleme sureleri" },
              { icon: "shield", title: "Guvenli", description: "SSL sertifikasi ile koruma" },
              { icon: "users", title: "Destek", description: "7/24 teknik destek hizmeti" },
              { icon: "star", title: "Kalite", description: "En yuksek kalite standartlari" },
            ],
            columns: 4,
            style: "cards",
          },
          style: {
            backgroundColor: "#ffffff",
            textColor: "#1e293b",
            padding: "80px",
          },
        },
        {
          id: "about-1",
          type: "about",
          content: {
            title: "Hakkimizda",
            subtitle: "Bizi taniyin",
            text: "Profesyonel ekibimiz ve yenilikci yaklasimimizla sizlere en iyi hizmeti sunmak icin calisiyoruz. 10+ yillik deneyimimizle sektorun oncu firmasi olarak hizmet veriyoruz.",
            image: "",
            layout: "image-right",
            stats: [
              { value: "10+", label: "Yillik Deneyim" },
              { value: "500+", label: "Mutlu Musteri" },
              { value: "1000+", label: "Proje" },
            ],
          },
          style: {
            backgroundColor: "#f8fafc",
            textColor: "#1e293b",
            padding: "80px",
          },
        },
        {
          id: "testimonials-1",
          type: "testimonials",
          content: {
            title: "Musteri Yorumlari",
            subtitle: "Musterilerimiz ne diyor?",
            testimonials: [
              {
                name: "Ahmet Yilmaz",
                role: "CEO, Tech Corp",
                avatar: "",
                text: "Mukkemmel bir hizmet aldik. Kesinlikle tavsiye ederim.",
                rating: 5,
              },
              {
                name: "Ayse Kaya",
                role: "Pazarlama Muduru",
                avatar: "",
                text: "Profesyonel yaklasim ve hizli teslimat. Cok memnunuz.",
                rating: 5,
              },
              {
                name: "Mehmet Demir",
                role: "Girisimci",
                avatar: "",
                text: "Beklentilerimin cok ustunde bir sonuc aldim.",
                rating: 5,
              },
            ],
            layout: "carousel",
          },
          style: {
            backgroundColor: "#ffffff",
            textColor: "#1e293b",
            padding: "80px",
          },
        },
        {
          id: "cta-1",
          type: "cta",
          content: {
            title: "Hemen Baslayin",
            subtitle: "Sizinle calismak icin sabirsizlaniyoruz",
            buttonText: "Iletisime Gecin",
            buttonLink: "#contact",
          },
          style: {
            backgroundColor: "#8b5cf6",
            textColor: "#ffffff",
            padding: "100px",
          },
        },
        {
          id: "contact-1",
          type: "contact",
          content: {
            title: "Iletisim",
            subtitle: "Bizimle iletisime gecin",
            email: "info@example.com",
            phone: "+90 (212) 123 45 67",
            address: "Istanbul, Turkiye",
            showMap: true,
            showSocial: true,
          },
          style: {
            backgroundColor: "#f8fafc",
            textColor: "#1e293b",
            padding: "80px",
          },
        },
      ],
    };
    setPages([initialPage]);
    setCurrentPage(initialPage);
    setHistory([[initialPage]]);
    setHistoryIndex(0);
  }, [websiteId]);

  // Save to history
  const saveToHistory = useCallback((newPages: Page[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newPages);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  // Undo
  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      const prevPages = history[historyIndex - 1];
      if (prevPages && prevPages.length > 0) {
        setPages(prevPages);
        const foundPage = prevPages.find(p => p.id === currentPage?.id);
        setCurrentPage(foundPage ?? prevPages[0] ?? null);
      }
    }
  };

  // Redo
  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      const nextPages = history[historyIndex + 1];
      if (nextPages && nextPages.length > 0) {
        setPages(nextPages);
        const foundPage = nextPages.find(p => p.id === currentPage?.id);
        setCurrentPage(foundPage ?? nextPages[0] ?? null);
      }
    }
  };

  // Add block
  const handleAddBlock = (blockType: string, afterBlockId?: string) => {
    if (!currentPage) return;

    const newBlock: Block = {
      id: `${blockType}-${Date.now()}`,
      type: blockType,
      content: getDefaultContent(blockType),
      style: getDefaultStyle(blockType),
      settings: getDefaultSettings(blockType),
    };

    let newBlocks: Block[];
    if (afterBlockId) {
      const index = currentPage.blocks.findIndex(b => b.id === afterBlockId);
      newBlocks = [...currentPage.blocks];
      newBlocks.splice(index + 1, 0, newBlock);
    } else {
      newBlocks = [...currentPage.blocks, newBlock];
    }

    const updatedPage = { ...currentPage, blocks: newBlocks };
    const updatedPages = pages.map(p => p.id === currentPage.id ? updatedPage : p);
    setPages(updatedPages);
    setCurrentPage(updatedPage);
    setSelectedBlock(newBlock.id);
    saveToHistory(updatedPages);
  };

  // Delete block
  const handleDeleteBlock = (blockId: string) => {
    if (!currentPage) return;

    const updatedPage = {
      ...currentPage,
      blocks: currentPage.blocks.filter(b => b.id !== blockId),
    };

    const updatedPages = pages.map(p => p.id === currentPage.id ? updatedPage : p);
    setPages(updatedPages);
    setCurrentPage(updatedPage);
    setSelectedBlock(null);
    saveToHistory(updatedPages);
  };

  // Duplicate block
  const handleDuplicateBlock = (blockId: string) => {
    if (!currentPage) return;

    const blockIndex = currentPage.blocks.findIndex(b => b.id === blockId);
    if (blockIndex === -1) return;

    const originalBlock = currentPage.blocks[blockIndex];
    if (!originalBlock) return;

    const newBlock: Block = {
      ...JSON.parse(JSON.stringify(originalBlock)),
      id: `${originalBlock.type}-${Date.now()}`,
    };

    const newBlocks = [...currentPage.blocks];
    newBlocks.splice(blockIndex + 1, 0, newBlock);

    const updatedPage = { ...currentPage, blocks: newBlocks };
    const updatedPages = pages.map(p => p.id === currentPage.id ? updatedPage : p);
    setPages(updatedPages);
    setCurrentPage(updatedPage);
    setSelectedBlock(newBlock.id);
    saveToHistory(updatedPages);
  };

  // Move block
  const handleMoveBlock = (blockId: string, direction: "up" | "down") => {
    if (!currentPage) return;

    const blockIndex = currentPage.blocks.findIndex(b => b.id === blockId);
    if (blockIndex === -1) return;
    if (direction === "up" && blockIndex === 0) return;
    if (direction === "down" && blockIndex === currentPage.blocks.length - 1) return;

    const newBlocks = [...currentPage.blocks];
    const swapIndex = direction === "up" ? blockIndex - 1 : blockIndex + 1;
    const blockA = newBlocks[blockIndex];
    const blockB = newBlocks[swapIndex];
    if (blockA && blockB) {
      newBlocks[blockIndex] = blockB;
      newBlocks[swapIndex] = blockA;
    }

    const updatedPage = { ...currentPage, blocks: newBlocks };
    const updatedPages = pages.map(p => p.id === currentPage.id ? updatedPage : p);
    setPages(updatedPages);
    setCurrentPage(updatedPage);
    saveToHistory(updatedPages);
  };

  // Save
  const handleSave = async () => {
    try {
      setSaving(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
    } finally {
      setSaving(false);
    }
  };

  // Add new page
  const handleAddPage = () => {
    const newPage: Page = {
      id: `page-${Date.now()}`,
      title: "Yeni Sayfa",
      slug: `/yeni-sayfa-${pages.length + 1}`,
      isPublished: false,
      blocks: [],
    };
    const updatedPages = [...pages, newPage];
    setPages(updatedPages);
    setCurrentPage(newPage);
    saveToHistory(updatedPages);
  };

  // Get preview width
  const getPreviewWidth = () => {
    switch (deviceView) {
      case "mobile": return "375px";
      case "tablet": return "768px";
      default: return "100%";
    }
  };

  // Filter blocks by search
  const filteredBlocks = searchBlocks
    ? blockTypes.filter(b =>
        b.name.toLowerCase().includes(searchBlocks.toLowerCase()) ||
        b.description.toLowerCase().includes(searchBlocks.toLowerCase())
      )
    : blockTypes;

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-900">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-slate-900 overflow-hidden">
      {/* Toolbar */}
      <div className="h-14 bg-slate-800 border-b border-slate-700 flex items-center justify-between px-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/websites")}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
            title="Geri"
          >
            <ArrowLeft className="w-5 h-5 text-slate-400" />
          </button>
          <div className="h-6 w-px bg-slate-700" />
          <button
            onClick={handleUndo}
            disabled={historyIndex <= 0}
            className="p-2 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
            title="Geri Al (Ctrl+Z)"
          >
            <Undo className="w-5 h-5 text-slate-400" />
          </button>
          <button
            onClick={handleRedo}
            disabled={historyIndex >= history.length - 1}
            className="p-2 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
            title="Ileri Al (Ctrl+Y)"
          >
            <Redo className="w-5 h-5 text-slate-400" />
          </button>
          <div className="h-6 w-px bg-slate-700" />
          <div className="flex items-center gap-1 text-sm text-slate-400">
            <span>{currentPage?.title}</span>
            <span className="text-slate-600">({currentPage?.slug})</span>
          </div>
        </div>

        {/* Device Preview */}
        <div className="flex items-center gap-2 bg-slate-700/50 rounded-lg p-1">
          {[
            { view: "desktop" as DeviceView, icon: Monitor, label: "Masaustu" },
            { view: "tablet" as DeviceView, icon: Tablet, label: "Tablet" },
            { view: "mobile" as DeviceView, icon: Smartphone, label: "Mobil" },
          ].map(({ view, icon: Icon, label }) => (
            <button
              key={view}
              onClick={() => setDeviceView(view)}
              className={`p-2 rounded transition-colors ${
                deviceView === view ? "bg-slate-600 text-white" : "text-slate-400 hover:text-slate-300"
              }`}
              title={label}
            >
              <Icon className="w-5 h-5" />
            </button>
          ))}
        </div>

        {/* Zoom */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setZoom(Math.max(50, zoom - 10))}
            className="p-1 hover:bg-slate-700 rounded text-slate-400"
          >
            <Minimize2 className="w-4 h-4" />
          </button>
          <span className="text-sm text-slate-400 w-12 text-center">{zoom}%</span>
          <button
            onClick={() => setZoom(Math.min(150, zoom + 10))}
            className="p-1 hover:bg-slate-700 rounded text-slate-400"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setPreviewMode(!previewMode)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              previewMode
                ? "bg-purple-600 text-white"
                : "bg-slate-700 text-slate-300 hover:bg-slate-600"
            }`}
          >
            {previewMode ? <X className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {previewMode ? "Duzenle" : "Onizle"}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg transition-colors"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Kaydet
          </button>
          <a
            href={`https://${websiteId}.hyble.co`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
          >
            <Globe className="w-4 h-4" />
            Yayinla
          </a>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        {showSidebar && !previewMode && (
          <div className="w-80 bg-slate-800 border-r border-slate-700 flex flex-col flex-shrink-0">
            {/* Sidebar Tabs */}
            <div className="flex border-b border-slate-700">
              {[
                { id: "blocks" as SidebarTab, icon: Plus, label: "Bloklar" },
                { id: "layers" as SidebarTab, icon: Layers, label: "Katmanlar" },
                { id: "pages" as SidebarTab, icon: FileText, label: "Sayfalar" },
                { id: "styles" as SidebarTab, icon: Palette, label: "Stiller" },
                { id: "settings" as SidebarTab, icon: Settings, label: "Ayarlar" },
              ].map(({ id, icon: Icon, label }) => (
                <button
                  key={id}
                  onClick={() => setSidebarTab(id)}
                  className={`flex-1 py-3 flex flex-col items-center gap-1 text-xs transition-colors ${
                    sidebarTab === id
                      ? "text-blue-400 border-b-2 border-blue-400 bg-slate-700/50"
                      : "text-slate-400 hover:text-slate-300"
                  }`}
                  title={label}
                >
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                </button>
              ))}
            </div>

            {/* Sidebar Content */}
            <div className="flex-1 overflow-y-auto">
              {/* Blocks Tab */}
              {sidebarTab === "blocks" && (
                <div className="p-4">
                  {/* Search */}
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Blok ara..."
                      value={searchBlocks}
                      onChange={(e) => setSearchBlocks(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* AI Generate Button */}
                  <button
                    onClick={() => router.push(`/websites/new/ai`)}
                    className="w-full flex items-center justify-center gap-2 p-3 mb-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg transition-colors"
                  >
                    <Sparkles className="w-4 h-4" />
                    AI ile Blok Olustur
                  </button>

                  {/* Categories */}
                  <div className="space-y-2">
                    {blockCategories.map((category) => {
                      const categoryBlocks = filteredBlocks.filter(b => b.category === category.id);
                      if (categoryBlocks.length === 0) return null;

                      const Icon = category.icon;
                      const isExpanded = expandedCategory === category.id;

                      return (
                        <div key={category.id} className="border border-slate-700 rounded-lg overflow-hidden">
                          <button
                            onClick={() => setExpandedCategory(isExpanded ? null : category.id)}
                            className="w-full flex items-center justify-between p-3 bg-slate-700/50 hover:bg-slate-700 transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              <Icon className="w-4 h-4 text-slate-400" />
                              <span className="text-sm font-medium text-slate-300">{category.name}</span>
                              <span className="text-xs text-slate-500">({categoryBlocks.length})</span>
                            </div>
                            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                          </button>

                          {isExpanded && (
                            <div className="p-2 grid grid-cols-2 gap-2 bg-slate-800/50">
                              {categoryBlocks.map((block) => {
                                const BlockIcon = block.icon;
                                return (
                                  <button
                                    key={block.id}
                                    onClick={() => handleAddBlock(block.id)}
                                    draggable
                                    onDragStart={() => setDraggedBlock(block.id)}
                                    onDragEnd={() => setDraggedBlock(null)}
                                    className="flex flex-col items-center gap-2 p-3 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-colors cursor-grab active:cursor-grabbing group"
                                    title={block.description}
                                  >
                                    <BlockIcon className="w-5 h-5 text-slate-400 group-hover:text-blue-400" />
                                    <span className="text-xs text-slate-300 text-center">{block.name}</span>
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Layers Tab */}
              {sidebarTab === "layers" && (
                <div className="p-4">
                  <h3 className="text-sm font-medium text-slate-300 mb-3">Blok Siralamas\u0131</h3>
                  <div className="space-y-1">
                    {currentPage?.blocks.map((block, index) => {
                      const blockType = blockTypes.find(b => b.id === block.type);
                      const Icon = blockType?.icon || Box;

                      return (
                        <div
                          key={block.id}
                          onClick={() => setSelectedBlock(block.id)}
                          className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                            selectedBlock === block.id
                              ? "bg-blue-600/20 border border-blue-500"
                              : "hover:bg-slate-700 border border-transparent"
                          }`}
                        >
                          <GripVertical className="w-4 h-4 text-slate-500 cursor-grab" />
                          <Icon className="w-4 h-4 text-slate-400" />
                          <span className="text-sm text-slate-300 flex-1 truncate">
                            {blockType?.name || block.type}
                          </span>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={(e) => { e.stopPropagation(); handleMoveBlock(block.id, "up"); }}
                              disabled={index === 0}
                              className="p-1 hover:bg-slate-600 disabled:opacity-30 rounded"
                            >
                              <ChevronUp className="w-3 h-3 text-slate-400" />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleMoveBlock(block.id, "down"); }}
                              disabled={index === currentPage.blocks.length - 1}
                              className="p-1 hover:bg-slate-600 disabled:opacity-30 rounded"
                            >
                              <ChevronDown className="w-3 h-3 text-slate-400" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Pages Tab */}
              {sidebarTab === "pages" && (
                <div className="p-4">
                  <div className="space-y-2">
                    {pages.map((page) => (
                      <button
                        key={page.id}
                        onClick={() => setCurrentPage(page)}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                          currentPage?.id === page.id
                            ? "bg-blue-600/20 text-blue-400 border border-blue-500"
                            : "text-slate-300 hover:bg-slate-700 border border-transparent"
                        }`}
                      >
                        <FileText className="w-4 h-4" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{page.title}</p>
                          <p className="text-xs text-slate-500 truncate">{page.slug}</p>
                        </div>
                        {page.isPublished && <Check className="w-4 h-4 text-green-400" />}
                      </button>
                    ))}
                    <button
                      onClick={handleAddPage}
                      className="w-full flex items-center justify-center gap-2 p-3 border-2 border-dashed border-slate-600 hover:border-slate-500 rounded-lg text-slate-400 hover:text-slate-300 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Yeni Sayfa
                    </button>
                  </div>
                </div>
              )}

              {/* Styles Tab */}
              {sidebarTab === "styles" && (
                <div className="p-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Ana Renk
                    </label>
                    <div className="flex gap-2">
                      {["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"].map((color) => (
                        <button
                          key={color}
                          className="w-8 h-8 rounded-lg border-2 border-transparent hover:border-white transition-colors"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Font Ailesi
                    </label>
                    <select className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm">
                      <option>Inter</option>
                      <option>Poppins</option>
                      <option>Roboto</option>
                      <option>Open Sans</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Kose Yuvarligi
                    </label>
                    <select className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm">
                      <option value="0">Yok</option>
                      <option value="4">Kucuk (4px)</option>
                      <option value="8">Orta (8px)</option>
                      <option value="12">Buyuk (12px)</option>
                      <option value="16">Cok Buyuk (16px)</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Settings Tab */}
              {sidebarTab === "settings" && (
                <div className="p-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Site Basligi
                    </label>
                    <input
                      type="text"
                      defaultValue="Web Sitem"
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Favicon
                    </label>
                    <button className="w-full flex items-center justify-center gap-2 p-4 border-2 border-dashed border-slate-600 hover:border-slate-500 rounded-lg text-slate-400 hover:text-slate-300 transition-colors">
                      <Upload className="w-5 h-5" />
                      <span className="text-sm">Favicon Yukle</span>
                    </button>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Meta Aciklama
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Site aciklamasi..."
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Canvas */}
        <div className="flex-1 bg-slate-900 overflow-auto p-8">
          <div
            className="mx-auto bg-white min-h-full rounded-lg shadow-2xl overflow-hidden transition-all duration-300"
            style={{
              maxWidth: getPreviewWidth(),
              transform: `scale(${zoom / 100})`,
              transformOrigin: "top center",
            }}
          >
            {currentPage?.blocks.map((block, index) => (
              <div
                key={block.id}
                onClick={() => !previewMode && setSelectedBlock(block.id)}
                className={`relative group ${
                  !previewMode && selectedBlock === block.id
                    ? "ring-2 ring-blue-500"
                    : !previewMode
                    ? "hover:ring-2 hover:ring-blue-500/50"
                    : ""
                }`}
              >
                <BlockRenderer block={block} previewMode={previewMode} />

                {/* Block Controls */}
                {!previewMode && selectedBlock === block.id && (
                  <div className="absolute top-2 right-2 flex items-center gap-1 bg-slate-800 rounded-lg shadow-lg p-1 z-10">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleMoveBlock(block.id, "up"); }}
                      disabled={index === 0}
                      className="p-1.5 hover:bg-slate-700 disabled:opacity-50 rounded"
                      title="Yukari"
                    >
                      <ChevronUp className="w-4 h-4 text-slate-300" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleMoveBlock(block.id, "down"); }}
                      disabled={index === currentPage.blocks.length - 1}
                      className="p-1.5 hover:bg-slate-700 disabled:opacity-50 rounded"
                      title="Asagi"
                    >
                      <ChevronDown className="w-4 h-4 text-slate-300" />
                    </button>
                    <div className="w-px h-4 bg-slate-600" />
                    <button
                      onClick={(e) => { e.stopPropagation(); handleAddBlock(block.type, block.id); }}
                      className="p-1.5 hover:bg-slate-700 rounded"
                      title="Asagiya Ekle"
                    >
                      <Plus className="w-4 h-4 text-slate-300" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDuplicateBlock(block.id); }}
                      className="p-1.5 hover:bg-slate-700 rounded"
                      title="Kopyala"
                    >
                      <Copy className="w-4 h-4 text-slate-300" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeleteBlock(block.id); }}
                      className="p-1.5 hover:bg-red-600 rounded"
                      title="Sil"
                    >
                      <Trash2 className="w-4 h-4 text-slate-300" />
                    </button>
                  </div>
                )}

                {/* Add Block Button */}
                {!previewMode && (
                  <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleAddBlock("text", block.id); }}
                      className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white text-xs rounded-full shadow-lg hover:bg-blue-700"
                    >
                      <Plus className="w-3 h-3" />
                      Blok Ekle
                    </button>
                  </div>
                )}
              </div>
            ))}

            {/* Empty State */}
            {currentPage?.blocks.length === 0 && (
              <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
                <Box className="w-16 h-16 text-slate-300 mb-4" />
                <h3 className="text-lg font-semibold text-slate-700 mb-2">Sayfa Bos</h3>
                <p className="text-slate-500 text-center mb-4">
                  Sol panelden blok ekleyerek baslayin.
                </p>
                <button
                  onClick={() => handleAddBlock("hero")}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4" />
                  Hero Ekle
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Properties Panel */}
        {!previewMode && selectedBlock && currentPage && showPropertiesPanel && (
          <div className="w-80 bg-slate-800 border-l border-slate-700 overflow-y-auto flex-shrink-0">
            <div className="p-4 border-b border-slate-700 flex items-center justify-between">
              <h3 className="font-semibold text-white">Ozellikler</h3>
              <button
                onClick={() => setSelectedBlock(null)}
                className="p-1 hover:bg-slate-700 rounded"
              >
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>
            <div className="p-4">
              <BlockProperties
                block={currentPage.blocks.find(b => b.id === selectedBlock)!}
                onUpdate={(updates) => {
                  const updatedBlocks = currentPage.blocks.map(b =>
                    b.id === selectedBlock ? { ...b, ...updates } : b
                  );
                  const updatedPage = { ...currentPage, blocks: updatedBlocks };
                  const updatedPages = pages.map(p => p.id === currentPage.id ? updatedPage : p);
                  setPages(updatedPages);
                  setCurrentPage(updatedPage);
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Block Renderer - Renders different block types
function BlockRenderer({ block, previewMode }: { block: Block; previewMode: boolean }) {
  const { type, content, style } = block;

  const baseStyle = {
    backgroundColor: style.backgroundColor || "#ffffff",
    color: style.textColor || "#1e293b",
    padding: style.padding || "40px",
  };

  switch (type) {
    case "hero":
      return (
        <div
          className="text-center"
          style={{
            ...baseStyle,
            background: style.backgroundGradient || style.backgroundColor || "#3b82f6",
            minHeight: style.minHeight || "auto",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: style.textColor || "#ffffff" }}>
            {content.title || "Hero Basligi"}
          </h1>
          <p className="text-xl opacity-90 mb-8 max-w-2xl" style={{ color: style.textColor || "#ffffff" }}>
            {content.subtitle || "Alt baslik metni"}
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            {content.buttonText && (
              <a
                href={content.buttonLink || "#"}
                className="px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors"
              >
                {content.buttonText}
              </a>
            )}
            {content.secondaryButtonText && (
              <a
                href={content.secondaryButtonLink || "#"}
                className="px-8 py-3 bg-white/20 text-white font-semibold rounded-lg border border-white/30 hover:bg-white/30 transition-colors"
              >
                {content.secondaryButtonText}
              </a>
            )}
          </div>
        </div>
      );

    case "features":
      return (
        <div style={baseStyle}>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">{content.title || "Ozellikler"}</h2>
            {content.subtitle && <p className="text-lg opacity-70">{content.subtitle}</p>}
          </div>
          <div className={`grid grid-cols-1 md:grid-cols-${content.columns || 4} gap-8 max-w-6xl mx-auto`}>
            {(content.features || []).map((feature: any, i: number) => (
              <div key={i} className="text-center">
                <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title || `Ozellik ${i + 1}`}</h3>
                <p className="opacity-70">{feature.description || "Aciklama"}</p>
              </div>
            ))}
          </div>
        </div>
      );

    case "about":
      return (
        <div style={baseStyle}>
          <div className={`max-w-6xl mx-auto flex flex-col ${content.layout === "image-right" ? "md:flex-row" : "md:flex-row-reverse"} gap-12 items-center`}>
            <div className="flex-1">
              <h2 className="text-3xl font-bold mb-4">{content.title || "Hakkimizda"}</h2>
              {content.subtitle && <p className="text-lg text-blue-600 mb-4">{content.subtitle}</p>}
              <p className="opacity-70 mb-6">{content.text || "Hakkimizda metni..."}</p>
              {content.stats && (
                <div className="flex gap-8">
                  {content.stats.map((stat: any, i: number) => (
                    <div key={i}>
                      <p className="text-3xl font-bold text-blue-600">{stat.value}</p>
                      <p className="text-sm opacity-70">{stat.label}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="flex-1">
              {content.image ? (
                <img src={content.image} alt="About" className="rounded-xl shadow-lg" />
              ) : (
                <div className="aspect-video bg-slate-200 rounded-xl flex items-center justify-center">
                  <Image className="w-16 h-16 text-slate-400" />
                </div>
              )}
            </div>
          </div>
        </div>
      );

    case "testimonials":
      return (
        <div style={baseStyle}>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">{content.title || "Musteri Yorumlari"}</h2>
            {content.subtitle && <p className="text-lg opacity-70">{content.subtitle}</p>}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {(content.testimonials || []).map((testimonial: any, i: number) => (
              <div key={i} className="bg-white p-6 rounded-xl shadow-lg">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating || 5)].map((_, j) => (
                    <Star key={j} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="opacity-70 mb-4 italic">"{testimonial.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-slate-400" />
                  </div>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm opacity-70">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );

    case "cta":
      return (
        <div
          className="text-center"
          style={{
            ...baseStyle,
            background: style.backgroundGradient || style.backgroundColor || "#8b5cf6",
          }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: style.textColor || "#ffffff" }}>
            {content.title || "Hemen Baslayin"}
          </h2>
          {content.subtitle && (
            <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto" style={{ color: style.textColor || "#ffffff" }}>
              {content.subtitle}
            </p>
          )}
          {content.buttonText && (
            <a
              href={content.buttonLink || "#"}
              className="inline-block px-8 py-3 bg-white text-purple-600 font-semibold rounded-lg hover:bg-purple-50 transition-colors"
            >
              {content.buttonText}
            </a>
          )}
        </div>
      );

    case "contact":
      return (
        <div style={baseStyle}>
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">{content.title || "Iletisim"}</h2>
              {content.subtitle && <p className="text-lg opacity-70">{content.subtitle}</p>}
            </div>
            <div className="grid md:grid-cols-2 gap-12">
              <div>
                <div className="space-y-4 mb-8">
                  {content.email && (
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-blue-600" />
                      <span>{content.email}</span>
                    </div>
                  )}
                  {content.phone && (
                    <div className="flex items-center gap-3">
                      <MessageSquare className="w-5 h-5 text-blue-600" />
                      <span>{content.phone}</span>
                    </div>
                  )}
                  {content.address && (
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-blue-600" />
                      <span>{content.address}</span>
                    </div>
                  )}
                </div>
                {content.showMap && (
                  <div className="aspect-video bg-slate-200 rounded-xl flex items-center justify-center">
                    <MapPin className="w-12 h-12 text-slate-400" />
                  </div>
                )}
              </div>
              <form className="space-y-4">
                <input
                  type="text"
                  placeholder="Adiniz"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="email"
                  placeholder="E-posta"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <textarea
                  placeholder="Mesajiniz"
                  rows={4}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Gonder
                </button>
              </form>
            </div>
          </div>
        </div>
      );

    case "text":
      return (
        <div style={baseStyle}>
          <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: content.text || "<p>Metin icerigi...</p>" }} />
        </div>
      );

    case "divider":
      return (
        <div className="py-4 px-8" style={{ backgroundColor: style.backgroundColor }}>
          <hr className="border-slate-200" />
        </div>
      );

    case "spacer":
      return <div style={{ height: content.height || "60px", backgroundColor: style.backgroundColor }} />;

    default:
      return (
        <div className="py-8 px-8 bg-slate-100 text-center" style={baseStyle}>
          <div className="flex flex-col items-center gap-2">
            <Box className="w-8 h-8 text-slate-400" />
            <p className="text-slate-500">{type} blogu</p>
          </div>
        </div>
      );
  }
}

// Block Properties Panel
function BlockProperties({ block, onUpdate }: { block: Block; onUpdate: (updates: Partial<Block>) => void }) {
  const updateContent = (key: string, value: any) => {
    onUpdate({ content: { ...block.content, [key]: value } });
  };

  const updateStyle = (key: string, value: any) => {
    onUpdate({ style: { ...block.style, [key]: value } });
  };

  return (
    <div className="space-y-6">
      {/* Style Section */}
      <div>
        <h4 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-3">Stil</h4>
        <div className="space-y-3">
          <div>
            <label className="block text-sm text-slate-300 mb-1">Arka Plan</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={block.style.backgroundColor || "#ffffff"}
                onChange={(e) => updateStyle("backgroundColor", e.target.value)}
                className="w-10 h-10 rounded cursor-pointer border-0"
              />
              <input
                type="text"
                value={block.style.backgroundColor || "#ffffff"}
                onChange={(e) => updateStyle("backgroundColor", e.target.value)}
                className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1">Metin Rengi</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={block.style.textColor || "#1e293b"}
                onChange={(e) => updateStyle("textColor", e.target.value)}
                className="w-10 h-10 rounded cursor-pointer border-0"
              />
              <input
                type="text"
                value={block.style.textColor || "#1e293b"}
                onChange={(e) => updateStyle("textColor", e.target.value)}
                className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1">Padding</label>
            <input
              type="text"
              value={block.style.padding || "40px"}
              onChange={(e) => updateStyle("padding", e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm"
            />
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div>
        <h4 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-3">Icerik</h4>
        <div className="space-y-3">
          {block.type === "hero" && (
            <>
              <div>
                <label className="block text-sm text-slate-300 mb-1">Baslik</label>
                <input
                  type="text"
                  value={block.content.title || ""}
                  onChange={(e) => updateContent("title", e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1">Alt Baslik</label>
                <textarea
                  value={block.content.subtitle || ""}
                  onChange={(e) => updateContent("subtitle", e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm resize-none"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1">Buton Metni</label>
                <input
                  type="text"
                  value={block.content.buttonText || ""}
                  onChange={(e) => updateContent("buttonText", e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1">Buton Link</label>
                <input
                  type="text"
                  value={block.content.buttonLink || ""}
                  onChange={(e) => updateContent("buttonLink", e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm"
                />
              </div>
            </>
          )}

          {(block.type === "features" || block.type === "about" || block.type === "testimonials" || block.type === "cta" || block.type === "contact") && (
            <>
              <div>
                <label className="block text-sm text-slate-300 mb-1">Baslik</label>
                <input
                  type="text"
                  value={block.content.title || ""}
                  onChange={(e) => updateContent("title", e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1">Alt Baslik</label>
                <input
                  type="text"
                  value={block.content.subtitle || ""}
                  onChange={(e) => updateContent("subtitle", e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm"
                />
              </div>
            </>
          )}

          {block.type === "text" && (
            <div>
              <label className="block text-sm text-slate-300 mb-1">Metin</label>
              <textarea
                value={block.content.text || ""}
                onChange={(e) => updateContent("text", e.target.value)}
                rows={6}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm resize-none"
              />
            </div>
          )}

          {block.type === "spacer" && (
            <div>
              <label className="block text-sm text-slate-300 mb-1">Yukseklik</label>
              <input
                type="text"
                value={block.content.height || "60px"}
                onChange={(e) => updateContent("height", e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Default content generators
function getDefaultContent(blockType: string): Record<string, any> {
  const defaults: Record<string, Record<string, any>> = {
    hero: { title: "Hero Basligi", subtitle: "Alt baslik metni", buttonText: "Baslayin", buttonLink: "#", secondaryButtonText: "Daha Fazla", secondaryButtonLink: "#" },
    features: { title: "Ozellikler", subtitle: "Neden bizi secmelisiniz?", features: [
      { icon: "zap", title: "Hizli", description: "Yildirim hizinda" },
      { icon: "shield", title: "Guvenli", description: "SSL korumali" },
      { icon: "users", title: "Destek", description: "7/24 destek" },
      { icon: "star", title: "Kalite", description: "En iyi kalite" },
    ], columns: 4 },
    about: { title: "Hakkimizda", subtitle: "Bizi taniyin", text: "Hakkimizda metni...", layout: "image-right", stats: [
      { value: "10+", label: "Yillik Deneyim" },
      { value: "500+", label: "Mutlu Musteri" },
    ] },
    testimonials: { title: "Musteri Yorumlari", subtitle: "Ne diyorlar?", testimonials: [
      { name: "Ahmet Yilmaz", role: "CEO", text: "Harika bir hizmet!", rating: 5 },
      { name: "Ayse Kaya", role: "Mudur", text: "Cok memnunum.", rating: 5 },
    ] },
    cta: { title: "Hemen Baslayin", subtitle: "Sizinle calismak icin sabirsizlaniyoruz", buttonText: "Iletisime Gecin", buttonLink: "#contact" },
    contact: { title: "Iletisim", subtitle: "Bizimle iletisime gecin", email: "info@example.com", phone: "+90 212 123 4567", address: "Istanbul, Turkiye", showMap: true },
    text: { text: "<p>Metin icerigi buraya...</p>" },
    divider: {},
    spacer: { height: "60px" },
    pricing: { title: "Fiyatlar", plans: [] },
    faq: { title: "Sikca Sorulan Sorular", faqs: [] },
    stats: { title: "Rakamlarla Biz", stats: [] },
    team: { title: "Ekibimiz", members: [] },
    services: { title: "Hizmetlerimiz", services: [] },
    gallery: { title: "Galeri", images: [] },
    newsletter: { title: "Bultene Abone Olun", placeholder: "E-posta adresiniz", buttonText: "Abone Ol" },
  };

  return defaults[blockType] || {};
}

function getDefaultStyle(blockType: string): Record<string, any> {
  const defaults: Record<string, Record<string, any>> = {
    hero: { backgroundColor: "#3b82f6", backgroundGradient: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)", textColor: "#ffffff", padding: "120px", minHeight: "90vh" },
    cta: { backgroundColor: "#8b5cf6", textColor: "#ffffff", padding: "100px" },
    features: { backgroundColor: "#ffffff", textColor: "#1e293b", padding: "80px" },
    about: { backgroundColor: "#f8fafc", textColor: "#1e293b", padding: "80px" },
    testimonials: { backgroundColor: "#ffffff", textColor: "#1e293b", padding: "80px" },
    contact: { backgroundColor: "#f8fafc", textColor: "#1e293b", padding: "80px" },
    text: { backgroundColor: "#ffffff", textColor: "#1e293b", padding: "40px" },
    divider: { backgroundColor: "#ffffff" },
    spacer: { backgroundColor: "transparent" },
  };

  return defaults[blockType] || { backgroundColor: "#ffffff", textColor: "#1e293b", padding: "40px" };
}

function getDefaultSettings(blockType: string): Record<string, any> {
  return {
    animation: "none",
    fullWidth: blockType === "hero" || blockType === "cta",
    visible: true,
  };
}
