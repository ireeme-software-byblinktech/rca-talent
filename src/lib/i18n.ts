const strings = {
  en: {
    common: {
      loading: "Loading...",
      error: "Something went wrong",
      retry: "Try again",
      save: "Save",
      cancel: "Cancel",
      delete: "Delete",
      edit: "Edit",
      search: "Search",
      filter: "Filter",
      noResults: "No results found",
      back: "Back",
      next: "Next",
      submit: "Submit",
      confirm: "Confirm",
    },
    nav: {
      home: "Home",
      forStudents: "For Students",
      forCompanies: "For Companies",
      login: "Log in",
      register: "Get Started",
      dashboard: "Dashboard",
      profile: "Profile",
      projects: "Projects",
      contactRequests: "Contact Requests",
      settings: "Settings",
      talentSearch: "Find Talent",
      sentRequests: "Sent Requests",
      verification: "Verification Queue",
      users: "User Management",
      auditLog: "Audit Log",
      overview: "Overview",
      logout: "Log out",
    },
    auth: {
      loginTitle: "Welcome back",
      loginSubtitle: "Sign in to your RCA Talent account",
      registerTitle: "Create your account",
      registerSubtitle: "Join the RCA Talent marketplace",
      email: "Email address",
      password: "Password",
      confirmPassword: "Confirm password",
      roleStudent: "Student",
      roleCompany: "Company",
      noAccount: "Don't have an account?",
      hasAccount: "Already have an account?",
    },
    landing: {
      heroTitle: "Connect RCA talent with opportunity",
      heroSubtitle:
        "Rwanda Coding Academy graduates showcase their skills. Verified profiles help companies discover and connect with the next generation of tech talent.",
      ctaStudent: "I'm a Student",
      ctaCompany: "I'm a Company",
      howItWorks: "How it works",
      step1Title: "Showcase your work",
      step1Desc: "Build your profile with projects, skills, and portfolio links.",
      step2Title: "Get verified",
      step2Desc: "RCA admins review and approve student profiles for quality.",
      step3Title: "Connect with employers",
      step3Desc: "Companies discover talent and send contact requests to connect.",
    },
    student: {
      dashboardTitle: "Student Dashboard",
      profileCompleteness: "Profile completeness",
      verificationStatus: "Verification status",
      pendingRequests: "Pending requests",
      onboardingTitle: "Complete your profile",
      resubmitProfile: "Resubmit for verification",
    },
    company: {
      dashboardTitle: "Company Dashboard",
      searchPlaceholder: "Search by name, skills, or keywords...",
      sendRequest: "Send Contact Request",
      requestSent: "Request sent",
    },
    admin: {
      dashboardTitle: "Admin Dashboard",
      approve: "Approve",
      reject: "Reject",
      rejectionReason: "Rejection reason (required)",
      totalStudents: "Total Students",
      totalCompanies: "Total Companies",
      totalRequests: "Contact Requests",
    },
  },
} as const;

export type Locale = keyof typeof strings;
export type StringKey = typeof strings.en;

let currentLocale: Locale = "en";

export function setLocale(locale: Locale) {
  currentLocale = locale;
}

export function t<K extends keyof StringKey>(
  section: K,
  key: keyof StringKey[K]
): string {
  return strings[currentLocale][section][key] as string;
}

export function tRaw(section: keyof StringKey): Record<string, string> {
  return strings[currentLocale][section] as Record<string, string>;
}
