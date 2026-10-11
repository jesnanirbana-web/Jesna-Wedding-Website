import { AlertTriangle, CalendarDays, Check, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { PACKAGE_DETAILS, PACKAGE_PRICES, TIERS, formatIDR, type TierId } from "@/lib/catalog"
import { formatWeekRange, type WeekAvailability } from "@/lib/availability"
import { SectionHeading } from "./section-heading"

type PackageTiersProps = {
  value: TierId | null
  onChange: (tier: TierId) => void
  hasDate: boolean
  availability: WeekAvailability | undefined
  loading: boolean
  availabilityError: boolean
}

function AvailabilityNotice({ hasDate, availability, loading, availabilityError }: Omit<PackageTiersProps, "value" | "onChange">) {
  if (!hasDate) {
    return (
      <div className="flex items-start gap-3 border border-border/80 bg-card/60 px-4 py-3 sm:px-5 sm:py-4 text-xs sm:text-sm text-muted-foreground">
        <CalendarDays aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-primary" />
        <p>
          Silakan pilih paket di bawah ini. Masukkan <strong>Tanggal Acara</strong> pada form di atas untuk memverifikasi ketersediaan kuota minggu acara Anda.
        </p>
      </div>
    )
  }
  if (loading) {
    return (
      <div className="flex items-center gap-3 border border-border bg-card px-4 py-3 sm:px-5 sm:py-4 text-xs sm:text-sm text-muted-foreground">
        <Loader2 aria-hidden="true" className="size-4 animate-spin text-primary" />
        <p>Memeriksa ketersediaan kuota minggu ini...</p>
      </div>
    )
  }
  if (availabilityError || !availability) {
    return (
      <div role="alert" className="flex items-start gap-3 border border-destructive/40 bg-destructive/5 px-4 py-3 sm:px-5 sm:py-4 text-xs sm:text-sm text-destructive">
        <AlertTriangle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
        <p>Ketersediaan tidak dapat dimuat. Silakan muat ulang halaman.</p>
      </div>
    )
  }

  const week = formatWeekRange(availability.weekStart, availability.weekEnd)
  const bookedNames = TIERS.filter((t) => availability.booked.includes(t.id)).map((t) => t.name)

  if (bookedNames.length === 0) {
    return (
      <div className="flex items-start gap-3 border border-primary/30 bg-primary/5 px-4 py-3 sm:px-5 sm:py-4 text-xs sm:text-sm text-foreground">
        <CalendarDays aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-primary" />
        <p>
          Semua paket masih tersedia untuk minggu <span className="font-medium text-foreground">{week}</span>.
        </p>
      </div>
    )
  }

  const allBooked = bookedNames.length === TIERS.length
  return (
    <div role="alert" className="flex items-start gap-3 border border-destructive/40 bg-destructive/5 px-4 py-3 sm:px-5 sm:py-4 text-xs sm:text-sm text-destructive">
      <AlertTriangle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
      <div className="flex flex-col gap-1">
        <p className="font-medium">
          {allBooked ? "Semua paket sudah penuh (Fully Booked) di minggu ini." : `Paket ${bookedNames.join(" & ")} sudah penuh (Fully Booked) di minggu ini.`}
        </p>
        <p className="text-destructive/80">
          {`Minggu ${week}. Setiap tier hanya menerima 1 pesanan per minggu (berlaku untuk Paket Jesna maupun Produk Satuan). `}
          {allBooked ? "Silakan pilih tanggal acara di minggu lain." : "Silakan pilih paket lain atau ubah tanggal acara."}
        </p>
      </div>
    </div>
  )
}

export function PackageTiers({ value, onChange, hasDate, availability, loading, availabilityError }: PackageTiersProps) {
  return (
    <section aria-labelledby="package-heading" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <SectionHeading index="03" eyebrow="Paket Jesna" title="Pilih tingkatan paket Anda" id="package-heading" />
      <div className="mb-6" aria-live="polite">
        <AvailabilityNotice hasDate={hasDate} availability={availability} loading={loading} availabilityError={availabilityError} />
      </div>
      <div role="radiogroup" aria-labelledby="package-heading" className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {TIERS.map((tier) => {
          const booked = Boolean(hasDate && availability?.booked?.includes(tier.id))
          const disabled = booked
          const selected = value === tier.id && !booked
          const featured = tier.id === "signature"
          return (
            <button
              key={tier.id}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-disabled={disabled}
              disabled={disabled}
              onClick={() => {
                if (!disabled) onChange(tier.id)
              }}
              className={cn(
                "group relative flex w-full cursor-pointer touch-manipulation flex-col border bg-card p-6 sm:p-8 text-left transition-all active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                selected ? "border-primary ring-2 ring-primary shadow-sm" : "border-border hover:border-primary/60",
                disabled && "cursor-not-allowed opacity-60",
                booked && "border-destructive/30 bg-muted/40",
              )}
            >
              {booked ? (
                <span className="absolute -top-3 left-6 sm:left-8 bg-destructive px-3 py-0.5 text-[10px] uppercase tracking-[0.3em] text-white">
                  Fully Booked
                </span>
              ) : featured ? (
                <span className="absolute -top-3 left-6 sm:left-8 bg-background border border-primary/30 px-3 py-0.5 text-[10px] uppercase tracking-[0.3em] text-primary font-medium">
                  Paling Dipilih
                </span>
              ) : null}
              <div className={cn("flex flex-col w-full", booked && "opacity-50")}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className={cn("font-serif text-2xl sm:text-3xl font-light", booked && "line-through decoration-1")}>{tier.name}</h3>
                    <p className="mt-1 text-xs sm:text-sm text-muted-foreground">{tier.tagline}</p>
                  </div>
                  <span
                    aria-hidden="true"
                    className={cn(
                      "flex size-6 shrink-0 items-center justify-center rounded-full border transition-colors",
                      selected ? "border-primary bg-primary text-primary-foreground" : "border-input group-hover:border-primary/50",
                    )}
                  >
                    {selected ? <Check className="size-3.5" /> : null}
                  </span>
                </div>
                <p className="my-6 sm:my-8 font-serif text-3xl sm:text-4xl text-primary">{formatIDR(PACKAGE_PRICES[tier.id])}</p>
                <ul className="flex flex-col gap-3 border-t border-border pt-6 text-xs sm:text-sm">
                  {PACKAGE_DETAILS[tier.id].map((detail) => (
                    <li key={detail} className="flex gap-3">
                      <span aria-hidden="true" className="mt-2 h-px w-3 shrink-0 bg-primary" />
                      <span className="text-foreground/85 leading-relaxed">{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
              {booked ? (
                <p className="mt-6 border-t border-destructive/20 pt-4 text-xs font-medium uppercase tracking-[0.2em] text-destructive">
                  Tidak tersedia minggu ini
                </p>
              ) : null}
            </button>
          )
        })}
      </div>
    </section>
  )
}
