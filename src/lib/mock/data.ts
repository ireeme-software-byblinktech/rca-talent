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

export const mockUsers: User[] = [
  {
    id: "user-admin-1",
    email: "admin@rca.rw",
    role: "admin",
    createdAt: "2024-01-01T00:00:00Z",
    isActive: true,
  },
  {
    id: "user-student-1",
    email: "alice@student.rw",
    role: "student",
    createdAt: "2024-06-01T00:00:00Z",
    isActive: true,
  },
  {
    id: "user-student-2",
    email: "bob@student.rw",
    role: "student",
    createdAt: "2024-06-15T00:00:00Z",
    isActive: true,
  },
  {
    id: "user-student-3",
    email: "carol@student.rw",
    role: "student",
    createdAt: "2024-07-01T00:00:00Z",
    isActive: true,
  },
  {
    id: "user-company-1",
    email: "hr@techkigali.rw",
    role: "company",
    createdAt: "2024-05-01T00:00:00Z",
    isActive: true,
  },
  {
    id: "user-company-2",
    email: "talent@andela.rw",
    role: "company",
    createdAt: "2024-05-15T00:00:00Z",
    isActive: true,
  },
  {
    id: "user-company-3",
    email: "hr@startup.rw",
    role: "company",
    createdAt: "2024-09-10T00:00:00Z",
    isActive: true,
  },
];

export const mockStudentProfiles: StudentProfile[] = [
  {
    userId: "user-student-1",
    fullName: "Alice Uwimana",
    bio: "Full-stack developer passionate about building accessible web applications for Rwanda. RCA Class of 2023.",
    skills: ["React", "TypeScript", "Node.js", "PostgreSQL", "Tailwind CSS"],
    links: {
      github: "https://github.com/aliceuwimana",
      linkedin: "https://linkedin.com/in/aliceuwimana",
      portfolio: "https://aliceuwimana.dev",
    },
    photoUrl: undefined,
    cvUrl: "/mock/cv-alice.pdf",
    verificationStatus: "approved",
    cohortYear: 2023,
    availability: ["full-time", "freelance"],
    isVisible: true,
    updatedAt: "2024-08-01T00:00:00Z",
  },
  {
    userId: "user-student-2",
    fullName: "Bob Nshimiyimana",
    bio: "Mobile developer specializing in React Native and Flutter. Building apps for local businesses.",
    skills: ["React Native", "Flutter", "Dart", "Firebase", "REST APIs"],
    links: {
      github: "https://github.com/bobnsh",
      linkedin: "https://linkedin.com/in/bobnsh",
    },
    verificationStatus: "approved",
    cohortYear: 2023,
    availability: ["internship", "freelance"],
    isVisible: true,
    updatedAt: "2024-08-05T00:00:00Z",
  },
  {
    userId: "user-student-3",
    fullName: "Carol Mukamana",
    bio: "Data science enthusiast with experience in Python and machine learning.",
    skills: ["Python", "Pandas", "Scikit-learn", "SQL", "Data Visualization"],
    links: {
      github: "https://github.com/carolmuk",
    },
    verificationStatus: "pending",
    cohortYear: 2024,
    availability: ["internship"],
    isVisible: true,
    updatedAt: "2024-09-01T00:00:00Z",
  },
];

export const mockCompanyProfiles: CompanyProfile[] = [
  {
    userId: "user-company-1",
    companyName: "TechKigali Ltd",
    description:
      "Leading software development company in Kigali, building solutions for East African markets.",
    industry: "Technology",
    website: "https://techkigali.rw",
    verificationStatus: "approved",
    updatedAt: "2024-06-01T00:00:00Z",
  },
  {
    userId: "user-company-2",
    companyName: "Andela Rwanda",
    description:
      "Global talent network connecting African developers with opportunities worldwide.",
    industry: "Technology / HR",
    website: "https://andela.com",
    verificationStatus: "approved",
    updatedAt: "2024-06-15T00:00:00Z",
  },
  {
    userId: "user-company-3",
    companyName: "Kigali Startup Hub",
    description: "Early-stage fintech startup building mobile payment solutions.",
    industry: "Fintech",
    website: "https://kigalistartup.rw",
    verificationStatus: "pending",
    updatedAt: "2024-09-10T00:00:00Z",
  },
];

