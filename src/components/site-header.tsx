import { Link, useLocation } from "react-router-dom"
import { tools } from "@/data/tools"
import { cn } from "@/lib/utils"

export function SiteHeader() {
  const location = useLocation()

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur print:hidden">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
            T
          </span>
          <span className="text-sm font-semibold tracking-tight">
            Temi Tools <span className="font-normal text-muted-foreground">· Prototype</span>
          </span>
        </Link>

        <nav className="flex flex-wrap items-center gap-1 text-sm">
          <Link
            to="/"
            className={cn(
              "rounded-md px-3 py-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
              location.pathname === "/" && "bg-accent text-accent-foreground"
            )}
          >
            All tools
          </Link>
          {tools.map((tool) => (
            <Link
              key={tool.slug}
              to={`/${tool.slug}`}
              className={cn(
                "hidden rounded-md px-3 py-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground lg:inline-block",
                location.pathname === `/${tool.slug}` && "bg-accent text-accent-foreground"
              )}
            >
              {tool.shortName}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}
