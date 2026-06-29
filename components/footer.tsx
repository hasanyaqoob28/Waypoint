import { ExternalLink } from "lucide-react"

export function Footer({ linkedinUrl }: { linkedinUrl: string }) {
  return (
    <footer className="border-t border-border/50 bg-background/50 py-4 text-center text-xs text-muted-foreground">
      <div className="space-y-2">
        <div className="flex items-center justify-center gap-2">
          <span className="cursor-default select-none">© 2026 Travelway. All rights reserved.</span>
          <a
            href={linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 transition-colors hover:text-foreground"
            aria-label="LinkedIn Profile of Hassan Yaqoob"
          >
            <ExternalLink className="size-3.5" />
            <span className="hidden cursor-pointer select-text sm:inline">Connect with Hassan Yaqoob</span>
          </a>
        </div>
        <p className="cursor-default select-none text-[10px] text-muted-foreground/70">
          Built with AI and passion. Reach out on LinkedIn to collaborate or learn more.
        </p>
      </div>
    </footer>
  )
}
