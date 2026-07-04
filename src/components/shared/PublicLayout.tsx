import Link from "next/link";
import { Button } from "@/components/ui/button";
import { RCALogo } from "@/components/shared/RCALogo";

export function PublicHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-card/95 backdrop-blur-md shadow-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-3">
          <RCALogo size="sm" />
          <span className="font-semibold text-foreground">RCA Talent</span>
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          <Link
            href="/for-students"
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            For Students
          </Link>
          <Link
            href="/for-companies"
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            For Companies
          </Link>
          <Link
            href="/blog"
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            Blog
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <Button variant="ghost" asChild className="font-medium">
            <Link href="/login">Log in</Link>
          </Button>
          <Button asChild className="rounded-full px-6">
            <Link href="/register">Get Started</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

export function PublicFooter() {
  return (
    <footer className="border-t border-border/60 bg-card">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-3">
          <div>
            <div className="flex items-center gap-3">
              <RCALogo size="sm" />
              <span className="font-semibold">RCA Talent</span>
            </div>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              Connecting Rwanda Coding Academy graduates with employers across
              Rwanda and beyond.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-sm">Platform</h4>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/for-students" className="hover:text-primary transition-colors">
                  For Students
                </Link>
              </li>
              <li>
                <Link href="/for-companies" className="hover:text-primary transition-colors">
                  For Companies
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-primary transition-colors">
                  Blog
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm">Account</h4>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/login" className="hover:text-primary transition-colors">
                  Log in
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-primary transition-colors">
                  Register
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-primary transition-colors">
                  Subscribe on the blog
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-border/60 pt-8 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} RCA Talent · Rwanda Coding Academy
        </div>
      </div>
    </footer>
  );
}