export const mockProjects: Project[] = [
  {
    id: "proj-1",
    studentId: "user-student-1",
    title: "AgriConnect",
    description:
      "A platform connecting smallholder farmers with buyers and agricultural advisors in Rwanda.",
    techStack: ["React", "Node.js", "PostgreSQL", "Mapbox"],
    links: {
      demo: "https://agriconnect-demo.rw",
      repo: "https://github.com/aliceuwimana/agriconnect",
    },
    images: [
      "https://images.unsplash.com/photo-1625246333195-78aa78677764?w=800&q=80",
    ],
    createdAt: "2024-07-01T00:00:00Z",
    updatedAt: "2024-07-01T00:00:00Z",
  },
  {
    id: "proj-2",
    studentId: "user-student-1",
    title: "HealthTrack RW",
    description:
      "Mobile-first health records tracker for community health workers.",
    techStack: ["React Native", "Firebase", "TypeScript"],
    links: { repo: "https://github.com/aliceuwimana/healthtrack" },
    images: [
      "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&q=80",
    ],
    createdAt: "2024-07-15T00:00:00Z",
    updatedAt: "2024-07-15T00:00:00Z",
  },
  {
    id: "proj-3",
    studentId: "user-student-2",
    title: "MomoPay Clone",
    description: "Mobile money payment app prototype for local merchants.",
    techStack: ["Flutter", "Dart", "Firebase"],
    links: { repo: "https://github.com/bobnsh/momopay" },
    images: [
      "https://images.unsplash.com/photo-1563013547-829f043a399a?w=800&q=80",
    ],
    createdAt: "2024-07-10T00:00:00Z",
    updatedAt: "2024-07-10T00:00:00Z",
  },
];

export const mockContactRequests: ContactRequest[] = [
  {
    id: "cr-1",
    companyId: "user-company-1",
    studentId: "user-student-1",
    status: "accepted",
    message:
      "Hi Alice, we loved your AgriConnect project. We'd like to discuss a full-time role on our team.",
    createdAt: "2024-08-10T00:00:00Z",
    respondedAt: "2024-08-11T00:00:00Z",
  },
  {
    id: "cr-2",
    companyId: "user-company-2",
    studentId: "user-student-1",
    status: "pending",
    message:
      "Hello Alice, Andela is looking for talented full-stack developers. Would you be interested in a chat?",
    createdAt: "2024-08-20T00:00:00Z",
  },
  {
    id: "cr-3",
    companyId: "user-company-1",
    studentId: "user-student-2",
    status: "pending",
    message:
      "Hi Bob, your mobile development skills look great. We have an internship opening.",
    createdAt: "2024-08-22T00:00:00Z",
  },
];

export const mockAuditLogs: AdminAuditLog[] = [
  {
    id: "audit-1",
    adminId: "user-admin-1",
    action: "approved_student",
    targetType: "student",
    targetId: "user-student-1",
    createdAt: "2024-08-01T10:00:00Z",
  },
  {
    id: "audit-2",
    adminId: "user-admin-1",
    action: "approved_student",
    targetType: "student",
    targetId: "user-student-2",
    createdAt: "2024-08-05T14:30:00Z",
  },
  {
    id: "audit-3",
    adminId: "user-admin-1",
    action: "rejected_student",
    targetType: "student",
    targetId: "user-student-rejected",
    reason: "Incomplete profile — missing portfolio projects",
    createdAt: "2024-07-20T09:00:00Z",
  },
];

export const mockNotifications: Notification[] = [
  {
    id: "notif-1",
    userId: "user-student-1",
    title: "Profile approved",
    message: "Your profile has been verified and is now visible to companies.",
    read: true,
    createdAt: "2024-08-01T10:00:00Z",
    type: "verification",
  },
  {
    id: "notif-2",
    userId: "user-student-1",
    title: "New contact request",
    message: "Andela Rwanda sent you a contact request.",
    read: false,
    createdAt: "2024-08-20T00:00:00Z",
    type: "contact_request",
  },
  {
    id: "notif-3",
    userId: "user-student-2",
    title: "New contact request",
    message: "TechKigali Ltd sent you a contact request.",
    read: false,
    createdAt: "2024-08-22T00:00:00Z",
    type: "contact_request",
  },
];

export const MOCK_PASSWORD = "password123";

export const SKILL_OPTIONS = [
  "React",
  "TypeScript",
  "Node.js",
  "Python",
  "Flutter",
  "React Native",
  "PostgreSQL",
  "MongoDB",
  "Firebase",
  "Tailwind CSS",
  "Docker",
  "AWS",
  "REST APIs",
  "GraphQL",
  "Machine Learning",
  "Data Visualization",
  "UI/UX Design",
  "Java",
  "C++",
  "Go",
];

export const INDUSTRY_OPTIONS = [
  "Technology",
  "Finance",
  "Healthcare",
  "Education",
  "Agriculture",
  "E-commerce",
  "Telecommunications",
  "Government",
  "Non-profit",
  "Other",
];

export const COHORT_YEARS = [2022, 2023, 2024, 2025, 2026];

