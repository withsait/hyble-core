"use client";

import { useState } from "react";
import {
  ExternalLink,
  Github,
  Globe,
  Star,
  Calendar,
  Tag,
  ChevronLeft,
  ChevronRight,
  Play,
  X,
  Filter,
  Search,
  Grid,
  LayoutGrid,
  Award,
  Users,
  TrendingUp,
  Heart,
} from "lucide-react";

interface PortfolioProject {
  id: string;
  title: string;
  slug: string;
  description: string;
  longDescription?: string;
  thumbnail: string;
  images: string[];
  videoUrl?: string;
  category: string;
  tags: string[];
  technologies: string[];
  client?: string;
  completedAt: string;
  featured: boolean;
  stats?: {
    users?: string;
    revenue?: string;
    growth?: string;
  };
  links: {
    live?: string;
    github?: string;
  };
  testimonial?: {
    text: string;
    author: string;
    role: string;
    avatar?: string;
  };
}

// Mock data
const projects: PortfolioProject[] = [
  {
    id: "1",
    title: "E-Commerce Platform",
    slug: "ecommerce-platform",
    description: "A full-featured e-commerce platform with advanced inventory management and analytics.",
    longDescription: "Built a comprehensive e-commerce solution with multi-vendor support, real-time inventory tracking, and AI-powered product recommendations. The platform handles over 10,000 daily transactions with 99.9% uptime.",
    thumbnail: "https://picsum.photos/800/600?random=1",
    images: [
      "https://picsum.photos/1200/800?random=1",
      "https://picsum.photos/1200/800?random=2",
      "https://picsum.photos/1200/800?random=3",
    ],
    category: "E-Commerce",
    tags: ["React", "Node.js", "PostgreSQL", "Stripe"],
    technologies: ["Next.js", "TypeScript", "Prisma", "TailwindCSS"],
    client: "Fashion Hub",
    completedAt: "2024-01-15",
    featured: true,
    stats: {
      users: "50K+",
      revenue: "₺2M+",
      growth: "150%",
    },
    links: {
      live: "https://fashionhub.com",
    },
    testimonial: {
      text: "Hyble delivered an exceptional platform that transformed our business. Sales increased by 150% within the first quarter.",
      author: "Sarah Johnson",
      role: "CEO, Fashion Hub",
    },
  },
  {
    id: "2",
    title: "SaaS Dashboard",
    slug: "saas-dashboard",
    description: "Modern analytics dashboard for SaaS companies with real-time metrics and reporting.",
    thumbnail: "https://picsum.photos/800/600?random=4",
    images: [
      "https://picsum.photos/1200/800?random=4",
      "https://picsum.photos/1200/800?random=5",
    ],
    category: "Dashboard",
    tags: ["Analytics", "Charts", "Real-time"],
    technologies: ["React", "D3.js", "WebSocket", "Redis"],
    client: "DataPro Inc",
    completedAt: "2023-12-01",
    featured: true,
    links: {
      live: "https://datapro.io",
      github: "https://github.com/hyble/saas-dashboard",
    },
  },
  {
    id: "3",
    title: "Mobile Banking App",
    slug: "mobile-banking",
    description: "Secure and intuitive mobile banking application with biometric authentication.",
    thumbnail: "https://picsum.photos/800/600?random=7",
    images: [
      "https://picsum.photos/1200/800?random=7",
    ],
    category: "Fintech",
    tags: ["Mobile", "Security", "Fintech"],
    technologies: ["React Native", "Node.js", "MongoDB"],
    completedAt: "2023-11-15",
    featured: false,
    stats: {
      users: "100K+",
    },
    links: {
      live: "https://apps.apple.com/app/example",
    },
  },
  {
    id: "4",
    title: "Restaurant Booking System",
    slug: "restaurant-booking",
    description: "Complete restaurant management system with online reservations and table management.",
    thumbnail: "https://picsum.photos/800/600?random=10",
    images: [],
    category: "Hospitality",
    tags: ["Booking", "Management", "CRM"],
    technologies: ["Vue.js", "Laravel", "MySQL"],
    completedAt: "2023-10-20",
    featured: false,
    links: {
      live: "https://tablebook.io",
    },
  },
];

