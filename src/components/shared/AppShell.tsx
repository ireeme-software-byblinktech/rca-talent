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
  ChevronDown,
  ClipboardList,
  FileBarChart,
  FileText,
  Flag,
  FileSignature,
  FolderKanban,
  Globe,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  Megaphone,
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
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
import { adminApi } from "@/lib/api/admin";
import { messagesApi } from "@/lib/api/messages";
import { supportApi } from "@/lib/api/support";
import { RCALogo } from "@/components/shared/RCALogo";
import { BreakingNewsTicker } from "@/components/shared/BreakingNewsTicker";
import { cn, formatRelativeDate } from "@/lib/utils";
import type { UserRole } from "@/types";

type NavBadge =
  | "messages"
  | "pendingStudents"
  | "pendingCompanies"
  | "supportOpen"
  | "moderationPending";

type NavLeaf = {
  kind: "link";
  href: string;
  label: string;
  icon: React.ReactNode;
  badge?: NavBadge;
};

type NavGroup = {
  kind: "group";
  id: string;
  label: string;
  icon: React.ReactNode;
  children: NavLeaf[];
};

type NavEntry = NavLeaf | NavGroup;

const navByRole: Record<UserRole, NavEntry[]> = {
  student: [
    {
      kind: "link",
      href: "/student",
      label: "Dashboard",
      icon: <LayoutDashboard className="h-4 w-4" />,
    },
    {
      kind: "link",
      href: "/student/profile",
      label: "Profile",
      icon: <User className="h-4 w-4" />,
    },
    {
      kind: "group",
      id: "portfolio",
      label: "Portfolio",
      icon: <Globe className="h-4 w-4" />,
      children: [
        {
          kind: "link",
          href: "/student/projects",
          label: "Projects",
          icon: <FolderKanban className="h-4 w-4" />,
        },
        {
          kind: "link",
          href: "/student/portfolio",
          label: "Public page",
          icon: <Globe className="h-4 w-4" />,
        },
        {
          kind: "link",
          href: "/student/certifications",
          label: "Certifications",
          icon: <Award className="h-4 w-4" />,
        },
      ],
    },
    {
      kind: "group",
      id: "career",
      label: "Career",
      icon: <Briefcase className="h-4 w-4" />,
      children: [
        {
          kind: "link",
          href: "/student/jobs",
          label: "Opportunities",
          icon: <Briefcase className="h-4 w-4" />,
        },
        {
          kind: "link",
          href: "/student/contact-requests",
          label: "Contact Requests",
          icon: <FileText className="h-4 w-4" />,
        },
        {
          kind: "link",
          href: "/student/contracts",
          label: "Contracts",
          icon: <FileSignature className="h-4 w-4" />,
        },
        {
          kind: "link",
          href: "/student/analytics",
          label: "Analytics",
          icon: <BarChart3 className="h-4 w-4" />,
        },
      ],
    },
    {
      kind: "link",
      href: "/student/messages",
      label: "Messages",
      icon: <MessageSquare className="h-4 w-4" />,
      badge: "messages",
    },
    {
      kind: "link",
      href: "/support",
      label: "Support",
      icon: <LifeBuoy className="h-4 w-4" />,
    },
    {
      kind: "link",
      href: "/student/settings",
      label: "Settings",
      icon: <Settings className="h-4 w-4" />,
    },
  ],
  company: [
    {
      kind: "link",
      href: "/company",
      label: "Dashboard",
      icon: <LayoutDashboard className="h-4 w-4" />,
    },
    {
      kind: "group",
      id: "talent",
      label: "Talent",
      icon: <Search className="h-4 w-4" />,
      children: [
        {
          kind: "link",
          href: "/company/search",
          label: "Find Talent",
          icon: <Search className="h-4 w-4" />,
        },
        {
          kind: "link",
          href: "/company/verified-projects",
          label: "Verified Projects",
          icon: <FolderKanban className="h-4 w-4" />,
        },
        {
          kind: "link",
          href: "/company/bookmarks",
          label: "Saved Talent",
          icon: <Bookmark className="h-4 w-4" />,
        },
        {
          kind: "link",
          href: "/company/requests",
          label: "Sent Requests",
          icon: <FileText className="h-4 w-4" />,
        },
      ],
    },
    {
      kind: "group",
      id: "hiring",
      label: "Hiring",
      icon: <Briefcase className="h-4 w-4" />,
      children: [
        {
          kind: "link",
          href: "/company/jobs",
          label: "Job Postings",
          icon: <Briefcase className="h-4 w-4" />,
        },
        {
          kind: "link",
          href: "/company/applicants",
          label: "Applicants",
          icon: <ClipboardList className="h-4 w-4" />,
        },
        {
          kind: "link",
          href: "/company/interviews",
          label: "Interviews",
          icon: <Calendar className="h-4 w-4" />,
        },
        {
          kind: "link",
          href: "/company/contracts",
          label: "Contracts",
          icon: <FileSignature className="h-4 w-4" />,
        },
      ],
    },
    {
      kind: "link",
      href: "/company/messages",
      label: "Messages",
      icon: <MessageSquare className="h-4 w-4" />,
      badge: "messages",
    },
    {
      kind: "link",
      href: "/company/profile",
      label: "Company Profile",
      icon: <Building2 className="h-4 w-4" />,
    },
    {
      kind: "link",
      href: "/support",
      label: "Support",
      icon: <LifeBuoy className="h-4 w-4" />,
    },
    {
      kind: "link",
      href: "/company/settings",
      label: "Settings",
      icon: <Settings className="h-4 w-4" />,
    },
  ],
  admin: [
    {
      kind: "link",
      href: "/admin",
      label: "Overview",
      icon: <LayoutDashboard className="h-4 w-4" />,
    },
    {
      kind: "link",
      href: "/support",
      label: "Submit feedback",
      icon: <LifeBuoy className="h-4 w-4" />,
    },
    {
      kind: "group",
      id: "verification",
      label: "Verification",
      icon: <Shield className="h-4 w-4" />,
      children: [
        {
          kind: "link",
          href: "/admin/verification",
          label: "Students",
          icon: <Users className="h-4 w-4" />,
          badge: "pendingStudents",
        },
        {
          kind: "link",
          href: "/admin/employer-verification",
          label: "Employers",
          icon: <Building2 className="h-4 w-4" />,
          badge: "pendingCompanies",
        },
      ],
    },
    {
      kind: "group",
      id: "management",
      label: "Management",
      icon: <ClipboardList className="h-4 w-4" />,
      children: [
        {
          kind: "link",
          href: "/admin/users",
          label: "Users",
          icon: <Users className="h-4 w-4" />,
        },
        {
          kind: "link",
          href: "/admin/moderation",
          label: "Moderation",
          icon: <Flag className="h-4 w-4" />,
          badge: "moderationPending",
        },
        {
          kind: "link",
          href: "/admin/support",
          label: "Support inbox",
          icon: <LifeBuoy className="h-4 w-4" />,
          badge: "supportOpen",
        },
        {
          kind: "link",
          href: "/admin/blog",
          label: "Blog",
          icon: <Newspaper className="h-4 w-4" />,
        },
        {
          kind: "link",
          href: "/admin/announcements",
          label: "Announcements",
          icon: <Megaphone className="h-4 w-4" />,
        },
        {
          kind: "link",
          href: "/admin/project-reviews",
          label: "Project Reviews",
          icon: <FolderKanban className="h-4 w-4" />,
        },
        {
          kind: "link",
          href: "/admin/reports",
          label: "Reports",
          icon: <FileBarChart className="h-4 w-4" />,
        },
        {
          kind: "link",
          href: "/admin/audit-log",
          label: "Audit Log",
          icon: <ClipboardList className="h-4 w-4" />,
        },
      ],
    },
  ],
};

