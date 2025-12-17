"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Github,
  Twitter,
  MessageCircle,
  Mail,
  MapPin,
  Building2,
  ExternalLink,
  ArrowRight,
  Shield,
  CreditCard,
  Globe,
} from "lucide-react";
import { useState } from "react";

const footerLinks = {
  products: [
    { label: "Hyble ID", href: "/products/id", badge: null },
    { label: "Hyble Wallet", href: "/products/wallet", badge: null },
    { label: "Hyble License", href: "/products/license", badge: null },
    { label: "Hyble Status", href: "/products/status", badge: null },
    { label: "Hyble Cloud", href: "/products/cloud", badge: "Yakında" },
  ],
  resources: [
    { label: "Dokümantasyon", href: "https://docs.hyble.co", external: true },
    { label: "API Referansı", href: "https://docs.hyble.co/api", external: true },
    { label: "Sistem Durumu", href: "https://status.hyble.co", external: true },
    { label: "Blog", href: "/blog" },
    { label: "Changelog", href: "/changelog" },
  ],
  company: [
    { label: "Hakkımızda", href: "/about" },
    { label: "Kariyer", href: "/careers", badge: "İşe Alıyoruz" },
    { label: "İletişim", href: "/contact" },
    { label: "Basın Kiti", href: "/press" },
  ],
  legal: [
    { label: "Gizlilik Politikası", href: "/legal/privacy" },
    { label: "Kullanım Şartları", href: "/legal/terms" },
    { label: "Çerez Politikası", href: "/legal/cookies" },
    { label: "GDPR", href: "/legal/gdpr" },
    { label: "SLA", href: "/legal/sla" },
  ],
};

const socialLinks = [
  { icon: Twitter, href: "https://twitter.com/hyblehq", label: "Twitter" },
  { icon: Github, href: "https://github.com/hyblehq", label: "GitHub" },
  { icon: MessageCircle, href: "https://discord.gg/hyble", label: "Discord" },
];

const certifications = [
  { icon: Shield, text: "GDPR Uyumlu" },
  { icon: CreditCard, text: "PCI DSS" },
  { icon: Globe, text: "ISO 27001" },
];

export function SiteFooter() {
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      // TODO: Implement newsletter subscription
      setIsSubscribed(true);
      setEmail("");
    }
  };

  return (
    <footer className="relative bg-slate-900 text-white overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px]" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[400px] rounded-full blur-3xl opacity-5 bg-blue-500" />
        <div className="absolute top-0 right-0 w-[400px] h-[300px] rounded-full blur-3xl opacity-5 bg-cyan-500" />
      </div>

      <div className="relative">
        {/* Newsletter Section */}
        <div className="border-b border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-xl font-bold mb-2">Güncellemelerden Haberdar Olun</h3>
                <p className="text-slate-400">
                  Yeni özellikler, güncellemeler ve ipuçları için bültenimize katılın.
                </p>
              </div>
              <div>
                {!isSubscribed ? (
                  <form onSubmit={handleNewsletterSubmit} className="flex gap-3">
                    <div className="flex-1 relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="E-posta adresiniz"
                        required
                        className="w-full pl-12 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>
                    <button
                      type="submit"
                      className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl font-semibold transition-colors flex items-center gap-2 group"
                    >
                      Abone Ol
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </form>
                ) : (
                  <div className="flex items-center gap-3 text-green-400">
                    <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                      <Mail className="w-5 h-5" />
                    </div>
                    <span>Bültenimize abone oldunuz!</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-12">
            {/* Brand Column */}
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                  <span className="text-white font-bold text-xl">H</span>
                </div>
                <span className="text-white font-bold text-2xl">Hyble</span>
              </div>
              <p className="text-slate-400 mb-6 max-w-xs">
                Geliştiriciler için hepsi bir arada platform. Kimlik doğrulama, ödeme ve
                bulut altyapısı tek bir yerde.
              </p>

              {/* Social Links */}
              <div className="flex items-center gap-3 mb-6">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                    aria-label={social.label}
                  >
                    <social.icon className="w-5 h-5" />
                  </a>
                ))}
              </div>

              {/* Certifications */}
              <div className="flex flex-wrap gap-2">
                {certifications.map((cert) => (
                  <div
                    key={cert.text}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 rounded-lg text-xs text-slate-400"
                  >
                    <cert.icon className="w-3.5 h-3.5" />
                    <span>{cert.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Products */}
            <div>
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
                Ürünler
              </h4>
              <ul className="space-y-3">
                {footerLinks.products.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-slate-400 hover:text-white transition-colors flex items-center gap-2"
                    >
                      {link.label}
                      {link.badge && (
                        <span className="text-xs px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded-full">
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
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
                Kaynaklar
              </h4>
              <ul className="space-y-3">
                {footerLinks.resources.map((link) => (
                  <li key={link.label}>
                    {"external" in link && link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-400 hover:text-white transition-colors flex items-center gap-1"
                      >
                        {link.label}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-slate-400 hover:text-white transition-colors"
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
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
                Şirket
              </h4>
              <ul className="space-y-3">
                {footerLinks.company.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-slate-400 hover:text-white transition-colors flex items-center gap-2"
                    >
                      {link.label}
                      {"badge" in link && link.badge && (
                        <span className="text-xs px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full">
                          {link.badge}
                        </span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
                Yasal
              </h4>
              <ul className="space-y-3">
                {footerLinks.legal.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-slate-400 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Company Info Bar */}
          <div className="border-t border-slate-800 pt-8">
            <div className="grid md:grid-cols-2 gap-6 items-center mb-8">
              {/* Company Registration */}
              <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-slate-500">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  <span>HYBLE LTD</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>Company No: 15186175</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>Birleşik Krallık</span>
                </div>
              </div>

              {/* Companies House Link */}
              <div className="md:text-right">
                <a
                  href="https://find-and-update.company-information.service.gov.uk/company/15186175"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-300 transition-colors"
                >
                  <span>Companies House'da Görüntüle</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-500">
              <p>&copy; {new Date().getFullYear()} HYBLE LTD. Tüm hakları saklıdır.</p>
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  Tüm sistemler çalışıyor
                </span>
                <span>|</span>
                <span>v1.0.0</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
