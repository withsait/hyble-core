"use client";

import { motion } from "framer-motion";
import { Shield } from "lucide-react";

// Datacenter locations
const datacenters = [
  { id: "fsn", name: "Falkenstein", country: "Almanya", lat: 50.47, lng: 12.37, primary: true },
  { id: "nbg", name: "Nuremberg", country: "Almanya", lat: 49.45, lng: 11.08, primary: false },
  { id: "hel", name: "Helsinki", country: "Finlandiya", lat: 60.17, lng: 24.94, primary: false },
];

export function StatsSection() {
  return (
    <section className="relative py-16 bg-white dark:bg-slate-900 overflow-hidden">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Map Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-8 shadow-lg"
        >
          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Map visualization */}
            <div className="relative">
              <div className="aspect-[4/3] bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden relative">
                {/* Simplified Europe map background */}
                <svg
                  viewBox="0 0 400 300"
                  className="w-full h-full opacity-30 dark:opacity-20"
                  fill="none"
                >
                  <path
                    d="M150,50 Q200,30 250,50 L280,80 Q300,100 290,130 L270,160 Q250,180 220,170 L180,180 Q150,190 130,170 L110,140 Q100,110 120,80 L150,50"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-slate-400 dark:text-slate-600"
                  />
                </svg>

                {/* Datacenter markers */}
                {datacenters.map((dc, index) => {
                  // Simplified positioning
                  const positions: { x: string; y: string }[] = [
                    { x: "55%", y: "45%" }, // Falkenstein
                    { x: "48%", y: "52%" }, // Nuremberg
                    { x: "68%", y: "25%" }, // Helsinki
                  ];
                  const pos = positions[index] ?? { x: "50%", y: "50%" };

                  return (
                    <motion.div
                      key={dc.id}
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.5 + index * 0.2, type: "spring" }}
                      className="absolute"
                      style={{ left: pos.x, top: pos.y }}
                    >
                      {/* Pulse animation for primary */}
                      {dc.primary && (
                        <div className="absolute inset-0 -m-4">
                          <div className="w-8 h-8 rounded-full bg-blue-500 animate-ping opacity-20" />
                        </div>
                      )}
                      <div
                        className={`relative w-4 h-4 rounded-full ${
                          dc.primary
                            ? "bg-blue-500 shadow-lg shadow-blue-500/50"
                            : "bg-slate-400 dark:bg-slate-500"
                        }`}
                      />
                      <div className="absolute left-6 top-1/2 -translate-y-1/2 whitespace-nowrap">
                        <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                          {dc.name}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}

                {/* Connection lines */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                  <line
                    x1="55%"
                    y1="45%"
                    x2="48%"
                    y2="52%"
                    stroke="currentColor"
                    strokeWidth="1"
                    strokeDasharray="4,4"
                    className="text-blue-400/50"
                  />
                  <line
                    x1="55%"
                    y1="45%"
                    x2="68%"
                    y2="25%"
                    stroke="currentColor"
                    strokeWidth="1"
                    strokeDasharray="4,4"
                    className="text-blue-400/50"
                  />
                </svg>
              </div>
            </div>

            {/* Datacenter details */}
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                Avrupa Datacenter Ağı
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                Verileriniz Avrupa'da kalır. GDPR uyumlu altyapımız ile güvenle çalışın.
              </p>

              <div className="space-y-4">
                {datacenters.map((dc) => (
                  <div
                    key={dc.id}
                    className={`flex items-center gap-4 p-4 rounded-xl ${
                      dc.primary
                        ? "bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800"
                        : "bg-slate-50 dark:bg-slate-800"
                    }`}
                  >
                    <div
                      className={`w-3 h-3 rounded-full ${
                        dc.primary ? "bg-blue-500" : "bg-slate-400 dark:bg-slate-500"
                      }`}
                    />
                    <div className="flex-1">
                      <p className="font-medium text-slate-900 dark:text-white">{dc.name}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{dc.country}</p>
                    </div>
                    {dc.primary && (
                      <span className="text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/50 px-2 py-1 rounded">
                        Birincil
                      </span>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-6 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <Shield className="w-4 h-4 text-green-500" />
                <span>Tüm datacenter'lar ISO 27001 sertifikalı</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