const categories = ["All", "E-Commerce", "Dashboard", "Fintech", "Hospitality", "Mobile"];

export function PortfolioShowcase() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProject, setSelectedProject] = useState<PortfolioProject | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const filteredProjects = projects.filter((project) => {
    const matchesCategory =
      selectedCategory === "All" || project.category === selectedCategory;
    const matchesSearch =
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.tags.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      );
    return matchesCategory && matchesSearch;
  });

  const featuredProjects = projects.filter((p) => p.featured);

  const nextImage = () => {
    if (selectedProject) {
      setCurrentImageIndex((prev) =>
        prev === selectedProject.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (selectedProject) {
      setCurrentImageIndex((prev) =>
        prev === 0 ? selectedProject.images.length - 1 : prev - 1
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero section */}
      <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-4">Our Portfolio</h1>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">
            Explore our latest projects and see how we help businesses transform
            their digital presence.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-8 mt-12 max-w-3xl mx-auto">
            {[
              { label: "Projects Completed", value: "150+" },
              { label: "Happy Clients", value: "100+" },
              { label: "Awards Won", value: "25" },
              { label: "Countries", value: "15" },
            ].map((stat, i) => (
              <div key={i}>
                <p className="text-4xl font-bold">{stat.value}</p>
                <p className="text-sm opacity-80">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Featured projects */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Featured Projects
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Our most impactful work
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Award className="text-yellow-500" size={24} />
            <span className="text-gray-600 dark:text-gray-400">
              Award-winning designs
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8">
          {featuredProjects.map((project) => (
            <div
              key={project.id}
              onClick={() => setSelectedProject(project)}
              className="group bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
            >
              <div className="relative aspect-video overflow-hidden">
                <img
                  src={project.thumbnail}
                  alt={project.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute bottom-4 left-4 right-4 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex items-center gap-2">
                    <Star className="fill-yellow-500 text-yellow-500" size={16} />
                    <span className="text-sm">Featured Project</span>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs rounded">
                    {project.category}
                  </span>
                  {project.client && (
                    <span className="text-sm text-gray-500">
                      for {project.client}
                    </span>
                  )}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {project.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                  {project.description}
                </p>
                {project.stats && (
                  <div className="flex items-center gap-4">
                    {project.stats.users && (
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Users size={14} />
                        {project.stats.users}
                      </div>
                    )}
                    {project.stats.revenue && (
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <TrendingUp size={14} />
                        {project.stats.revenue}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* All projects */}
      <div className="max-w-7xl mx-auto px-4 pb-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            All Projects
          </h2>
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search projects..."
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white w-64"
              />
            </div>

            {/* View mode */}
            <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded ${
                  viewMode === "grid"
                    ? "bg-white dark:bg-gray-700 shadow"
                    : ""
                }`}
              >
                <Grid size={18} className="text-gray-600 dark:text-gray-400" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded ${
                  viewMode === "list"
                    ? "bg-white dark:bg-gray-700 shadow"
                    : ""
                }`}
              >
                <LayoutGrid size={18} className="text-gray-600 dark:text-gray-400" />
              </button>
            </div>
          </div>
        </div>

        {/* Category filters */}
        <div className="flex items-center gap-2 mb-8 flex-wrap">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Projects grid */}
        {viewMode === "grid" ? (
          <div className="grid grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                onClick={() => setSelectedProject(project)}
                className="group bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow hover:shadow-lg transition-shadow cursor-pointer"
              >
                <div className="relative aspect-video overflow-hidden">
                  <img
                    src={project.thumbnail}
                    alt={project.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded">
                      {project.category}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    {project.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                    {project.description}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-3">
                    {project.technologies.slice(0, 3).map((tech, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs rounded"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                onClick={() => setSelectedProject(project)}
                className="flex gap-6 bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow hover:shadow-lg transition-shadow cursor-pointer p-4"
              >
                <img
                  src={project.thumbnail}
                  alt={project.title}
                  className="w-48 h-32 object-cover rounded-lg flex-shrink-0"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded">
                      {project.category}
                    </span>
                    <span className="text-sm text-gray-500">
                      {project.completedAt}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                    {project.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-3">
                    {project.description}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {project.technologies.map((tech, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs rounded"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center">
                  <ChevronRight className="text-gray-400" size={24} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Project detail modal */}
      {selectedProject && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Close button */}
            <button
              onClick={() => {
                setSelectedProject(null);
                setCurrentImageIndex(0);
              }}
              className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white z-10"
            >
              <X size={20} />
            </button>

            {/* Image gallery */}
            <div className="relative aspect-video">
              <img
                src={
                  selectedProject.images[currentImageIndex] ||
                  selectedProject.thumbnail
                }
                alt={selectedProject.title}
                className="w-full h-full object-cover"
              />
              {selectedProject.images.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      prevImage();
                    }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      nextImage();
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white"
                  >
                    <ChevronRight size={24} />
                  </button>
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {selectedProject.images.map((_, i) => (
                      <button
                        key={i}
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentImageIndex(i);
                        }}
                        className={`w-2 h-2 rounded-full ${
                          i === currentImageIndex ? "bg-white" : "bg-white/50"
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Content */}
            <div className="p-8">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-sm rounded">
                      {selectedProject.category}
                    </span>
                    {selectedProject.featured && (
                      <span className="flex items-center gap-1 px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-sm rounded">
                        <Star size={12} className="fill-current" />
                        Featured
                      </span>
                    )}
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                    {selectedProject.title}
                  </h2>
                  {selectedProject.client && (
                    <p className="text-gray-500 mt-1">
                      Client: {selectedProject.client}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {selectedProject.links.live && (
                    <a
                      href={selectedProject.links.live}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      <Globe size={16} />
                      View Live
                    </a>
                  )}
                  {selectedProject.links.github && (
                    <a
                      href={selectedProject.links.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                    >
                      <Github size={16} />
                      Source
                    </a>
                  )}
                </div>
              </div>

              <p className="text-gray-600 dark:text-gray-400 text-lg mb-6">
                {selectedProject.longDescription || selectedProject.description}
              </p>

              {/* Stats */}
              {selectedProject.stats && (
                <div className="flex items-center gap-6 mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  {selectedProject.stats.users && (
                    <div className="flex items-center gap-2">
                      <Users size={20} className="text-blue-600" />
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {selectedProject.stats.users}
                        </p>
                        <p className="text-sm text-gray-500">Users</p>
                      </div>
                    </div>
                  )}
                  {selectedProject.stats.revenue && (
                    <div className="flex items-center gap-2">
                      <TrendingUp size={20} className="text-green-600" />
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {selectedProject.stats.revenue}
                        </p>
                        <p className="text-sm text-gray-500">Revenue</p>
                      </div>
                    </div>
                  )}
                  {selectedProject.stats.growth && (
                    <div className="flex items-center gap-2">
                      <Award size={20} className="text-yellow-600" />
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {selectedProject.stats.growth}
                        </p>
                        <p className="text-sm text-gray-500">Growth</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Technologies */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Technologies Used
                </h3>
                <div className="flex flex-wrap gap-2">
                  {selectedProject.technologies.map((tech, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-sm"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Testimonial */}
              {selectedProject.testimonial && (
                <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl">
                  <p className="text-lg text-gray-700 dark:text-gray-300 italic mb-4">
                    "{selectedProject.testimonial.text}"
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                      <Users size={16} className="text-gray-500" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {selectedProject.testimonial.author}
                      </p>
                      <p className="text-sm text-gray-500">
                        {selectedProject.testimonial.role}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PortfolioShowcase;
