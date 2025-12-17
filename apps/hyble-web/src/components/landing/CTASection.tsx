"use client";

import { motion } from "framer-motion";
import { ArrowRight, Mail, Sparkles, CheckCircle2, Play, Rocket } from "lucide-react";
import { useState } from "react";

const benefits = [
  "14 gün ücretsiz deneme",
  "Kredi kartı gerekmez",
  "Anında kurulum",
  "İstediğiniz zaman iptal",
];

export function CTASection() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      // Redirect to register with email pre-filled
      window.location.href = `https://id.hyble.co/register?email=${encodeURIComponent(email)}`;
    }
  };

  return (
    <section className="relative py-24 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:40px_40px]" />

        {/* Gradient orbs */}
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full blur-3xl opacity-20 bg-blue-400 dark:bg-blue-600" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full blur-3xl opacity-15 bg-cyan-400 dark:bg-cyan-600" />
      </div>

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main CTA Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative"
        >
          {/* Glow effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-3xl blur-xl opacity-20" />

          <div className="relative bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-700 p-8 md:p-12 shadow-xl">
            <div className="grid md:grid-cols-2 gap-10 items-center">
              {/* Left Column - Content */}
              <div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-medium mb-6"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Ücretsiz başlayın</span>
                </motion.div>

                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                  className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4"
                >
                  Yazılım işinizi{" "}
                  <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                    bugün başlatın
                  </span>
                </motion.h2>

                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                  className="text-lg text-slate-600 dark:text-slate-400 mb-6"
                >
                  Binlerce geliştirici Hyble ile projelerini hayata geçiriyor.
                  Siz de aramıza katılın.
                </motion.p>

                {/* Benefits list */}
                <motion.ul
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 }}
                  className="grid grid-cols-2 gap-3 mb-6"
                >
                  {benefits.map((benefit) => (
                    <li key={benefit} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </motion.ul>

                {/* Demo video button */}
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 }}
                  onClick={() => setIsVideoOpen(true)}
                  className="group flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center group-hover:border-blue-500 transition-colors">
                    <Play className="w-4 h-4 ml-0.5" />
                  </div>
                  <span>2 dakikalık demo izle</span>
                </motion.button>
              </div>

              {/* Right Column - Form */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="relative"
              >
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 md:p-8 border border-slate-100 dark:border-slate-700">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                      <Rocket className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white">Hızlı Başlangıç</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">30 saniyede hesap oluşturun</p>
                    </div>
                  </div>

                  {!isSubmitted ? (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="E-posta adresiniz"
                          required
                          className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl hover:shadow-blue-500/25 group"
                      >
                        Ücretsiz Başla
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </button>

                      <p className="text-xs text-center text-slate-500 dark:text-slate-400">
                        Kaydolarak{" "}
                        <a href="/legal/terms" className="text-blue-600 dark:text-blue-400 hover:underline">
                          Kullanım Şartları
                        </a>
                        'nı kabul etmiş olursunuz.
                      </p>
                    </form>
                  ) : (
                    <div className="text-center py-6">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                        <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
                      </div>
                      <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Yönlendiriliyorsunuz!</h4>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Hesap oluşturma sayfasına yönlendirileceksiniz...
                      </p>
                    </div>
                  )}
                </div>

                {/* Floating badge */}
                <div className="absolute -bottom-4 -right-4 bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300 px-4 py-2 rounded-full text-sm font-medium shadow-lg">
                  🎉 500+ aktif kullanıcı
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Bottom trust indicators */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="mt-12 text-center"
        >
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            Güvenilir altyapı ile destekleniyor
          </p>
          <div className="flex items-center justify-center gap-8 opacity-60 grayscale hover:opacity-100 hover:grayscale-0 transition-all">
            {["Stripe", "Hetzner", "Cloudflare", "Vercel"].map((partner) => (
              <span key={partner} className="text-slate-400 dark:text-slate-500 font-semibold">
                {partner}
              </span>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Video Modal */}
      {isVideoOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setIsVideoOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white dark:bg-slate-900 rounded-2xl p-8 max-w-2xl w-full text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="aspect-video bg-slate-100 dark:bg-slate-800 rounded-xl mb-6 flex items-center justify-center">
              <div className="text-center">
                <Play className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                <p className="text-slate-500 dark:text-slate-400">Demo videosu yakında eklenecek</p>
              </div>
            </div>
            <button
              onClick={() => setIsVideoOpen(false)}
              className="px-6 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              Kapat
            </button>
          </motion.div>
        </div>
      )}
    </section>
  );
}