function pathMatches(pathname: string, href: string) {
  if (href === "/student" || href === "/company" || href === "/admin") {
    return pathname === href;
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

function CountBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-foreground px-1.5 text-[10px] font-bold text-background">
      {count > 99 ? "99+" : count}
    </span>
  );
}

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
  const entries = navByRole[role];

  const defaultOpen = useMemo(() => {
    const open = new Set<string>();
    for (const entry of entries) {
      if (entry.kind === "group") {
        if (entry.children.some((c) => pathMatches(pathname, c.href))) {
          open.add(entry.id);
        }
      }
    }
    return open;
  }, [entries, pathname]);

  const [openGroups, setOpenGroups] = useState<Set<string>>(defaultOpen);

  useEffect(() => {
    setOpenGroups((prev) => {
      const next = new Set(prev);
      defaultOpen.forEach((id) => next.add(id));
      return next;
    });
  }, [defaultOpen]);

  const { data: conversations = [] } = useQuery({
    queryKey: ["sidebar-conversations", user?.id],
    queryFn: () => messagesApi.getConversations(user!.id),
    enabled: !!user && (role === "student" || role === "company"),
    refetchInterval: 30000,
  });

  const { data: adminMetrics } = useQuery({
    queryKey: ["admin-metrics"],
    queryFn: () => adminApi.getMetrics(),
    enabled: !!user && role === "admin",
    refetchInterval: 30000,
  });

  const { data: supportStats } = useQuery({
    queryKey: ["admin-support-stats"],
    queryFn: () => supportApi.getStats(),
    enabled: !!user && role === "admin",
    refetchInterval: 30000,
  });

  const { data: contentReports = [] } = useQuery({
    queryKey: ["admin-content-reports"],
    queryFn: () => adminApi.getContentReports(),
    enabled: !!user && role === "admin",
    refetchInterval: 30000,
  });

  const unreadMessages = useMemo(
    () => conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0),
    [conversations]
  );

  const badgeCounts = useMemo(
    (): Record<NavBadge, number> => ({
      messages: unreadMessages,
      pendingStudents: adminMetrics?.pendingStudents ?? 0,
      pendingCompanies: adminMetrics?.pendingCompanies ?? 0,
      supportOpen: (supportStats?.open ?? 0) + (supportStats?.inProgress ?? 0),
      moderationPending: contentReports.filter((r) => r.status === "pending")
        .length,
    }),
    [unreadMessages, adminMetrics, supportStats, contentReports]
  );

  const getBadgeCount = (badge?: NavBadge) =>
    badge ? badgeCounts[badge] : 0;

  const initials = user?.email?.slice(0, 2).toUpperCase() ?? "U";

  const toggleGroup = (id: string) => {
    setOpenGroups((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const renderLink = (item: NavLeaf, nested = false) => {
    const active = pathMatches(pathname, item.href);
    const badgeCount = getBadgeCount(item.badge);

    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={() => setSidebarOpen(false)}
        className={cn(
          "flex items-center gap-3 rounded-full px-3 py-2 text-sm font-medium transition-all",
          nested && "rounded-xl",
          active
            ? "sidebar-nav-active"
            : "text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
        )}
      >
        {item.icon}
        <span className="flex-1 truncate">{item.label}</span>
        <CountBadge count={badgeCount} />
      </Link>
    );
  };

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
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border/60 bg-card shadow-2xl transition-transform lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-border/60 bg-card px-5">
          <Link href="/" className="flex items-center gap-2.5">
            <RCALogo size="sm" />
            <span className="text-sm font-semibold text-foreground">
              RCA Talent
            </span>
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

        <nav className="flex-1 space-y-1 overflow-y-auto p-3 font-sans">
          {entries.map((entry) => {
            if (entry.kind === "link") {
              return renderLink(entry);
            }

            const expanded = openGroups.has(entry.id);
            const childActive = entry.children.some((c) =>
              pathMatches(pathname, c.href)
            );
            const groupBadgeCount = entry.children.reduce(
              (sum, child) => sum + getBadgeCount(child.badge),
              0
            );

            return (
              <div key={entry.id} className="space-y-1">
                <button
                  type="button"
                  onClick={() => toggleGroup(entry.id)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-full px-3 py-2 text-sm font-medium transition-all",
                    childActive
                      ? "text-[#1A2B4B] font-bold bg-secondary/50"
                      : "text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
                  )}
                >
                  {entry.icon}
                  <span className="flex-1 truncate text-left">{entry.label}</span>
                  {!expanded && <CountBadge count={groupBadgeCount} />}
                  <ChevronDown
                    className={cn(
                       "h-4 w-4 shrink-0 opacity-80 transition-transform",
                      expanded && "rotate-180"
                    )}
                  />
                </button>
 
                {expanded && (
                  <div className="relative ml-5 space-y-0.5 border-l border-border/70 pl-3">
                    {entry.children.map((child) => renderLink(child, true))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
 
        <div className="border-t border-border/60 bg-card p-4 flex flex-col gap-2">
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
            className="w-full justify-start gap-2 text-muted-foreground"
            onClick={() => logout()}
          >
            <LogOut className="h-4 w-4" />
            Log out
          </Button>
        </div>
      </aside>

      <div className="lg:pl-64">
        {(role === "student" || role === "company") && <BreakingNewsTicker />}
        <header className="sticky top-0 z-30 px-4 pt-4 sm:px-6">
          <div className="mx-auto max-w-6xl">
            <nav className="flex h-14 items-center justify-between gap-4 rounded-2xl border border-white/10 bg-gradient-to-r from-[#1A2B4B] to-[#2A4070] px-5 shadow-[0_8px_30px_rgb(26,43,75,0.20)] backdrop-blur-xl">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/10 hover:text-white lg:hidden"
                  onClick={() => setSidebarOpen(true)}
                >
                  <Menu className="h-5 w-5" />
                </Button>
                {title && (
                  <h1 className="hidden truncate text-base font-semibold text-white sm:block">
                    {title}
                  </h1>
                )}
              </div>

              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="relative h-9 w-9 text-white hover:bg-white/10 hover:text-white"
                    >
                      <Bell className="h-4 w-4" />
                      {unreadCount > 0 && (
                        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-[#1A2B4B]">
                          {unreadCount}
                        </span>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="mt-2 w-80">
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
                          <span className="line-clamp-2 text-xs text-muted-foreground">
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
