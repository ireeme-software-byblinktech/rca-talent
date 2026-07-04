export interface PlatformGrowthPoint {
  month: string;
  students: number;
  companies: number;
  requests: number;
}

export interface SkillDistribution {
  skill: string;
  count: number;
}

export interface CohortBreakdown {
  year: number;
  approved: number;
  pending: number;
  rejected: number;
}

export interface PlatformAnalytics {
  growth: PlatformGrowthPoint[];
  topSkills: SkillDistribution[];
  cohortBreakdown: CohortBreakdown[];
  recentActivity: {
    id: string;
    action: string;
    actor: string;
    time: string;
  }[];
}

export const mockAnalytics: PlatformAnalytics = {
  growth: [
    { month: "Jan", students: 12, companies: 3, requests: 5 },
    { month: "Feb", students: 18, companies: 5, requests: 8 },
    { month: "Mar", students: 24, companies: 6, requests: 12 },
    { month: "Apr", students: 31, companies: 8, requests: 18 },
    { month: "May", students: 38, companies: 10, requests: 24 },
    { month: "Jun", students: 45, companies: 12, requests: 32 },
    { month: "Jul", students: 52, companies: 14, requests: 38 },
    { month: "Aug", students: 58, companies: 16, requests: 45 },
  ],
  topSkills: [
    { skill: "React", count: 42 },
    { skill: "TypeScript", count: 38 },
    { skill: "Node.js", count: 35 },
    { skill: "Python", count: 28 },
    { skill: "Flutter", count: 22 },
    { skill: "PostgreSQL", count: 20 },
    { skill: "React Native", count: 18 },
    { skill: "Tailwind CSS", count: 16 },
  ],
  cohortBreakdown: [
    { year: 2022, approved: 8, pending: 1, rejected: 2 },
    { year: 2023, approved: 22, pending: 3, rejected: 4 },
    { year: 2024, approved: 15, pending: 5, rejected: 1 },
    { year: 2025, approved: 3, pending: 8, rejected: 0 },
  ],
  recentActivity: [
    { id: "1", action: "Approved student profile", actor: "admin@rca.rw", time: "2 hours ago" },
    { id: "2", action: "New company registered", actor: "talent@andela.rw", time: "5 hours ago" },
    { id: "3", action: "Contact request accepted", actor: "alice@student.rw", time: "1 day ago" },
    { id: "4", action: "Student profile submitted", actor: "carol@student.rw", time: "1 day ago" },
    { id: "5", action: "Contact request sent", actor: "hr@techkigali.rw", time: "2 days ago" },
  ],
};
