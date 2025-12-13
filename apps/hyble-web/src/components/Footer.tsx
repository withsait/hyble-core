"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-50 dark:bg-[#0808CC] border-t border-gray-200 dark:border-white/10 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-gray-900 dark:text-white">hyble</span>
            <span className="text-gray-400">•</span>
            <span className="text-sm text-gray-500 dark:text-gray-400">© 2025</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
            <Link href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Terms</Link>
            <Link href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
