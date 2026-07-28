"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RCALogo } from "@/components/shared/RCALogo";
import { PublicAuthButtons } from "@/components/shared/PublicAuthButtons";
import { BreakingNewsTicker } from "@/components/shared/BreakingNewsTicker";

export function PublicHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <BreakingNewsTicker />
      <header className="sticky top-0 z-50 px-3 pt-3 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <nav className="relative flex h-16 items-center justify-between rounded-2xl bg-gradient-to-r from-[#1A2B4B] to-[#2A4070] px-4 sm:px-5 shadow-[0_8px_30px_rgb(26,43,75,0.20)] backdrop-blur-xl border border-white/10">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <RCALogo size="sm" />
            <span className="font-semibold text-white text-sm sm:text-base">RCA Talent</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-6 md:flex absolute left-1/2 -translate-x-1/2">
            <Link
              href="/for-students"
              className="text-sm font-medium text-gray-200 hover:text-white transition-colors"
            >
              For Students
            </Link>
            <Link
              href="/for-companies"
              className="text-sm font-medium text-gray-200 hover:text-white transition-colors"
            >
              For Companies
            </Link>
            <Link
              href="/blog"
              className="text-sm font-medium text-gray-200 hover:text-white transition-colors"
            >
              Blog
            </Link>
            <Link
              href="/support"
              className="text-sm font-medium text-gray-200 hover:text-white transition-colors"
            >
              Support
            </Link>
          </nav>

          {/* Desktop Auth Buttons — Dashboard if logged in */}
          <div className="hidden sm:flex items-center gap-2">
            <PublicAuthButtons />
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex items-center gap-2 sm:hidden">
            <Button
              asChild
              size="sm"
              className="rounded-full px-3 h-8 bg-white text-[#1A2B4B] hover:bg-gray-100 font-semibold text-xs"
            >
              <Link href="/register">Get Started</Link>
            </Button>
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </nav>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="mt-2 rounded-2xl bg-[#1A2B4B] p-4 border border-white/10 shadow-2xl animate-in slide-in-from-top-2 md:hidden">
            <div className="flex flex-col gap-3">
              <Link
                href="/for-students"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-medium text-gray-100 hover:bg-white/10 transition-colors"
              >
                For Students
              </Link>
              <Link
                href="/for-companies"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-medium text-gray-100 hover:bg-white/10 transition-colors"
              >
                For Companies
              </Link>
              <Link
                href="/blog"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-medium text-gray-100 hover:bg-white/10 transition-colors"
              >
                Blog
              </Link>
              <Link
                href="/support"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-medium text-gray-100 hover:bg-white/10 transition-colors"
              >
                Support
              </Link>
              <div className="my-1 border-t border-white/10" />
              <div className="flex flex-col gap-2 pt-1">
                <Button
                  asChild
                  className="w-full justify-center rounded-full bg-white/15 text-white hover:bg-white hover:text-[#1A2B4B] font-semibold border border-white/20"
                >
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                    Log in
                  </Link>
                </Button>
                <Button
                  asChild
                  className="w-full justify-center rounded-full bg-white text-[#1A2B4B] hover:bg-gray-100 font-semibold"
                >
                  <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                    Get Started
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
    </>
  );
}

export function PublicFooter() {
  return (
    <footer className="border-t border-[#1A2B4B]/20 bg-gradient-to-br from-[#1A2B4B] via-[#2A4070] to-[#1A2B4B]">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-3">
          <div>
            <div className="flex items-center gap-3">
              <RCALogo size="sm" />
              <span className="font-semibold text-white">RCA Talent</span>
            </div>
            <p className="mt-3 text-sm text-white/70 leading-relaxed">
              Connecting Rwanda Coding Academy graduates with employers across
              Rwanda and beyond.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-sm text-white">Platform</h4>
            <ul className="mt-3 space-y-2 text-sm text-white/70">
              <li>
                <Link href="/for-students" className="hover:text-white transition-colors">
                  For Students
                </Link>
              </li>
              <li>
                <Link href="/for-companies" className="hover:text-white transition-colors">
                  For Companies
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-white transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/support" className="hover:text-white transition-colors">
                  Support
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm text-white">Account</h4>
            <ul className="mt-3 space-y-2 text-sm text-white/70">
              <li>
                <Link href="/login" className="hover:text-white transition-colors">
                  Log in
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-white transition-colors">
                  Register
                </Link>
              </li>
              <li>
                <Link href="/support" className="hover:text-white transition-colors">
                  Contact support
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-white/20 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-white/60">
          <div>
            © {new Date().getFullYear()} RCA Talent · Rwanda Coding Academy
          </div>
          <div className="flex items-center gap-1.5 text-xs sm:text-sm">
            <span>Powered by</span>
            <a
              href="https://blinktechnologiz.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-cyan-400 hover:text-cyan-300 transition-all duration-200 hover:underline flex items-center gap-1 group"
            >
              Blinktech
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
