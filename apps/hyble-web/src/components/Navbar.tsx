"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { ChevronDown, Menu, X } from "lucide-react";

const navLinks = [
  {
    name: "Cloud",
    href: "#features",
    hasDropdown: true
  },
  {
    name: "Solutions",
    href: "#about",
    hasDropdown: true
  },
  {
    name: "Developers",
    href: "/docs",
    hasDropdown: true
  },
  {
    name: "Pricing",
    href: "#pricing",
    hasDropdown: false
  },
];

// Auth URLs
const AUTH_URL = "https://id.hyble.co";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled
        ? "bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm"
        : "bg-white border-b border-gray-100"
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Left: Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2.5">
              {/* Logo Icon */}
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                <svg
                  viewBox="0 0 24 24"
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="4 17 10 11 4 5"></polyline>
                  <line x1="12" y1="19" x2="20" y2="19"></line>
                </svg>
              </div>
              <span className="text-xl font-bold text-gray-900 tracking-tight">
                HYBLE
              </span>
            </Link>
          </div>

          {/* Center: Navigation Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="flex items-center gap-1 px-4 py-2 text-[15px] font-medium text-gray-600 hover:text-gray-900 transition-colors rounded-lg hover:bg-gray-50"
              >
                {link.name}
                {link.hasDropdown && (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                )}
              </Link>
            ))}
          </div>

          {/* Right: Auth Buttons */}
          <div className="flex items-center gap-3">
            {/* Register Button - Outlined */}
            <a
              href={`${AUTH_URL}/register`}
              className="hidden sm:flex items-center gap-1.5 px-4 py-2 text-[14px] font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-all"
            >
              Register
            </a>

            {/* Login Button - Filled Dark */}
            <a
              href={`${AUTH_URL}/login`}
              className="hidden sm:flex items-center px-5 py-2 text-[14px] font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-all"
            >
              Login
            </a>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden transition-all duration-300 overflow-hidden ${mobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="bg-white border-t border-gray-100 px-4 py-3 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="flex items-center justify-between py-2.5 px-3 text-[15px] font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.name}
              {link.hasDropdown && (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              )}
            </Link>
          ))}

          <div className="pt-3 mt-2 border-t border-gray-100 space-y-2">
            <a
              href={`${AUTH_URL}/register`}
              className="block w-full text-center py-2.5 text-[15px] font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Register
            </a>
            <a
              href={`${AUTH_URL}/login`}
              className="block w-full text-center py-2.5 text-[15px] font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Login
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}