export const mockCertifications: Certification[] = [
  {
    id: "cert-1",
    studentId: "user-student-1",
    title: "AWS Cloud Practitioner",
    issuer: "Amazon Web Services",
    issueDate: "2024-03-15",
    credentialUrl: "https://aws.amazon.com/verification",
    imageUrl:
      "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400&q=80",
  },
  {
    id: "cert-2",
    studentId: "user-student-1",
    title: "Meta Front-End Developer",
    issuer: "Meta / Coursera",
    issueDate: "2023-11-20",
    imageUrl:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&q=80",
  },
];

export const mockAchievements: Achievement[] = [
  {
    id: "ach-1",
    studentId: "user-student-1",
    title: "RCA Hackathon Winner 2023",
    organization: "Rwanda Coding Academy",
    description: "First place for AgriConnect prototype at RCA annual hackathon.",
    date: "2023-12-01",
  },
  {
    id: "ach-2",
    studentId: "user-student-1",
    title: "Dean's List",
    organization: "Rwanda Coding Academy",
    description: "Academic excellence award for 2023 cohort.",
    date: "2023-06-15",
  },
];

export const mockJobPostings: JobPosting[] = [
  {
    id: "job-1",
    companyId: "user-company-1",
    title: "Junior Full-Stack Developer",
    description: "Join our team building fintech solutions for East Africa.",
    type: "full-time",
    location: "Kigali, Rwanda",
    skills: ["React", "Node.js", "TypeScript"],
    status: "open",
    createdAt: "2024-08-01T00:00:00Z",
  },
  {
    id: "job-2",
    companyId: "user-company-1",
    title: "Software Engineering Intern",
    description: "6-month internship for RCA graduates passionate about web development.",
    type: "internship",
    location: "Kigali, Rwanda (Hybrid)",
    skills: ["JavaScript", "React", "Git"],
    status: "open",
    createdAt: "2024-08-10T00:00:00Z",
  },
];

export const mockConversations: Conversation[] = [
  {
    id: "conv-1",
    participantIds: ["user-student-1", "user-company-1"],
    lastMessage: "Looking forward to our call on Monday!",
    updatedAt: "2024-08-12T14:00:00Z",
  },
  {
    id: "conv-2",
    participantIds: ["user-student-1", "user-company-2"],
    lastMessage: "Thank you for your interest in Andela.",
    updatedAt: "2024-08-20T09:30:00Z",
  },
];

export const mockMessages: Message[] = [
  {
    id: "msg-1",
    conversationId: "conv-1",
    senderId: "user-company-1",
    recipientId: "user-student-1",
    body: "Hi Alice, we loved your AgriConnect project. Would you be available for a chat this week?",
    read: true,
    createdAt: "2024-08-11T10:00:00Z",
  },
  {
    id: "msg-2",
    conversationId: "conv-1",
    senderId: "user-student-1",
    recipientId: "user-company-1",
    body: "Thank you! I'm available Monday or Tuesday afternoon.",
    read: true,
    createdAt: "2024-08-11T11:30:00Z",
  },
  {
    id: "msg-3",
    conversationId: "conv-1",
    senderId: "user-company-1",
    recipientId: "user-student-1",
    body: "Looking forward to our call on Monday!",
    read: false,
    createdAt: "2024-08-12T14:00:00Z",
  },
  {
    id: "msg-4",
    conversationId: "conv-2",
    senderId: "user-company-2",
    recipientId: "user-student-1",
    body: "Thank you for your interest in Andela. We'll review your profile shortly.",
    read: true,
    createdAt: "2024-08-20T09:30:00Z",
  },
];

export const mockInterviewInvitations: InterviewInvitation[] = [
  {
    id: "int-1",
    companyId: "user-company-1",
    studentId: "user-student-1",
    jobId: "job-1",
    scheduledAt: "2024-08-25T10:00:00Z",
    location: "TechKigali Office, Kigali",
    message: "We'd like to invite you for a technical interview for the Full-Stack Developer role.",
    status: "completed",
    createdAt: "2024-08-15T00:00:00Z",
  },
];

export const mockContracts: Contract[] = [
  {
    id: "contract-1",
    companyId: "user-company-1",
    studentId: "user-student-1",
    jobId: "job-1",
    interviewId: "int-1",
    title: "Employment Agreement — Junior Full-Stack Developer",
    role: "Junior Full-Stack Developer",
    startDate: "2024-09-01",
    compensation: "RWF 800,000 / month",
    terms: `This Employment Agreement ("Agreement") is entered into between TechKigali Ltd ("Employer") and the Student ("Employee").

1. POSITION: Employee shall serve as Junior Full-Stack Developer reporting to the Engineering Lead.

2. START DATE: Employment commences on the agreed start date.

3. COMPENSATION: As stated in this contract. Paid monthly via bank transfer.

4. WORK LOCATION: Kigali, Rwanda — hybrid (3 days office).

5. CONFIDENTIALITY: Employee agrees to protect proprietary information.

6. TERMINATION: Either party may terminate with 30 days written notice.

By signing below, both parties agree to the terms of this Agreement.`,
    status: "pending_student",
    companySignature: {
      userId: "user-company-1",
      signerName: "TechKigali Ltd",
      signedAt: "2024-08-28T10:00:00Z",
      signatureData: "typed:TechKigali Ltd",
      method: "typed",
    },
    createdAt: "2024-08-28T09:00:00Z",
    updatedAt: "2024-08-28T10:00:00Z",
  },
];

