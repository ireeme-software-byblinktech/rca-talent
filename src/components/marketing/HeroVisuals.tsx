export function LandingHeroVisual() {
  return (
    <div className="relative mx-auto aspect-square max-h-[420px] w-full max-w-md sm:max-w-lg">
      {/* Glow behind */}
      <div className="absolute inset-4 rounded-full bg-primary/10 blur-3xl" />

      {/* Student card */}
      <div className="animate-float-slow absolute left-0 top-[12%] z-10 w-[62%] overflow-hidden rounded-2xl border border-white/60 bg-white/90 shadow-elevated backdrop-blur-md">
        <div className="h-1.5 bg-gradient-to-r from-violet-500 to-primary" />
        <div className="p-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-sm font-bold text-white">
              A
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-foreground">Alice Uwimana</p>
              <p className="text-[10px] text-muted-foreground">Full-stack · RCA &apos;23</p>
            </div>
            <span className="ml-auto shrink-0 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[9px] font-semibold text-emerald-700">
              Verified
            </span>
          </div>
          <div className="mt-3 flex flex-wrap gap-1">
            {["React", "Node.js"].map((s) => (
              <span key={s} className="skill-pill text-[9px]">
                {s}
              </span>
            ))}
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-secondary">
            <div className="h-full w-[92%] rounded-full bg-gradient-to-r from-primary to-accent" />
          </div>
          <p className="mt-1.5 text-[10px] text-muted-foreground">Portfolio 92% complete</p>
        </div>
      </div>

      {/* Company card */}
      <div className="animate-float-delayed absolute right-0 top-0 z-20 w-[58%] overflow-hidden rounded-2xl border border-white/60 bg-white/90 shadow-elevated backdrop-blur-md">
        <div className="h-1.5 bg-gradient-to-r from-slate-700 to-primary" />
        <div className="p-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-primary">
            Hiring dashboard
          </p>
          <p className="mt-1 text-sm font-bold text-foreground">3 new matches</p>
          <div className="mt-3 space-y-1.5">
            {[
              { n: "Alice U.", m: "94%" },
              { n: "Bob N.", m: "87%" },
            ].map((c) => (
              <div
                key={c.n}
                className="flex items-center justify-between rounded-lg bg-secondary/60 px-2.5 py-1.5"
              >
                <span className="text-[11px] font-medium">{c.n}</span>
                <span className="text-[10px] font-bold text-primary">{c.m}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating badges */}
      <div className="animate-float absolute -left-2 bottom-[28%] z-30 rounded-xl border bg-card px-3 py-2 shadow-elevated">
        <p className="text-[10px] font-semibold text-primary">+12 profile views</p>
      </div>
      <div className="animate-float-delayed absolute -right-1 bottom-[18%] z-30 rounded-xl border bg-card px-3 py-2 shadow-elevated">
        <p className="text-[10px] font-medium text-emerald-600">Contact accepted</p>
      </div>

      {/* Bottom banner */}
      <div className="animate-float-slow absolute bottom-0 left-1/2 z-20 w-[88%] -translate-x-1/2 rounded-2xl bg-gradient-to-r from-primary to-accent px-4 py-3.5 text-center shadow-glow">
        <p className="text-sm font-semibold text-primary-foreground">
          Verified talent ↔ Top employers
        </p>
        <p className="mt-0.5 text-[10px] text-primary-foreground/75">
          Rwanda&apos;s developer marketplace
        </p>
      </div>
    </div>
  );
}

export function StudentHeroVisual() {
  return (
    <div className="relative mx-auto w-full max-w-md">
      <div className="animate-float-slow glass-panel p-5 shadow-glow">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-lg font-bold text-white">
            A
          </div>
          <div>
            <p className="font-semibold text-foreground">Alice Uwimana</p>
            <p className="text-xs text-muted-foreground">Full-stack · Class of 2023</p>
          </div>
          <span className="ml-auto skill-pill text-[10px]">Verified</span>
        </div>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {["React", "TypeScript", "Node.js"].map((s) => (
            <span key={s} className="skill-pill text-[10px]">
              {s}
            </span>
          ))}
        </div>
        <div className="mt-4 rounded-xl border bg-secondary/50 p-3">
          <p className="text-xs font-medium text-foreground">AgriConnect</p>
          <p className="mt-1 text-[11px] text-muted-foreground line-clamp-2">
            Platform connecting farmers with buyers across Rwanda.
          </p>
        </div>
      </div>
      <div className="animate-float-delayed absolute -right-4 -top-6 rounded-xl border bg-card px-3 py-2 shadow-elevated">
        <p className="text-[11px] font-medium text-primary">+3 profile views today</p>
      </div>
      <div className="animate-float absolute -bottom-4 -left-6 rounded-xl border bg-card px-3 py-2 shadow-elevated">
        <p className="text-[11px] text-muted-foreground">New contact request</p>
      </div>
    </div>
  );
}

export function CompanyHeroVisual() {
  return (
    <div className="relative mx-auto w-full max-w-md">
      <div className="animate-float-slow glass-panel p-5 shadow-glow">
        <p className="text-sm font-semibold text-foreground">Find talent</p>
        <div className="mt-3 flex h-10 items-center rounded-lg bg-secondary px-3 text-xs text-muted-foreground">
          React, internship, 2024…
        </div>
        <div className="mt-4 space-y-2">
          {[
            { name: "Alice Uwimana", match: "94%" },
            { name: "Bob Nshuti", match: "87%" },
          ].map((c) => (
            <div
              key={c.name}
              className="flex items-center justify-between rounded-lg border bg-card px-3 py-2.5 transition-colors hover:border-primary/30"
            >
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-primary/10 text-xs font-bold flex items-center justify-center text-primary">
                  {c.name[0]}
                </div>
                <span className="text-sm font-medium">{c.name}</span>
              </div>
              <span className="text-xs font-semibold text-primary">{c.match} match</span>
            </div>
          ))}
        </div>
      </div>
      <div className="animate-float-delayed absolute -right-2 top-8 rounded-xl border bg-card px-3 py-2 shadow-elevated">
        <p className="text-[11px] font-medium text-emerald-600">12 verified profiles</p>
      </div>
    </div>
  );
}
