import { Dashboard } from "@/components/dashboard"

export default function Home() {
  return (
    <main className="app-backdrop relative min-h-screen overflow-hidden">
      <div
        aria-hidden
        className="app-grid pointer-events-none absolute inset-0 z-0"
      />
      <div className="relative z-10">
        <Dashboard />
      </div>
    </main>
  )
}
