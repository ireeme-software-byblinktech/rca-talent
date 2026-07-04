import {
  mockAchievements,
  mockBlogPosts,
  mockBlogSubscribers,
  mockCertifications,
  mockContentReports,
  mockConversations,
  mockInterviewInvitations,
  mockJobPostings,
  mockMessages,
  mockAuditLogs,
  mockCompanyProfiles,
  mockContactRequests,
  mockContracts,
  mockNotifications,
  mockPortfolioConfigs,
  mockProjects,
  mockStudentProfiles,
  mockUsers,
} from "./data";
import type {
  Achievement,
  AdminAuditLog,
  BlogPost,
  BlogSubscriber,
  Certification,
  CompanyProfile,
  ContactRequest,
  ContentReport,
  Contract,
  Conversation,
  InterviewInvitation,
  JobPosting,
  Message,
  Notification,
  PortfolioConfig,
  Project,
  StudentProfile,
  User,
} from "@/types";

function clone<T>(data: T): T {
  return JSON.parse(JSON.stringify(data));
}

class MockStore {
  users: User[] = clone(mockUsers);
  studentProfiles: StudentProfile[] = clone(mockStudentProfiles);
  companyProfiles: CompanyProfile[] = clone(mockCompanyProfiles);
  projects: Project[] = clone(mockProjects);
  contactRequests: ContactRequest[] = clone(mockContactRequests);
  contracts: Contract[] = clone(mockContracts);
  auditLogs: AdminAuditLog[] = clone(mockAuditLogs);
  notifications: Notification[] = clone(mockNotifications);
  certifications: Certification[] = clone(mockCertifications);
  achievements: Achievement[] = clone(mockAchievements);
  jobPostings: JobPosting[] = clone(mockJobPostings);
  conversations: Conversation[] = clone(mockConversations);
  messages: Message[] = clone(mockMessages);
  interviewInvitations: InterviewInvitation[] = clone(mockInterviewInvitations);
  contentReports: ContentReport[] = clone(mockContentReports);
  blogPosts: BlogPost[] = clone(mockBlogPosts);
  blogSubscribers: BlogSubscriber[] = clone(mockBlogSubscribers);
  portfolioConfigs: PortfolioConfig[] = clone(mockPortfolioConfigs);
}

let store: MockStore | null = null;

export function getStore(): MockStore {
  if (!store) {
    store = new MockStore();
  }
  return store;
}

export function resetStore(): void {
  store = new MockStore();
}

export function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export async function simulateDelay(ms = 300): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}
