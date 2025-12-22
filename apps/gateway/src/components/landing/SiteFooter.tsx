"use client";

import Link from "next/link";
import {
  Mail,
  MapPin,
  Building2,
  ExternalLink,
  Shield,
  Globe,
  MessageCircle,
  Clock,
  ArrowRight,
} from "lucide-react";

// Social Icons
const InstagramIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
);

const XIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const YouTubeIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

const LinkedInIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

const footerLinks = {
  products: [
    { label: "Hyble ID", href: "/products/id" },
    { label: "Hyble Wallet", href: "/products/wallet" },
    { label: "Hyble License", href: "/products/license" },
    { label: "Hyble Status", href: "/products/status" },
    { label: "Hyble Cloud", href: "/products/cloud", badge: "Yakında" },
  ],
  resources: [
    { label: "Dokümantasyon", href: "https://docs.hyble.co", external: true },
    { label: "API Referansı", href: "https://docs.hyble.co/api", external: true },
    { label: "Sistem Durumu", href: "https://status.hyble.co", external: true },
    { label: "Blog", href: "/blog" },
  ],
  company: [
    { label: "Hakkımızda", href: "/about" },
    { label: "Kariyer", href: "/careers", badge: "Hiring" },
    { label: "İletişim", href: "/contact" },
  ],
  legal: [
    { label: "Gizlilik", href: "/legal/privacy" },
    { label: "Şartlar", href: "/legal/terms" },
    { label: "GDPR", href: "/legal/gdpr" },
  ],
};

const socialLinks = [
  { icon: InstagramIcon, href: "https://instagram.com/hyblehq", label: "Instagram", color: "hover:text-pink-400" },
  { icon: XIcon, href: "https://x.com/hyblehq", label: "X (Twitter)", color: "hover:text-white" },
  { icon: YouTubeIcon, href: "https://youtube.com/@hyblehq", label: "YouTube", color: "hover:text-red-500" },
  { icon: LinkedInIcon, href: "https://linkedin.com/company/hyblehq", label: "LinkedIn", color: "hover:text-blue-400" },
];

export function SiteFooter() {
  return (
    <footer className="relative bg-slate-900 text-white overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>

      <div className="relative">
        {/* Main Footer Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-10">
            {/* Brand Column */}
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">H</span>
                </div>
                <span className="text-white font-bold text-xl">Hyble</span>
              </div>
              <p className="text-slate-400 text-sm mb-5 max-w-xs leading-relaxed">
                All in One. All in Hyble.
              </p>

              {/* Social Links */}
              <div className="flex items-center gap-2 mb-5">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-9 h-9 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 ${social.color} transition-colors`}
                    aria-label={social.label}
                  >
                    <social.icon className="w-4 h-4" />
                  </a>
                ))}
              </div>

              {/* Trust Badges */}
              <div className="flex flex-wrap gap-2">
                <div className="flex items-center gap-1 px-2 py-1 bg-slate-800 rounded text-xs text-slate-400">
                  <Shield className="w-3 h-3 text-green-400" />
                  <span>GDPR</span>
                </div>
                <div className="flex items-center gap-1 px-2 py-1 bg-slate-800 rounded text-xs text-slate-400">
                  <Globe className="w-3 h-3 text-blue-400" />
                  <span>DE</span>
                </div>
                <div className="flex items-center gap-1 px-2 py-1 bg-slate-800 rounded text-xs text-slate-400">
                  <Clock className="w-3 h-3 text-amber-400" />
                  <span>99.9%</span>
                </div>
              </div>
            </div>

            {/* Products */}
            <div>
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">
                Ürünler
              </h4>
              <ul className="space-y-2">
                {footerLinks.products.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-slate-400 hover:text-white transition-colors text-sm flex items-center gap-1.5"
                    >
                      {link.label}
                      {"badge" in link && link.badge && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-blue-500/20 text-blue-400 rounded">
                          {link.badge}
                        </span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">
                Kaynaklar
              </h4>
              <ul className="space-y-2">
                {footerLinks.resources.map((link) => (
                  <li key={link.label}>
                    {"external" in link && link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-400 hover:text-white transition-colors text-sm flex items-center gap-1"
                      >
                        {link.label}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-slate-400 hover:text-white transition-colors text-sm"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">
                Şirket
              </h4>
              <ul className="space-y-2">
                {footerLinks.company.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-slate-400 hover:text-white transition-colors text-sm flex items-center gap-1.5"
                    >
                      {link.label}
                      {"badge" in link && link.badge && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-green-500/20 text-green-400 rounded">
                          {link.badge}
                        </span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal + Support */}
            <div>
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">
                Destek
              </h4>
              <ul className="space-y-2">
                <li>
                  <a
                    href="https://discord.gg/hyble"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-400 hover:text-white transition-colors text-sm flex items-center gap-1.5"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    Discord
                  </a>
                </li>
                <li>
                  <a
                    href="mailto:support@hyble.co"
                    className="text-slate-400 hover:text-white transition-colors text-sm flex items-center gap-1.5"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    E-posta
                  </a>
                </li>
                <li>
                  <Link
                    href="/faq"
                    className="text-slate-400 hover:text-white transition-colors text-sm flex items-center gap-1"
                  >
                    SSS
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </li>
                {footerLinks.legal.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-slate-400 hover:text-white transition-colors text-sm"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Company Info Bar */}
          <div className="border-t border-slate-800 pt-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <div className="flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5" />
                  <span className="font-medium text-slate-400">HYBLE LTD</span>
                </div>
                <span>#15186175</span>
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  <span>UK</span>
                </div>
                <a
                  href="https://find-and-update.company-information.service.gov.uk/company/15186175"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 flex items-center gap-1"
                >
                  Doğrula
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  Sistemler Çalışıyor
                </span>
                <span className="text-slate-700">|</span>
                <span>&copy; {new Date().getFullYear()} Hyble</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
