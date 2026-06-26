import { Dashboard } from "@/components/dashboard"
import { Footer } from "@/components/footer"
import { MobileWalkthrough } from "@/components/mobile-walkthrough"

const LINKEDIN_URL = "https://www.linkedin.com/in/hassan-yaqoob"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <MobileWalkthrough />
      <main className="app-backdrop relative flex-1 overflow-hidden">
        <div
          aria-hidden
          className="app-grid pointer-events-none absolute inset-0 z-0"
        />
        <div className="relative z-10">
          <Dashboard />
        </div>
      </main>
      <Footer linkedinUrl={LINKEDIN_URL} />
    </div>
  )
}
