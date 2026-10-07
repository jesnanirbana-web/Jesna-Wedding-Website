import { Loader2 } from "lucide-react"
import { formatIDR, type OrderLine } from "@/lib/catalog"

export function SummaryBar({
  lines,
  total,
  submitting,
  error,
}: {
  lines: OrderLine[]
  total: number
  submitting: boolean
  error: string | null
}) {
  const summary =
    lines.length === 0
      ? "Belum ada pilihan"
      : lines.map((l) => (l.category === "paket_jesna" ? `Paket ${l.tierName}` : `${l.label} · ${l.tierName}`)).join(", ")

  return (
    <div className="sticky bottom-0 z-20 -mx-6 mt-16 border-t border-primary/40 bg-foreground px-6 py-5 text-background md:-mx-12 md:px-12">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-[0.35em] text-background/70">Total Estimasi</p>
          <p className="font-serif text-3xl tabular-nums md:text-4xl" aria-live="polite">
            {formatIDR(total)}
          </p>
          <p className="mt-1 truncate text-xs text-background/60">{summary}</p>
          {error ? (
            <p role="alert" className="mt-1 text-xs text-destructive">
              {error}
            </p>
          ) : null}
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex shrink-0 items-center justify-center gap-3 border border-primary bg-primary px-8 py-4 text-xs font-medium uppercase tracking-[0.3em] text-primary-foreground transition-colors hover:bg-primary/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:opacity-70"
        >
          {submitting ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
          {submitting ? "Mengirim" : "Submit Order"}
        </button>
      </div>
    </div>
  )
}
