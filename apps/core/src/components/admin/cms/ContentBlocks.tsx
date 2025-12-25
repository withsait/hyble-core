"use client";

import { useState } from "react";
import {
  Type,
  Image,
  Video,
  Link,
  List,
  Quote,
  Code,
  Layout,
  Columns,
  Star,
  Users,
  DollarSign,
  HelpCircle,
  Mail,
  MapPin,
  Calendar,
  Clock,
  BarChart3,
  FileText,
  Shield,
  Zap,
  Heart,
  ChevronDown,
  ChevronUp,
  Settings,
  Trash2,
  Copy,
  GripVertical,
  Plus,
} from "lucide-react";

// Block type definitions
export type BlockType =
  | "text"
  | "heading"
  | "image"
  | "gallery"
  | "video"
  | "button"
  | "divider"
  | "spacer"
  | "columns"
  | "accordion"
  | "tabs"
  | "testimonial"
  | "team"
  | "pricing"
  | "faq"
  | "contact"
  | "map"
  | "countdown"
  | "stats"
  | "logo-cloud"
  | "features"
  | "cta"
  | "hero"
  | "code"
  | "html";

export interface BlockDefinition {
  type: BlockType;
  name: string;
  icon: any;
  category: "basic" | "media" | "layout" | "interactive" | "marketing";
  description: string;
  defaultProps: Record<string, any>;
}

