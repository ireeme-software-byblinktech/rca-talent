import Link from "next/link";
import { Button } from "@/components/ui/button";
import { RCALogo } from "@/components/shared/RCALogo";

export function PublicHeader() {
  return (
    <header className="sticky top-0 z-50 px-4 pt-4 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <nav className="flex h-14 items-center justify-between rounded-2xl bg-gradient-to-r from-[#1A2B4B] to-[#2A4070] px-5 shadow-[0_8px_30px_rgb(26,43,75,0.20)] backdrop-blur-xl border border-white/10">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 shrink-0">
            <RCALogo size="sm" />
            <span className="font-semibold text-white text-sm">RCA Talent</span>
          </Link>

          {/* Center Navigation - Hidden on mobile */}
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
          </nav>

          {/* Right: Auth Buttons */}
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              asChild 
              className="font-medium text-white hover:bg-white/10 hover:text-white h-9 px-4"
            >
              <Link href="/login">Log in</Link>
            </Button>
            <Button 
              asChild 
              className="rounded-full px-5 h-9 bg-white text-[#1A2B4B] hover:bg-gray-100 font-semibold"
            >
              <Link href="/register">Get Started</Link>
            </Button>
          </div>
        </nav>
      </div>
    </header>
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
                <Link href="/blog" className="hover:text-white transition-colors">
                  Subscribe on the blog
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-white/20 pt-8 text-center text-sm text-white/60">
          © {new Date().getFullYear()} RCA Talent · Rwanda Coding Academy
        </div>
      </div>
    </footer>
  );
}
