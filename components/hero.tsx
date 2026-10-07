import { ArrowDown } from "lucide-react"

export function Hero() {
  return (
    <header className="relative flex min-h-svh flex-col overflow-hidden px-6 py-8 md:px-12">
      <nav className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-muted-foreground">
        <span className="font-serif text-base normal-case tracking-normal text-foreground"></span>
        <span className="hidden sm:inline"></span>
        <a href="#order" className="transition-colors hover:text-foreground">
        </a>
      </nav>

      <div className="flex flex-1 flex-col items-center justify-center py-20 text-center">
        <p className="mb-8 flex items-center gap-4 text-[11px] uppercase tracking-[0.4em] text-primary">
          <span aria-hidden="true" className="h-px w-10 bg-primary" />
          Wedding Atelier
          <span aria-hidden="true" className="h-px w-10 bg-primary" />
        </p>

        <h1 className="font-serif text-6xl font-light leading-[0.95] text-balance text-foreground sm:text-7xl md:text-8xl lg:text-9xl">
          Jesna <em className="font-light italic text-primary">Wedding</em>
        </h1>

        <p className="mt-8 max-w-md font-serif text-xl italic leading-relaxed text-muted-foreground text-pretty md:text-2xl">
          Curated Quiet Luxury for Your Special Moments
        </p>

        <a
          href="#order"
          className="group mt-14 inline-flex items-center gap-3 border border-primary bg-primary px-8 py-4 text-xs uppercase tracking-[0.3em] text-primary-foreground transition-colors hover:bg-transparent hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
        >
          Mulai Pesanan
          <ArrowDown className="size-4 transition-transform group-hover:translate-y-0.5" aria-hidden="true" />
        </a>
      </div>

      <div className="flex justify-between items-center border-t border-border pt-6 text-[11px] uppercase tracking-[0.25em] text-muted-foreground px-4 md:px-12">
      <span>Seserahan</span>
      <span>Mahar</span>
      <span>Buket</span>
      <span>Ringbox</span>
      </div>
    </header>
  )
}