export const blockDefinitions: BlockDefinition[] = [
  // Basic blocks
  {
    type: "text",
    name: "Text",
    icon: Type,
    category: "basic",
    description: "Rich text content",
    defaultProps: {
      content: "<p>Enter your text here...</p>",
      alignment: "left",
    },
  },
  {
    type: "heading",
    name: "Heading",
    icon: Type,
    category: "basic",
    description: "Section heading",
    defaultProps: {
      text: "Heading",
      level: "h2",
      alignment: "left",
    },
  },
  {
    type: "button",
    name: "Button",
    icon: Link,
    category: "basic",
    description: "Call to action button",
    defaultProps: {
      text: "Click Me",
      url: "#",
      style: "primary",
      size: "medium",
      alignment: "left",
    },
  },
  {
    type: "divider",
    name: "Divider",
    icon: Layout,
    category: "basic",
    description: "Horizontal line separator",
    defaultProps: {
      style: "solid",
      color: "#e5e7eb",
      width: "100%",
    },
  },
  {
    type: "spacer",
    name: "Spacer",
    icon: Layout,
    category: "basic",
    description: "Vertical space",
    defaultProps: {
      height: 40,
    },
  },

  // Media blocks
  {
    type: "image",
    name: "Image",
    icon: Image,
    category: "media",
    description: "Single image",
    defaultProps: {
      src: "",
      alt: "",
      caption: "",
      size: "full",
      rounded: false,
    },
  },
  {
    type: "gallery",
    name: "Gallery",
    icon: Image,
    category: "media",
    description: "Image gallery grid",
    defaultProps: {
      images: [],
      columns: 3,
      gap: 16,
      lightbox: true,
    },
  },
  {
    type: "video",
    name: "Video",
    icon: Video,
    category: "media",
    description: "Embedded video",
    defaultProps: {
      url: "",
      type: "youtube",
      autoplay: false,
      controls: true,
    },
  },

  // Layout blocks
  {
    type: "columns",
    name: "Columns",
    icon: Columns,
    category: "layout",
    description: "Multi-column layout",
    defaultProps: {
      columns: 2,
      gap: 24,
      layout: "equal",
      content: [[], []],
    },
  },
  {
    type: "accordion",
    name: "Accordion",
    icon: ChevronDown,
    category: "layout",
    description: "Expandable sections",
    defaultProps: {
      items: [
        { title: "Section 1", content: "Content 1", open: false },
        { title: "Section 2", content: "Content 2", open: false },
      ],
      allowMultiple: false,
    },
  },
  {
    type: "tabs",
    name: "Tabs",
    icon: Layout,
    category: "layout",
    description: "Tabbed content",
    defaultProps: {
      tabs: [
        { label: "Tab 1", content: "Content 1" },
        { label: "Tab 2", content: "Content 2" },
      ],
      style: "default",
    },
  },

  // Interactive blocks
  {
    type: "faq",
    name: "FAQ",
    icon: HelpCircle,
    category: "interactive",
    description: "Frequently asked questions",
    defaultProps: {
      title: "Frequently Asked Questions",
      items: [
        { question: "Question 1?", answer: "Answer 1" },
        { question: "Question 2?", answer: "Answer 2" },
      ],
    },
  },
  {
    type: "contact",
    name: "Contact Form",
    icon: Mail,
    category: "interactive",
    description: "Contact form",
    defaultProps: {
      title: "Contact Us",
      fields: ["name", "email", "message"],
      buttonText: "Send Message",
      recipientEmail: "",
    },
  },
  {
    type: "map",
    name: "Map",
    icon: MapPin,
    category: "interactive",
    description: "Google Maps embed",
    defaultProps: {
      address: "",
      zoom: 15,
      height: 400,
    },
  },
  {
    type: "countdown",
    name: "Countdown",
    icon: Clock,
    category: "interactive",
    description: "Countdown timer",
    defaultProps: {
      targetDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      title: "Coming Soon",
      style: "default",
    },
  },

  // Marketing blocks
  {
    type: "hero",
    name: "Hero",
    icon: Layout,
    category: "marketing",
    description: "Hero section with CTA",
    defaultProps: {
      title: "Welcome to Our Site",
      subtitle: "Discover amazing features",
      buttonText: "Get Started",
      buttonUrl: "#",
      backgroundImage: "",
      alignment: "center",
    },
  },
  {
    type: "cta",
    name: "Call to Action",
    icon: Zap,
    category: "marketing",
    description: "Call to action section",
    defaultProps: {
      title: "Ready to get started?",
      description: "Join thousands of satisfied customers",
      buttonText: "Sign Up Now",
      buttonUrl: "/register",
      style: "primary",
    },
  },
  {
    type: "features",
    name: "Features",
    icon: Star,
    category: "marketing",
    description: "Feature list/grid",
    defaultProps: {
      title: "Our Features",
      columns: 3,
      items: [
        { icon: "star", title: "Feature 1", description: "Description 1" },
        { icon: "shield", title: "Feature 2", description: "Description 2" },
        { icon: "zap", title: "Feature 3", description: "Description 3" },
      ],
    },
  },
  {
    type: "testimonial",
    name: "Testimonials",
    icon: Quote,
    category: "marketing",
    description: "Customer testimonials",
    defaultProps: {
      style: "cards",
      items: [
        { name: "John Doe", role: "CEO", quote: "Amazing!", avatar: "" },
      ],
    },
  },
  {
    type: "team",
    name: "Team",
    icon: Users,
    category: "marketing",
    description: "Team member cards",
    defaultProps: {
      title: "Our Team",
      columns: 4,
      members: [
        { name: "John Doe", role: "CEO", photo: "", social: [] },
      ],
    },
  },
  {
    type: "pricing",
    name: "Pricing",
    icon: DollarSign,
    category: "marketing",
    description: "Pricing tables",
    defaultProps: {
      title: "Choose Your Plan",
      plans: [
        { name: "Basic", price: "$9/mo", features: [], cta: "Get Started" },
        { name: "Pro", price: "$29/mo", features: [], cta: "Get Started", highlighted: true },
      ],
    },
  },
  {
    type: "stats",
    name: "Statistics",
    icon: BarChart3,
    category: "marketing",
    description: "Number statistics",
    defaultProps: {
      items: [
        { value: "100+", label: "Customers" },
        { value: "50K", label: "Downloads" },
        { value: "99%", label: "Satisfaction" },
      ],
    },
  },
  {
    type: "logo-cloud",
    name: "Logo Cloud",
    icon: Image,
    category: "marketing",
    description: "Client/partner logos",
    defaultProps: {
      title: "Trusted By",
      logos: [],
      style: "grid",
    },
  },

  // Code blocks
  {
    type: "code",
    name: "Code",
    icon: Code,
    category: "basic",
    description: "Code snippet",
    defaultProps: {
      code: "",
      language: "javascript",
      showLineNumbers: true,
    },
  },
  {
    type: "html",
    name: "Custom HTML",
    icon: FileText,
    category: "basic",
    description: "Raw HTML code",
    defaultProps: {
      html: "",
    },
  },
];

