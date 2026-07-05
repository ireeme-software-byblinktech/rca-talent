import { cn } from "@/lib/utils";

export function HeroBackground({ className }: { className?: string }) {
  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      <div className="landing-grid absolute inset-0 opacity-40" />
      <div className="marketing-hero-glow absolute inset-0" />
      <div className="animate-pulse-soft absolute -left-20 top-20 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
      <div className="animate-pulse-soft absolute -right-16 top-40 h-64 w-64 rounded-full bg-accent/15 blur-3xl [animation-delay:1.5s]" />
      <div className="animate-pulse-soft absolute bottom-0 left-1/3 h-48 w-48 rounded-full bg-primary/8 blur-2xl [animation-delay:3s]" />
    </div>
  );
}

interface PageHeroProps {
  badge?: React.ReactNode;
  title: React.ReactNode;
  description: string;
  actions?: React.ReactNode;
  visual?: React.ReactNode;
  centered?: boolean;
}

export function PageHero({
  badge,
  title,
  description,
  actions,
  visual,
  centered = false,
}: PageHeroProps) {
  return (
    <section className="relative overflow-hidden border-b">
      <HeroBackground />
      <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:py-28">
        <div
          className={cn(
            "grid items-center gap-12 lg:gap-16",
            visual ? "lg:grid-cols-2" : "",
            centered && !visual && "mx-auto max-w-3xl text-center"
          )}
        >
          <div className={cn(centered && !visual && "flex flex-col items-center")}>
            {badge && (
              <div className="animate-fade-up opacity-0 mb-6 inline-flex">{badge}</div>
            )}
            <h1 className="animate-fade-up stagger-1 opacity-0 text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-[3.25rem] leading-[1.1] text-balance">
              {title}
            </h1>
            <p className="animate-fade-up stagger-2 opacity-0 mt-5 text-lg text-muted-foreground leading-relaxed text-balance">
              {description}
            </p>
            {actions && (
              <div className="animate-fade-up stagger-3 opacity-0 mt-8 flex flex-wrap gap-3">
                {actions}
              </div>
            )}
          </div>
          {visual && (
            <div className="animate-fade-up stagger-2 opacity-0 relative hidden lg:block">
              {visual}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

interface FeatureItem {
  icon: React.ReactNode;
  title: string;
  description: string;
  stat?: string;
}

export function FeatureGrid({
  title,
  subtitle,
  items,
  columns = 2,
}: {
  title: string;
  subtitle?: string;
  items: FeatureItem[];
  columns?: 2 | 3 | 4;
}) {
  // If 3 columns, use the roadmap design
  if (columns === 3 && items.length === 3) {
    return (
      <section className="py-20 sm:py-24 bg-gray-50 overflow-hidden font-sans">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="relative bg-white rounded-xl p-8 sm:p-12 lg:p-16 shadow-2xl shadow-gray-200/80 border border-gray-100 overflow-hidden">
            
            {/* Header */}
            <div className="relative z-20 max-w-xl mb-12">
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 leading-[1.1]">
                {title.split(' ')[0]}{" "}
                <span className="text-[#1A2B4B]">{title.split(' ').slice(1).join(' ')}</span>
              </h2>
            </div>

            {/* Roadmap Path with Data Points */}
            <div className="relative h-[380px] lg:h-[320px]">
              {/* Winding Road SVG Path */}
              <svg 
                className="absolute inset-0 w-full h-full pointer-events-none" 
                viewBox="0 0 1100 320" 
                preserveAspectRatio="none"
              >
                {/* Main winding path - S-curve like in reference */}
                <path
                  d="M 100 280 C 120 250, 160 240, 200 235 S 280 240, 350 210 S 450 160, 550 150 S 700 160, 800 140 S 900 110, 1000 100"
                  fill="none"
                  stroke="#2A2A2A"
                  strokeWidth="55"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity="0.95"
                />
                
                {/* Dashed center line */}
                <path
                  d="M 100 280 C 120 250, 160 240, 200 235 S 280 240, 350 210 S 450 160, 550 150 S 700 160, 800 140 S 900 110, 1000 100"
                  fill="none"
                  stroke="white"
                  strokeWidth="3"
                  strokeDasharray="12 12"
                  strokeLinecap="round"
                  opacity="0.5"
                />
              </svg>

              {/* Data Points positioned along the path */}
              <div className="relative h-full">
                
                {/* Data Point 01 - Bottom Left - ABOVE ROAD */}
                <div className="absolute left-[5%] bottom-[32%] md:left-[8%] md:bottom-[35%] flex flex-col items-center text-center z-10">
                  <div className="relative mb-4">
                    {/* Glow effect */}
                    <div className="absolute inset-0 bg-[#1A2B4B]/20 blur-2xl rounded-full scale-150" />
                    
                    {/* Hexagon container with rounded corners */}
                    <div className="relative">
                      <svg width="90" height="100" viewBox="0 0 90 100" className="drop-shadow-2xl">
                        <defs>
                          <linearGradient id="hex-gradient-1" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#1A2B4B" />
                            <stop offset="100%" stopColor="#2A4070" />
                          </linearGradient>
                        </defs>
                        <path d="M45 8 L77 28 Q80 30, 80 33.5 L80 69 Q80 72, 77 74 L45 93 Q45 95, 42 93 L10 74 Q7 72, 7 69 L7 33.5 Q7 30, 10 28 L42 8 Q45 6, 45 8 Z" fill="url(#hex-gradient-1)" stroke="white" strokeWidth="3" strokeLinejoin="round" />
                      </svg>
                      
                      {/* Icon */}
                      <div className="absolute inset-0 flex items-center justify-center text-white">
                        {items[0].icon}
                      </div>
                    </div>
                  </div>
                  
                  <div className="max-w-[200px]">
                    <div className="text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Step 01</div>
                    <div className="text-[#1A2B4B] text-lg font-black mb-1.5">{items[0].title}</div>
                    <p className="text-xs text-gray-600 leading-relaxed font-medium">
                      {items[0].description}
                    </p>
                  </div>
                </div>

                {/* Data Point 02 - Middle - BELOW ROAD */}
                <div className="absolute left-[40%] bottom-[8%] md:left-[45%] md:bottom-[10%] flex flex-col items-center text-center z-10">
                  <div className="relative mb-4">
                    {/* Glow effect */}
                    <div className="absolute inset-0 bg-[#3B5998]/20 blur-2xl rounded-full scale-150" />
                    
                    {/* Hexagon container with rounded corners */}
                    <div className="relative">
                      <svg width="90" height="100" viewBox="0 0 90 100" className="drop-shadow-2xl">
                        <defs>
                          <linearGradient id="hex-gradient-2" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#3B5998" />
                            <stop offset="100%" stopColor="#2A4070" />
                          </linearGradient>
                        </defs>
                        <path d="M45 8 L77 28 Q80 30, 80 33.5 L80 69 Q80 72, 77 74 L45 93 Q45 95, 42 93 L10 74 Q7 72, 7 69 L7 33.5 Q7 30, 10 28 L42 8 Q45 6, 45 8 Z" fill="url(#hex-gradient-2)" stroke="white" strokeWidth="3" strokeLinejoin="round" />
                      </svg>
                      
                      {/* Icon */}
                      <div className="absolute inset-0 flex items-center justify-center text-white">
                        {items[1].icon}
                      </div>
                    </div>
                  </div>
                  
                  <div className="max-w-[200px]">
                    <div className="text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Step 02</div>
                    <div className="text-[#1A2B4B] text-lg font-black mb-1.5">{items[1].title}</div>
                    <p className="text-xs text-gray-600 leading-relaxed font-medium">
                      {items[1].description}
                    </p>
                  </div>
                </div>

                {/* Data Point 03 - Top Right - ABOVE ROAD */}
                <div className="absolute right-[5%] top-[25%] md:right-[8%] md:top-[20%] flex flex-col items-center text-center z-10">
                  <div className="relative mb-4">
                    {/* Glow effect */}
                    <div className="absolute inset-0 bg-[#2A4070]/20 blur-2xl rounded-full scale-150" />
                    
                    {/* Hexagon container with rounded corners */}
                    <div className="relative">
                      <svg width="90" height="100" viewBox="0 0 90 100" className="drop-shadow-2xl">
                        <defs>
                          <linearGradient id="hex-gradient-3" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#2A4070" />
                            <stop offset="100%" stopColor="#1A2B4B" />
                          </linearGradient>
                        </defs>
                        <path d="M45 8 L77 28 Q80 30, 80 33.5 L80 69 Q80 72, 77 74 L45 93 Q45 95, 42 93 L10 74 Q7 72, 7 69 L7 33.5 Q7 30, 10 28 L42 8 Q45 6, 45 8 Z" fill="url(#hex-gradient-3)" stroke="white" strokeWidth="3" strokeLinejoin="round" />
                      </svg>
                      
                      {/* Icon */}
                      <div className="absolute inset-0 flex items-center justify-center text-white">
                        {items[2].icon}
                      </div>
                    </div>
                  </div>
                  
                  <div className="max-w-[200px]">
                    <div className="text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Step 03</div>
                    <div className="text-[#1A2B4B] text-lg font-black mb-1.5">{items[2].title}</div>
                    <p className="text-xs text-gray-600 leading-relaxed font-medium">
                      {items[2].description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Large background numbers */}
              <div className="absolute top-4 right-4 text-[140px] sm:text-[180px] lg:text-[220px] font-black text-gray-100 leading-none pointer-events-none select-none opacity-40">
                01-03
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Default grid layout for other column counts
  const colClass =
    columns === 4
      ? "sm:grid-cols-2 lg:grid-cols-4"
      : columns === 3
        ? "sm:grid-cols-2 lg:grid-cols-3"
        : "sm:grid-cols-2";

  return (
    <section className="py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">{title}</h2>
          {subtitle && (
            <p className="mt-3 text-muted-foreground">{subtitle}</p>
          )}
        </div>
        <div className={cn("mt-12 grid gap-5", colClass)}>
          {items.map((item) => (
            <article
              key={item.title}
              className="group fancy-card p-6 sm:p-7"
            >
              <div className="feature-icon-wrap">{item.icon}</div>
              <h3 className="mt-5 text-lg font-semibold text-foreground">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {item.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function StatsStrip({ stats }: { stats: { value: string; label: string }[] }) {
  const doubled = [...stats, ...stats, ...stats];
  
  return (
    <section className="relative w-full flex justify-center py-5 overflow-visible z-50 bg-white">
      {/* THE BANNER WITH 3D ARCHITECTURE */}
      <div className="relative flex items-stretch w-[calc(100%-6px)] h-14 overflow-visible mx-[3px]">
        
        {/* LEFT 3D FOLD */}
        <div className="absolute left-0 top-full w-12 h-12 z-10 pointer-events-none">
          <svg className="w-full h-full" viewBox="0 0 48 48">
            <path d="M0 0 L48 0 L48 32 Z" fill="#1A2B4B" />
            <path d="M0 0 L48 0" stroke="white" strokeWidth="1.5" strokeOpacity="0.15" />
          </svg>
        </div>

        {/* MARQUEE STREAM - FULL WIDTH */}
        <div className="flex-grow overflow-hidden relative flex items-center bg-gradient-to-r from-[#0F1A2E] via-[#1A2B4B] to-[#0F1A2E] h-full border-y-2 border-white/10 z-0">
          {/* Neural Data Pulses */}
          <div 
            className="absolute top-0 w-40 h-[2px] bg-gradient-to-r from-transparent via-white/40 to-transparent z-30"
            style={{
              animation: 'slideRightFast 2s linear infinite'
            }}
          />
          <div 
            className="absolute bottom-0 w-60 h-[2px] bg-gradient-to-r from-transparent via-white/20 to-transparent z-30"
            style={{
              animation: 'slideLeftFast 2.5s linear infinite'
            }}
          />
          
          <div className="flex animate-marquee whitespace-nowrap items-center h-full font-sans">
            {doubled.map((stat, i) => (
              <div key={i} className="flex items-center px-12 group/item">
                <div className="w-2 h-2 bg-blue-400 rounded-full mr-6 shadow-[0_0_12px_#3B5998]" />
                <span className="text-[15px] font-bold tracking-[0.25em] text-white/95 group-hover/item:text-white transition-all duration-300 uppercase drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)]">
                  {stat.value} <span className="text-white/70 font-semibold">{stat.label}</span>
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT 3D FOLD */}
        <div className="absolute right-0 top-full w-12 h-12 z-10 pointer-events-none scale-x-[-1]">
          <svg className="w-full h-full" viewBox="0 0 48 48">
            <path d="M0 0 L48 0 L48 32 Z" fill="#1A2B4B" />
            <path d="M0 0 L48 0" stroke="white" strokeWidth="1.5" strokeOpacity="0.15" />
          </svg>
        </div>

      </div>
    </section>
  );
}

export function MarketingCTA({
  title,
  description,
  button,
}: {
  title: string;
  description: string;
  button: React.ReactNode;
}) {
  return (
    <section className="relative overflow-hidden py-20 sm:py-24 bg-white">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="relative bg-gradient-to-br from-[#1A2B4B] via-[#2A4070] to-[#3B5998] rounded-2xl shadow-2xl overflow-visible p-8 sm:p-12 lg:p-16">
          
          {/* Decorative circles at corners */}
          {/* Top left semi-circle */}
          <div className="absolute top-0 left-0 w-24 h-12 overflow-hidden">
            <div className="w-24 h-24 rounded-full bg-[#0A1525]" />
          </div>

          {/* Top right triangle */}
          <div className="absolute top-0 right-0 w-0 h-0 border-t-[80px] border-t-[#0A1525] border-l-[80px] border-l-transparent" />

          {/* Bottom left small circle */}
          <div className="absolute bottom-12 left-8 w-12 h-12 rounded-full bg-[#0A1525] opacity-60" />

          {/* Bottom right semi-circle */}
          <div className="absolute bottom-0 right-0 w-16 h-8 overflow-hidden">
            <div className="w-16 h-16 rounded-full bg-[#0A1525] translate-y-1/2" />
          </div>

          <div className="relative grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Diamond Image with Imigongo Pattern */}
            <div className="relative flex items-center justify-center lg:justify-start">
              <div className="relative w-72 h-72">
                {/* Diamond shape container */}
                <div className="absolute inset-0 transform rotate-45 rounded-[3rem] overflow-hidden bg-white shadow-2xl">
                  {/* Imigongo Pattern */}
                  <div 
                    className="absolute inset-0 opacity-15"
                    style={{
                      backgroundImage: `url('/imigongo-pattern.svg')`,
                      backgroundSize: '250px 250px',
                      backgroundPosition: 'center'
                    }}
                  />
                  
                  {/* Icon in center */}
                  <div className="absolute inset-0 flex items-center justify-center transform -rotate-45">
                    <svg 
                      className="w-24 h-24 text-[#1A2B4B]" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={1.5} 
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" 
                      />
                    </svg>
                  </div>
                </div>

                {/* Border frame around diamond */}
                <div className="absolute inset-[-8px] transform rotate-45 rounded-[3rem] border-4 border-white/20" />
              </div>
            </div>

            {/* Right: Content */}
            <div className="relative text-center lg:text-left">
              <div className="inline-block px-4 py-1.5 bg-white/20 backdrop-blur-sm text-white text-xs font-bold uppercase tracking-wider rounded-full mb-4 border border-white/30">
                Platform
              </div>
              
              <h2 className="text-3xl font-black text-white sm:text-4xl lg:text-5xl leading-tight mb-4">
                {title}
              </h2>
              
              <p className="text-white/90 leading-relaxed text-base mb-8 max-w-lg mx-auto lg:mx-0">
                {description}
              </p>
              
              <div className="flex justify-center lg:justify-start">
                {button}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function SkillMarquee({ skills }: { skills: string[] }) {
  const doubled = [...skills, ...skills];
  return (
    <section className="border-y bg-muted/40 py-4 overflow-hidden">
      <div className="flex animate-marquee whitespace-nowrap">
        {doubled.map((skill, i) => (
          <span key={`${skill}-${i}`} className="mx-3 skill-pill shrink-0">
            {skill}
          </span>
        ))}
      </div>
    </section>
  );
}
