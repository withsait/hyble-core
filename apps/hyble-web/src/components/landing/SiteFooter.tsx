"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  MapPin,
  Building2,
  ExternalLink,
  Shield,
  Globe,
  ChevronDown,
  MessageCircle,
  Phone,
  Clock,
} from "lucide-react";
import { useState } from "react";

// Instagram icon (Lucide doesn't have it, so we create a simple one)
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
    { label: "Hyble Tools", href: "/tools" },
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
    { label: "Kariyer", href: "/careers", badge: "Hiring" },
    { label: "İletişim", href: "/contact" },
    { label: "Basın", href: "/press" },
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
  { icon: InstagramIcon, href: "https://instagram.com/hyblehq", label: "Instagram", color: "hover:text-pink-400" },
  { icon: XIcon, href: "https://x.com/hyblehq", label: "X (Twitter)", color: "hover:text-white" },
  { icon: YouTubeIcon, href: "https://youtube.com/@hyblehq", label: "YouTube", color: "hover:text-red-500" },
  { icon: LinkedInIcon, href: "https://linkedin.com/company/hyblehq", label: "LinkedIn", color: "hover:text-blue-400" },
];

const faqs = [
  {
    q: "Hyble nasıl çalışır?",
    a: "Hyble, tek bir API ile kimlik doğrulama, ödeme işleme ve bulut altyapısı sunar. Kayıt olduktan sonra dakikalar içinde entegre edebilirsiniz.",
  },
  {
    q: "Ücretsiz plan ile neler yapabilirim?",
    a: "Ücretsiz plan ile aylık 1.000 API çağrısı, 100 kullanıcı ve temel analitik özelliklerine erişebilirsiniz. Kredi kartı gerektirmez.",
  },
  {
    q: "Verilerim güvende mi?",
    a: "Evet, tüm veriler 256-bit SSL ile şifrelenir. GDPR uyumlu altyapımız Almanya'daki veri merkezlerinde barındırılır.",
  },
  {
    q: "Planımı değiştirebilir miyim?",
    a: "Evet, istediğiniz zaman plan yükseltme veya düşürme yapabilirsiniz. Değişiklikler anında uygulanır ve günlük bazda orantılı fatura kesilir.",
  },
  {
    q: "Hangi ödeme yöntemlerini kabul ediyorsunuz?",
    a: "Stripe üzerinden tüm major kredi/banka kartları, Apple Pay, Google Pay ve banka havalesi kabul ediyoruz. Fatura otomatik olarak düzenlenir.",
  },
];

function FAQAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="space-y-3">
      {faqs.map((faq, index) => (
        <div
          key={index}
          className="bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden"
        >
          <button
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
            className="w-full flex items-center justify-between p-4 text-left"
          >
            <span className="font-medium text-white pr-4">{faq.q}</span>
            <motion.div
              animate={{ rotate: openIndex === index ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="flex-shrink-0"
            >
              <ChevronDown className="w-5 h-5 text-slate-400" />
            </motion.div>
          </button>
          <AnimatePresence>
            {openIndex === index && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-4 text-slate-400 text-sm leading-relaxed">
                  {faq.a}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}

export function SiteFooter() {
  return (
    <footer className="relative bg-slate-900 text-white overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px]" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[400px] rounded-full blur-3xl opacity-5 bg-blue-500" />
        <div className="absolute top-0 right-0 w-[400px] h-[300px] rounded-full blur-3xl opacity-5 bg-cyan-500" />
      </div>

      <div className="relative">
        {/* FAQ Section */}
        <div className="border-b border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="grid lg:grid-cols-2 gap-12">
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">Sıkça Sorulan Sorular</h3>
                <p className="text-slate-400 mb-6">
                  En çok merak edilen soruların yanıtları. Başka sorunuz varsa{" "}
                  <Link href="/contact" className="text-blue-400 hover:text-blue-300">
                    iletişime geçin
                  </Link>
                  .
                </p>

                {/* Contact Cards */}
                <div className="grid sm:grid-cols-2 gap-4 mt-8">
                  <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                        <MessageCircle className="w-5 h-5 text-blue-400" />
                      </div>
                      <div>
                        <p className="font-medium text-white">Canlı Destek</p>
                        <p className="text-xs text-slate-400">Ortalama 5dk yanıt</p>
                      </div>
                    </div>
                    <a
                      href="https://discord.gg/hyble"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-400 hover:text-blue-300"
                    >
                      Discord'a Katıl
                    </a>
                  </div>
                  <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                        <Mail className="w-5 h-5 text-green-400" />
                      </div>
                      <div>
                        <p className="font-medium text-white">E-posta Destek</p>
                        <p className="text-xs text-slate-400">24 saat içinde yanıt</p>
                      </div>
                    </div>
                    <a
                      href="mailto:support@hyble.co"
                      className="text-sm text-green-400 hover:text-green-300"
                    >
                      support@hyble.co
                    </a>
                  </div>
                </div>
              </div>

              <FAQAccordion />
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
              <p className="text-slate-400 mb-6 max-w-xs leading-relaxed">
                All in One. All in Hyble. Dijital işinizi büyütmek için ihtiyacınız olan her şey tek platformda.
              </p>

              {/* Social Links */}
              <div className="flex items-center gap-3 mb-6">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-10 h-10 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 ${social.color} transition-colors`}
                    aria-label={social.label}
                  >
                    <social.icon className="w-5 h-5" />
                  </a>
                ))}
              </div>

              {/* Trust Badges */}
              <div className="flex flex-wrap gap-2">
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 rounded-lg text-xs text-slate-400">
                  <Shield className="w-3.5 h-3.5 text-green-400" />
                  <span>GDPR Uyumlu</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 rounded-lg text-xs text-slate-400">
                  <Globe className="w-3.5 h-3.5 text-blue-400" />
                  <span>DE Datacenter</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 rounded-lg text-xs text-slate-400">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>99.9% Uptime</span>
                </div>
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
                      {"badge" in link && link.badge && (
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
                  <span className="font-medium text-slate-400">HYBLE LTD</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>Company No: #15186175</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>United Kingdom</span>
                </div>
              </div>

              {/* Companies House Link */}
              <div className="md:text-right">
                <a
                  href="https://find-and-update.company-information.service.gov.uk/company/15186175"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm text-slate-400 hover:text-white transition-colors"
                >
                  <span>Companies House'da Doğrula</span>
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
                <span className="text-slate-700">|</span>
                <span>v2.0.0</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
