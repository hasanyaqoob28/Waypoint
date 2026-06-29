import { Dashboard } from "@/components/dashboard"
import { Footer } from "@/components/footer"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { DEMO_USER_ID } from "@/lib/constants"

const LINKEDIN_URL = "https://www.linkedin.com/in/hassan-yaqoob"

export default async function Home() {
  const session = await auth.api.getSession({ headers: await headers() })
  
  // Use actual user ID if logged in, otherwise use demo user
  const userId = session?.user?.id || DEMO_USER_ID

  return (
    <div className="flex min-h-screen flex-col">
      <main className="app-backdrop relative flex-1 overflow-hidden">
        <div
          aria-hidden
          className="app-grid pointer-events-none absolute inset-0 z-0"
        />
        <div className="relative z-10">
          <Dashboard userId={userId} />
        </div>
      </main>
      <Footer linkedinUrl={LINKEDIN_URL} />
    </div>
  )
}
