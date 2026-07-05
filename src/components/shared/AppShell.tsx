"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Award,
  BarChart3,
  Bell,
  Bookmark,
  Briefcase,
  Building2,
  Calendar,
  ClipboardList,
  FileBarChart,
  FileText,
  Flag,
  FileSignature,
  FolderKanban,
  Globe,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Newspaper,
  Search,
  Settings,
  Shield,
  User,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNotifications } from "@/hooks/useNotifications";
import { useAuth } from "@/lib/auth/context";
import { RCALogo } from "@/components/shared/RCALogo";
import { cn, formatRelativeDate } from "@/lib/utils";
import type { UserRole } from "@/types";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

interface NavSection {
  label?: string;
  items: NavItem[];
}

const navSectionsByRole: Record<UserRole, NavSection[]> = {
  student: [
    {
      items: [
        { href: "/student", label: "Dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
        { href: "/student/profile", label: "Profile", icon: <User className="h-4 w-4" /> },
        { href: "/student/projects", label: "Projects", icon: <FolderKanban className="h-4 w-4" /> },
        { href: "/student/portfolio", label: "Portfolio", icon: <Globe className="h-4 w-4" /> },
        { href: "/student/certifications", label: "Certifications", icon: <Award className="h-4 w-4" /> },
        { href: "/student/contact-requests", label: "Contact Requests", icon: <FileText className="h-4 w-4" /> },
        { href: "/student/messages", label: "Messages", icon: <MessageSquare className="h-4 w-4" /> },
        { href: "/student/contracts", label: "Contracts", icon: <FileSignature className="h-4 w-4" /> },
        { href: "/student/analytics", label: "Career Analytics", icon: <BarChart3 className="h-4 w-4" /> },
        { href: "/student/settings", label: "Settings", icon: <Settings className="h-4 w-4" /> },
      ],
    },
  ],
  company: [
    {
      items: [
        { href: "/company", label: "Dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
        { href: "/company/search", label: "Find Talent", icon: <Search className="h-4 w-4" /> },
        { href: "/company/jobs", label: "Job Postings", icon: <Briefcase className="h-4 w-4" /> },
        { href: "/company/bookmarks", label: "Saved Talent", icon: <Bookmark className="h-4 w-4" /> },
        { href: "/company/requests", label: "Sent Requests", icon: <FileText className="h-4 w-4" /> },
        { href: "/company/interviews", label: "Interviews", icon: <Calendar className="h-4 w-4" /> },
        { href: "/company/contracts", label: "Contracts", icon: <FileSignature className="h-4 w-4" /> },
        { href: "/company/messages", label: "Messages", icon: <MessageSquare className="h-4 w-4" /> },
        { href: "/company/profile", label: "Company Profile", icon: <Building2 className="h-4 w-4" /> },
        { href: "/company/settings", label: "Settings", icon: <Settings className="h-4 w-4" /> },
      ],
    },
  ],
  admin: [
    {
      items: [
        { href: "/admin", label: "Overview", icon: <LayoutDashboard className="h-4 w-4" /> },
      ],
    },
    {
      label: "Verification",
      items: [
        { href: "/admin/verification", label: "Student Verification", icon: <Shield className="h-4 w-4" /> },
        { href: "/admin/employer-verification", label: "Employer Verification", icon: <Building2 className="h-4 w-4" /> },
      ],
    },
    {
      label: "Management",
      items: [
        { href: "/admin/users", label: "User Management", icon: <Users className="h-4 w-4" /> },
        { href: "/admin/moderation", label: "Content Moderation", icon: <Flag className="h-4 w-4" /> },
        { href: "/admin/blog", label: "Blog", icon: <Newspaper className="h-4 w-4" /> },
        { href: "/admin/reports", label: "Reports", icon: <FileBarChart className="h-4 w-4" /> },
        { href: "/admin/audit-log", label: "Audit Log", icon: <ClipboardList className="h-4 w-4" /> },
      ],
    },
  ],
};

interface AppShellProps {
  children: React.ReactNode;
  role: UserRole;
  title?: string;
}

export function AppShell({ children, role, title }: AppShellProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } =
    useNotifications();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navSections = navSectionsByRole[role];
  const initials = user?.email?.slice(0, 2).toUpperCase() ?? "U";

  return (
    <div className="min-h-screen bg-background">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border/60 bg-card shadow-elevated transition-transform lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-border/60 px-5">
          <Link href="/" className="flex items-center gap-2.5">
            <RCALogo size="sm" />
            <span className="font-semibold text-foreground text-sm">RCA Talent</span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 font-sans">
          {navSections.map((section, sectionIdx) => (
            <div key={section.label ?? sectionIdx} className={cn(sectionIdx > 0 && "mt-6")}>
              {section.label && (
                <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/80">
                  {section.label}
                </p>
              )}
              <div className="space-y-0.5">
                {section.items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                      pathname === item.href
                        ? "sidebar-nav-active"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    )}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-t p-4">
          <div className="flex items-center gap-3 px-3 py-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs">{initials}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{user?.email}</p>
              <p className="text-xs capitalize text-muted-foreground">{role}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="mt-2 w-full justify-start gap-2 text-muted-foreground"
            onClick={() => logout()}
          >
            <LogOut className="h-4 w-4" />
            Log out
          </Button>
        </div>
      </aside>

      <div className="lg:pl-64">
        {/* Modern Floating Navbar */}
        <header className="sticky top-0 z-30 px-4 pt-4 sm:px-6">
          <div className="mx-auto max-w-6xl">
            <nav className="flex h-14 items-center justify-between gap-4 rounded-2xl bg-gradient-to-r from-[#1A2B4B] to-[#2A4070] px-5 shadow-[0_8px_30px_rgb(26,43,75,0.20)] backdrop-blur-xl border border-white/10">
              {/* Left: Mobile Menu + Title */}
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden text-white hover:bg-white/10 hover:text-white"
                  onClick={() => setSidebarOpen(true)}
                >
                  <Menu className="h-5 w-5" />
                </Button>
                {title && (
                  <h1 className="text-base font-semibold text-white hidden sm:block truncate">
                    {title}
                  </h1>
                )}
              </div>

              {/* Right: Notifications */}
              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="relative text-white hover:bg-white/10 hover:text-white h-9 w-9"
                    >
                      <Bell className="h-4 w-4" />
                      {unreadCount > 0 && (
                        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-[#1A2B4B]">
                          {unreadCount}
                        </span>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-80 mt-2">
                    <div className="flex items-center justify-between px-3 py-2">
                      <span className="text-sm font-semibold">Notifications</span>
                      {unreadCount > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-auto p-0 text-xs"
                          onClick={() => markAllAsRead()}
                        >
                          Mark all read
                        </Button>
                      )}
                    </div>
                    <DropdownMenuSeparator />
                    {notifications.length === 0 ? (
                      <div className="px-3 py-6 text-center text-sm text-muted-foreground">
                        No notifications yet
                      </div>
                    ) : (
                      notifications.slice(0, 5).map((n) => (
                        <DropdownMenuItem
                          key={n.id}
                          className="flex flex-col items-start gap-1 p-3"
                          onClick={() => markAsRead(n.id)}
                        >
                          <div className="flex w-full items-start justify-between gap-2">
                            <span
                              className={cn(
                                "text-sm",
                                !n.read && "font-semibold"
                              )}
                            >
                              {n.title}
                            </span>
                            {!n.read && (
                              <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground line-clamp-2">
                            {n.message}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatRelativeDate(n.createdAt)}
                          </span>
                        </DropdownMenuItem>
                      ))
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </nav>
          </div>
        </header>

        <main className="p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
