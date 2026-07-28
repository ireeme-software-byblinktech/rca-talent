import type { UserRole } from "@/types";

const DASHBOARD_BY_ROLE: Record<UserRole, string> = {
  student: "/student",
  company: "/company",
  admin: "/admin",
  content_manager: "/admin/blog",
};

export function getDashboardPath(role: UserRole): string {
  return DASHBOARD_BY_ROLE[role];
}
