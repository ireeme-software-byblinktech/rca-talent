import type { CompanyWithUser, StudentWithUser } from "@/types";

export interface VerificationCheckItem {
  label: string;
  met: boolean;
  hint?: string;
}

export function getStudentCompleteness(student: StudentWithUser): number {
  const checks = getStudentChecklist(student);
  const met = checks.filter((c) => c.met).length;
  return Math.round((met / checks.length) * 100);
}

export function getCompanyCompleteness(company: CompanyWithUser): number {
  const checks = getCompanyChecklist(company);
  const met = checks.filter((c) => c.met).length;
  return Math.round((met / checks.length) * 100);
}

export function getStudentChecklist(student: StudentWithUser): VerificationCheckItem[] {
  const hasLink =
    !!student.links.github || !!student.links.linkedin || !!student.links.portfolio;

  return [
    {
      label: "Full name provided",
      met: student.fullName.trim().length >= 2,
    },
    {
      label: "Bio (min. 40 characters)",
      met: student.bio.trim().length >= 40,
      hint: "A clear bio helps employers understand the candidate.",
    },
    {
      label: "At least 3 skills listed",
      met: student.skills.length >= 3,
    },
    {
      label: "Professional link (GitHub, LinkedIn, or portfolio)",
      met: hasLink,
    },
    {
      label: "Cohort year set",
      met: student.cohortYear > 0,
    },
    {
      label: "Availability selected",
      met: student.availability.length > 0,
    },
  ];
}

export function getCompanyChecklist(company: CompanyWithUser): VerificationCheckItem[] {
  const hasWebsite = !!company.website?.trim();
  const validWebsite = hasWebsite && /^https?:\/\/.+/.test(company.website!);

  return [
    {
      label: "Company name provided",
      met: company.companyName.trim().length >= 2,
    },
    {
      label: "Industry specified",
      met: company.industry.trim().length >= 2,
    },
    {
      label: "Description (min. 50 characters)",
      met: company.description.trim().length >= 50,
      hint: "Employers should describe their business and hiring needs.",
    },
    {
      label: "Valid website URL",
      met: validWebsite,
      hint: "Must start with http:// or https://",
    },
    {
      label: "Business email on file",
      met: company.user.email.includes("@"),
    },
  ];
}
