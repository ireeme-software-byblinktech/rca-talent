import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function LandingHero({
  stats,
  loading = false,
}: {
  stats?: { graduates: string; companies: string; verifiedRate: string };
  loading?: boolean;
}) {
  const displayStats = stats
    ? [
        { value: stats.graduates, label: "RCA Graduates" },
        { value: stats.companies, label: "Partner Companies" },
        { value: stats.verifiedRate, label: "Verified Profiles" },
      ]
    : [
        { value: "0", label: "RCA Graduates" },
        { value: "0", label: "Partner Companies" },
        { value: "0%", label: "Verified Profiles" },
      ];
  return (
    <section className="relative overflow-hidden min-h-[550px] flex items-center">
      {/* Imigongo Geometric Pattern Background */}
      <div 
        className="absolute inset-0 bg-repeat"
        style={{
          backgroundImage: `url('/imigongo-pattern.svg')`,
          backgroundSize: '400px 400px'
        }}
      />
      
      {/* Gradient Overlay - lighter to show pattern more */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/92 via-white/88 to-white/85" />

      <div className="relative mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16 lg:py-20 text-center">
        {/* Main Heading */}
        <h1 className="animate-fade-up opacity-0 mx-auto max-w-4xl text-5xl font-bold tracking-tight text-[#1A2B4B] sm:text-6xl lg:text-[4.5rem] leading-[1.1]">
          Empowering Rwanda&apos;s Tech{" "}
          <span className="block mt-2 bg-gradient-to-r from-[#1A2B4B] via-[#3B5998] to-[#2A4070] bg-clip-text text-transparent">
            Future Together
          </span>
        </h1>

        {/* Subtitle */}
        <p className="animate-fade-up stagger-1 opacity-0 mx-auto mt-6 max-w-2xl text-lg sm:text-xl text-gray-700 leading-relaxed font-normal">
          Discover verified RCA talent or showcase your skills. A trusted platform connecting exceptional developers with forward-thinking companies.
        </p>

        {/* CTA Buttons */}
        <div className="animate-fade-up stagger-2 opacity-0 mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Button 
            size="lg" 
            className="h-14 rounded-full px-10 bg-[#1A2B4B] hover:bg-[#2A4070] text-white shadow-lg hover:shadow-xl transition-all duration-300 text-base font-semibold min-w-[200px]" 
            asChild
          >
            <Link href="/register?role=student">
              I&apos;m a Student
            </Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="h-14 rounded-full px-10 border-2 border-[#1A2B4B] text-[#1A2B4B] hover:bg-[#1A2B4B] hover:text-white transition-all duration-300 text-base font-semibold min-w-[200px]"
            asChild
          >
            <Link href="/register?role=company">
              I&apos;m a Company
            </Link>
          </Button>
        </div>

        {/* Stats */}
        <div className="animate-fade-up stagger-3 opacity-0 mt-14 flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
          {displayStats.map((s) => (
            <div key={s.label} className="text-center">
              <p
                className={`text-3xl font-bold text-[#1A2B4B] ${loading ? "opacity-60" : ""}`}
              >
                {s.value}
              </p>
              <p className="text-sm text-gray-600 mt-1 font-medium">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

interface AudienceCardProps {
  href: string;
  variant: "student" | "company";
  title: string;
  description: string;
  features: { icon: React.ReactNode; text: string }[];
  cta: string;
  stat?: string;
}

function AudienceCard({
  href,
  variant,
  title,
  description,
  features,
  cta,
  stat,
}: AudienceCardProps) {
  const isStudent = variant === "student";

  return (
    <div className="bg-white rounded-2xl shadow-2xl border border-white flex flex-col items-start relative overflow-hidden group hover:-translate-y-2 transition-all duration-500 min-h-[640px]"
      style={{
        boxShadow: isStudent 
          ? '0 25px 50px -12px rgba(0, 0, 0, 0.15)' 
          : '0 25px 50px -12px rgba(26, 43, 75, 0.25)'
      }}
    >
      {/* Header with Wave */}
      <div className={cn(
        "w-full p-12 pb-20 relative",
        isStudent ? "bg-gray-200" : "bg-gradient-to-br from-[#1A2B4B] to-[#2A4070]"
      )}>
        {/* Wavy Bottom Edge */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0]">
          <svg 
            viewBox="0 0 1440 120" 
            preserveAspectRatio="none" 
            className="relative block w-full h-[60px] fill-white"
          >
            <path d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z" />
          </svg>
        </div>

        <div className="relative z-10">
          {/* Badge */}
          <div className={cn(
            "px-5 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-6 inline-block",
            isStudent 
              ? "bg-white text-gray-500 border border-gray-100" 
              : "bg-white/20 text-white"
          )}>
            {isStudent ? "For Students" : "For Companies"}
          </div>

          {/* Title */}
          <h3 className={cn(
            "text-3xl font-bold mb-2",
            isStudent ? "text-gray-900" : "text-white"
          )}>
            {title}
          </h3>
          
          {/* Stat/Pricing */}
          {stat && (
            <div className="flex items-baseline gap-1">
              <span className={cn(
                "text-3xl font-black",
                isStudent ? "text-gray-900" : "text-white"
              )}>
                {stat}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Body Content */}
      <div className="p-12 pt-8 w-full flex-1 flex flex-col justify-between">
        <div>
          <p className="text-gray-500 text-sm mb-12 leading-relaxed">
            {description}
          </p>

          <div className="space-y-6 mb-12 w-full">
            {features.map((f, i) => (
              <div key={i} className="flex items-center gap-3">
                <CheckCircle2 
                  size={24} 
                  className={cn(
                    "shrink-0",
                    isStudent ? "text-gray-700" : "text-[#1A2B4B]"
                  )}
                  fill={isStudent ? "#374151" : "#1A2B4B"}
                  stroke="white" 
                  strokeWidth={1.5} 
                />
                <span className="text-gray-600 font-bold text-sm">{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Button */}
        <Link
          href={href}
          className={cn(
            "w-full py-5 rounded-xl font-black text-sm uppercase tracking-widest transition-all duration-500 shadow-xl flex items-center justify-center",
            isStudent
              ? "border-2 border-gray-700 text-gray-700 bg-transparent hover:bg-gray-700 hover:text-white"
              : "bg-gradient-to-r from-[#1A2B4B] to-[#2A4070] text-white hover:brightness-110 shadow-[#1A2B4B]/20"
          )}
        >
          {cta}
        </Link>
      </div>
    </div>
  );
}

export function AudienceCardsSection() {
  return (
    <section className="relative py-20 sm:py-28">
      <div className="absolute inset-0 bg-gradient-to-b from-muted/40 via-background to-muted/20" />
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">
            Choose your path
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl text-balance">
            Built for students and employers alike
          </h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            Whether you&apos;re launching your career or building your team, RCA Talent
            has the tools you need.
          </p>
        </div>

        <div className="mt-14 grid gap-10 lg:grid-cols-2 max-w-4xl mx-auto items-stretch">
          <AudienceCard
            href="/for-students"
            variant="student"
            title="For Students"
            stat="Free forever"
            description="Build your brand, publish a portfolio, and get discovered by employers actively hiring RCA graduates."
            features={[
              { icon: null, text: "Professional portfolio builder with custom URL" },
              { icon: null, text: "Admin-verified badge for credibility" },
              { icon: null, text: "Direct messaging with recruiters" },
              { icon: null, text: "Career analytics & project showcase" },
            ]}
            cta="Explore for students"
          />
          <AudienceCard
            href="/for-companies"
            variant="company"
            title="For Companies"
            stat="Verified talent"
            description="Search verified profiles, review real project work, and manage your entire hiring pipeline in one dashboard."
            features={[
              { icon: null, text: "Advanced skill, cohort & availability filters" },
              { icon: null, text: "Job postings & interview invitations" },
              { icon: null, text: "Bookmark and track promising candidates" },
              { icon: null, text: "Portfolio-first hiring — see work before you reach out" },
            ]}
            cta="Explore for companies"
          />
        </div>
      </div>
    </section>
  );
}
