import { PublicFooter, PublicHeader } from "@/components/shared/PublicLayout";
import { HomePageContent } from "@/components/marketing/HomePageContent";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader />

      <main className="flex-1">
        <HomePageContent />
      </main>

      <PublicFooter />
    </div>
  );
}