export const mockContentReports: ContentReport[] = [
  {
    id: "report-1",
    reporterId: "user-company-1",
    targetType: "student",
    targetId: "user-student-rejected",
    reason: "Profile contains incomplete or misleading information",
    status: "pending",
    createdAt: "2024-07-21T00:00:00Z",
  },
];

export const mockBlogPosts: BlogPost[] = [
  {
    id: "blog-1",
    slug: "rca-graduates-shaping-rwandas-tech-future",
    title: "RCA Graduates Are Shaping Rwanda's Tech Future",
    excerpt:
      "How Rwanda Coding Academy alumni are building products, startups, and careers across East Africa.",
    content: `Rwanda Coding Academy has become a launchpad for a new generation of developers. From fintech to agritech, RCA graduates are shipping real products and joining top employers.

## Building in public

Many students showcase projects on RCA Talent — from farmer marketplaces to health dashboards. Employers browse portfolios before reaching out, making the hiring process more transparent and skills-focused.

## What's next

With internship pipelines growing and remote work opening global doors, RCA talent is well positioned to lead Rwanda's digital economy. Subscribe to our blog for career tips, success stories, and platform updates.`,
    author: "RCA Talent Team",
    coverImage:
      "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&q=80",
    tags: ["RCA", "Careers", "Rwanda"],
    published: true,
    publishedAt: "2024-09-01T00:00:00Z",
    updatedAt: "2024-09-01T00:00:00Z",
  },
  {
    id: "blog-2",
    slug: "how-to-build-a-developer-portfolio-that-gets-hired",
    title: "How to Build a Developer Portfolio That Gets You Hired",
    excerpt:
      "Practical tips for RCA students: projects, storytelling, and making your profile stand out to recruiters.",
    content: `Your portfolio is often the first impression employers get. Here's how to make it count.

## Lead with impact

Don't just list technologies — explain the problem you solved. Who benefited? What was hard? What did you learn?

## Show your best work

Quality beats quantity. Two polished projects with live demos outperform ten half-finished repos.

## Use RCA Talent's portfolio builder

Customize your public page with a custom slug, theme, and section layout. Share \`/p/your-name\` on LinkedIn and in applications.

## Keep it updated

Add certifications, hackathon wins, and new projects as you grow. Recruiters notice active profiles.`,
    author: "RCA Talent Team",
    coverImage:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=80",
    tags: ["Portfolio", "Students", "Tips"],
    published: true,
    publishedAt: "2024-09-15T00:00:00Z",
    updatedAt: "2024-09-15T00:00:00Z",
  },
  {
    id: "blog-3",
    slug: "employers-guide-to-hiring-rca-interns",
    title: "An Employer's Guide to Hiring RCA Interns",
    excerpt:
      "Why companies partner with RCA Talent and how to find your next intern or junior developer.",
    content: `RCA students graduate with hands-on project experience and modern stack skills. Here's how employers get the most from the platform.

## Verified talent

Admin-verified student profiles give you confidence in who you're contacting.

## Search and bookmark

Filter by skills, cohort year, and availability. Save promising candidates for later.

## Post internships

Create job listings and invite accepted candidates to interviews — all in one place.

## Subscribe for updates

Stay informed about new cohorts, platform features, and hiring best practices.`,
    author: "RCA Talent Team",
    coverImage:
      "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&q=80",
    tags: ["Employers", "Internships", "Hiring"],
    published: true,
    publishedAt: "2024-10-01T00:00:00Z",
    updatedAt: "2024-10-01T00:00:00Z",
  },
];

export const mockBlogSubscribers: BlogSubscriber[] = [
  {
    id: "sub-1",
    email: "alice@student.rw",
    userId: "user-student-1",
    active: true,
    subscribedAt: "2024-08-01T00:00:00Z",
  },
];

export const mockPortfolioConfigs: PortfolioConfig[] = [
  {
    studentId: "user-student-1",
    slug: "alice-uwimana",
    tagline: "Full-stack developer building accessible web apps for Rwanda",
    theme: "modern",
    sections: {
      about: true,
      skills: true,
      projects: true,
      certifications: true,
      achievements: true,
    },
    projectOrder: ["proj-1", "proj-2"],
    certificationOrder: ["cert-1", "cert-2"],
    achievementOrder: ["ach-1", "ach-2"],
    isPublished: true,
    updatedAt: "2024-09-01T00:00:00Z",
  },
];
