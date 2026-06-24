import { Linkedin } from "lucide-react"

export function Footer({ linkedinUrl }: { linkedinUrl: string }) {
  return (
    <footer className="border-t border-border/50 bg-background/50 py-4 text-center text-xs text-muted-foreground">
      <div className="flex items-center justify-center gap-3">
        <span>© 2024 Travelway. All rights reserved.</span>
        <a
          href={linkedinUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 transition-colors hover:text-foreground"
          aria-label="LinkedIn Profile"
        >
          <Linkedin className="size-3.5" />
          <span className="hidden sm:inline">Connect on LinkedIn</span>
        </a>
      </div>
    </footer>
  )
}