interface ContentBlockProps {
  block: {
    id: string;
    type: BlockType;
    props: Record<string, any>;
  };
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (props: Record<string, any>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}

export function ContentBlock({
  block,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
  onDuplicate,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
}: ContentBlockProps) {
  const definition = blockDefinitions.find((d) => d.type === block.type);
  if (!definition) return null;

  const Icon = definition.icon;

  return (
    <div
      onClick={onSelect}
      className={`relative group ${
        isSelected
          ? "ring-2 ring-blue-500"
          : "hover:ring-1 hover:ring-gray-300 dark:hover:ring-gray-600"
      }`}
    >
      {/* Block controls */}
      <div className="absolute -left-12 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="flex flex-col gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMoveUp();
            }}
            disabled={!canMoveUp}
            className="p-1 bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50"
          >
            <ChevronUp size={14} className="text-gray-600 dark:text-gray-300" />
          </button>
          <div className="cursor-grab p-1 bg-gray-800 text-white rounded">
            <GripVertical size={14} />
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMoveDown();
            }}
            disabled={!canMoveDown}
            className="p-1 bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50"
          >
            <ChevronDown size={14} className="text-gray-600 dark:text-gray-300" />
          </button>
        </div>
      </div>

      {/* Block actions */}
      <div className="absolute -right-10 top-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="flex flex-col gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate();
            }}
            className="p-1 bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            <Copy size={14} className="text-gray-600 dark:text-gray-300" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-1 bg-red-100 dark:bg-red-900/30 rounded hover:bg-red-200 dark:hover:bg-red-900/50"
          >
            <Trash2 size={14} className="text-red-600 dark:text-red-400" />
          </button>
        </div>
      </div>

      {/* Block content */}
      <div className="py-4 px-4">
        <BlockRenderer type={block.type} props={block.props} />
      </div>

      {/* Block type indicator */}
      <div className="absolute top-0 left-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 text-white text-xs px-2 py-0.5 rounded-br flex items-center gap-1">
        <Icon size={12} />
        {definition.name}
      </div>
    </div>
  );
}

// Block renderer
function BlockRenderer({ type, props }: { type: BlockType; props: Record<string, any> }) {
  switch (type) {
    case "text":
      return (
        <div
          className="prose dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: props.content }}
        />
      );

    case "heading":
      const HeadingTag = props.level as keyof JSX.IntrinsicElements;
      return (
        <HeadingTag
          className={`font-bold text-gray-900 dark:text-white ${
            props.level === "h1"
              ? "text-4xl"
              : props.level === "h2"
              ? "text-3xl"
              : props.level === "h3"
              ? "text-2xl"
              : "text-xl"
          }`}
          style={{ textAlign: props.alignment }}
        >
          {props.text}
        </HeadingTag>
      );

    case "button":
      return (
        <div style={{ textAlign: props.alignment }}>
          <button
            className={`inline-flex items-center justify-center rounded-lg font-medium transition-colors ${
              props.style === "primary"
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : props.style === "secondary"
                ? "bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-white"
                : "border border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300"
            } ${
              props.size === "small"
                ? "px-3 py-1.5 text-sm"
                : props.size === "large"
                ? "px-6 py-3 text-lg"
                : "px-4 py-2"
            }`}
          >
            {props.text}
          </button>
        </div>
      );

    case "divider":
      return (
        <hr
          className="border-t"
          style={{
            borderColor: props.color,
            borderStyle: props.style,
            width: props.width,
            margin: "0 auto",
          }}
        />
      );

    case "spacer":
      return <div style={{ height: `${props.height}px` }} />;

    case "image":
      return props.src ? (
        <figure>
          <img
            src={props.src}
            alt={props.alt}
            className={`max-w-full h-auto ${props.rounded ? "rounded-lg" : ""}`}
            style={{
              width: props.size === "full" ? "100%" : props.size === "large" ? "75%" : "50%",
            }}
          />
          {props.caption && (
            <figcaption className="text-sm text-gray-500 mt-2 text-center">
              {props.caption}
            </figcaption>
          )}
        </figure>
      ) : (
        <div className="bg-gray-100 dark:bg-gray-800 h-48 flex items-center justify-center rounded-lg">
          <Image size={48} className="text-gray-400" />
        </div>
      );

    case "video":
      if (!props.url) {
        return (
          <div className="bg-gray-100 dark:bg-gray-800 h-64 flex items-center justify-center rounded-lg">
            <Video size={48} className="text-gray-400" />
          </div>
        );
      }

      // Extract video ID for embed
      const getEmbedUrl = () => {
        if (props.type === "youtube") {
          const videoId = props.url.match(
            /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/
          )?.[1];
          return videoId ? `https://www.youtube.com/embed/${videoId}` : props.url;
        }
        return props.url;
      };

      return (
        <div className="aspect-video">
          <iframe
            src={getEmbedUrl()}
            className="w-full h-full rounded-lg"
            allowFullScreen
          />
        </div>
      );

    case "hero":
      return (
        <div
          className="py-16 px-8 rounded-lg bg-cover bg-center"
          style={{
            backgroundImage: props.backgroundImage
              ? `url(${props.backgroundImage})`
              : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            textAlign: props.alignment,
          }}
        >
          <h1 className="text-4xl font-bold text-white mb-4">{props.title}</h1>
          <p className="text-xl text-white/80 mb-6">{props.subtitle}</p>
          <button className="px-6 py-3 bg-white text-gray-900 rounded-lg font-medium hover:bg-gray-100">
            {props.buttonText}
          </button>
        </div>
      );

    case "cta":
      return (
        <div
          className={`py-12 px-8 rounded-lg text-center ${
            props.style === "primary"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white"
          }`}
        >
          <h2 className="text-2xl font-bold mb-2">{props.title}</h2>
          <p className="mb-6 opacity-80">{props.description}</p>
          <button
            className={`px-6 py-3 rounded-lg font-medium ${
              props.style === "primary"
                ? "bg-white text-blue-600 hover:bg-gray-100"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {props.buttonText}
          </button>
        </div>
      );

    case "features":
      return (
        <div>
          {props.title && (
            <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-8">
              {props.title}
            </h2>
          )}
          <div className={`grid grid-cols-${props.columns} gap-6`}>
            {props.items?.map((item: any, i: number) => (
              <div key={i} className="text-center p-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Star className="text-blue-600 dark:text-blue-400" size={24} />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      );

    case "testimonial":
      return (
        <div className={`grid grid-cols-${props.items?.length > 2 ? 3 : props.items?.length} gap-6`}>
          {props.items?.map((item: any, i: number) => (
            <div
              key={i}
              className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
            >
              <Quote className="text-blue-500 mb-4" size={24} />
              <p className="text-gray-600 dark:text-gray-300 mb-4 italic">
                "{item.quote}"
              </p>
              <div className="flex items-center gap-3">
                {item.avatar ? (
                  <img
                    src={item.avatar}
                    alt={item.name}
                    className="w-10 h-10 rounded-full"
                  />
                ) : (
                  <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                    <Users size={16} className="text-gray-500" />
                  </div>
                )}
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {item.name}
                  </p>
                  <p className="text-sm text-gray-500">{item.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      );

    case "pricing":
      return (
        <div>
          {props.title && (
            <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-8">
              {props.title}
            </h2>
          )}
          <div className="grid grid-cols-3 gap-6">
            {props.plans?.map((plan: any, i: number) => (
              <div
                key={i}
                className={`p-6 rounded-lg border-2 ${
                  plan.highlighted
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                    : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                }`}
              >
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {plan.name}
                </h3>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  {plan.price}
                </p>
                <ul className="space-y-2 mb-6">
                  {plan.features?.map((feature: string, j: number) => (
                    <li
                      key={j}
                      className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300"
                    >
                      <Shield size={14} className="text-green-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <button
                  className={`w-full py-2 rounded-lg font-medium ${
                    plan.highlighted
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      );

    case "faq":
      return (
        <div>
          {props.title && (
            <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-8">
              {props.title}
            </h2>
          )}
          <div className="space-y-4">
            {props.items?.map((item: any, i: number) => (
              <FaqItem key={i} question={item.question} answer={item.answer} />
            ))}
          </div>
        </div>
      );

    case "stats":
      return (
        <div className="grid grid-cols-3 gap-6">
          {props.items?.map((item: any, i: number) => (
            <div key={i} className="text-center">
              <p className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                {item.value}
              </p>
              <p className="text-gray-600 dark:text-gray-400">{item.label}</p>
            </div>
          ))}
        </div>
      );

    case "countdown":
      return <CountdownTimer targetDate={props.targetDate} title={props.title} />;

    case "code":
      return (
        <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
          <code className={`language-${props.language}`}>{props.code}</code>
        </pre>
      );

    case "html":
      return (
        <div dangerouslySetInnerHTML={{ __html: props.html }} />
      );

    default:
      return (
        <div className="p-4 text-center text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-lg">
          [{type}]
        </div>
      );
  }
}

// FAQ Item component
function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 text-left bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
      >
        <span className="font-medium text-gray-900 dark:text-white">{question}</span>
        <ChevronDown
          size={20}
          className={`text-gray-500 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
      {isOpen && (
        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-300">{answer}</p>
        </div>
      )}
    </div>
  );
}

// Countdown Timer component
function CountdownTimer({ targetDate, title }: { targetDate: string; title: string }) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useState(() => {
    const interval = setInterval(() => {
      const target = new Date(targetDate).getTime();
      const now = Date.now();
      const diff = target - now;

      if (diff > 0) {
        setTimeLeft({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((diff % (1000 * 60)) / 1000),
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  });

  return (
    <div className="text-center py-8">
      {title && (
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          {title}
        </h2>
      )}
      <div className="flex justify-center gap-4">
        {[
          { value: timeLeft.days, label: "Days" },
          { value: timeLeft.hours, label: "Hours" },
          { value: timeLeft.minutes, label: "Minutes" },
          { value: timeLeft.seconds, label: "Seconds" },
        ].map((item, i) => (
          <div
            key={i}
            className="w-20 h-20 bg-blue-600 text-white rounded-lg flex flex-col items-center justify-center"
          >
            <span className="text-2xl font-bold">{item.value}</span>
            <span className="text-xs opacity-80">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Block Picker component
interface BlockPickerProps {
  onSelect: (type: BlockType) => void;
  onClose: () => void;
}

export function BlockPicker({ onSelect, onClose }: BlockPickerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const categories = [
    { id: "all", name: "All" },
    { id: "basic", name: "Basic" },
    { id: "media", name: "Media" },
    { id: "layout", name: "Layout" },
    { id: "interactive", name: "Interactive" },
    { id: "marketing", name: "Marketing" },
  ];

  const filteredBlocks = blockDefinitions.filter((block) => {
    const matchesSearch =
      block.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      block.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || block.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 h-full overflow-hidden flex flex-col">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900 dark:text-white">Add Block</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            ×
          </button>
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search blocks..."
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        />
      </div>

      <div className="flex gap-2 p-2 overflow-x-auto border-b border-gray-200 dark:border-gray-700">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3 py-1 text-sm rounded whitespace-nowrap ${
              selectedCategory === cat.id
                ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        <div className="grid grid-cols-2 gap-2">
          {filteredBlocks.map((block) => (
            <button
              key={block.type}
              onClick={() => onSelect(block.type)}
              className="flex flex-col items-center gap-2 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
            >
              <block.icon size={24} className="text-gray-600 dark:text-gray-400" />
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                {block.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ContentBlock;
