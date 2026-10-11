import { AlertTriangle, CalendarDays, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  PRODUCTS,
  PRODUCT_PRICES,
  TIERS,
  formatIDR,
  type ProductId,
  type ProductSelections,
  type TierId,
} from "@/lib/catalog"
import { formatWeekRange, type WeekAvailability } from "@/lib/availability"
import { SectionHeading } from "./section-heading"

type ProductSelectionProps = {
  value: ProductSelections
  onToggle: (product: ProductId, tier: TierId) => void
  hasDate: boolean
  availability: WeekAvailability | undefined
  loading: boolean
  availabilityError: boolean
}

function ProductAvailabilityNotice({
  hasDate,
  availability,
  loading,
  availabilityError,
}: Omit<ProductSelectionProps, "value" | "onToggle">) {
  if (!hasDate) {
    return (
      <div className="flex items-start gap-3 border border-border bg-card px-5 py-4 text-sm text-muted-foreground">
        <CalendarDays aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-primary" />
        <p>Pilih Tanggal Acara terlebih dahulu untuk melihat ketersediaan varian produk di minggu tersebut.</p>
      </div>
    )
  }
  if (loading) {
    return (
      <div className="flex items-center gap-3 border border-border bg-card px-5 py-4 text-sm text-muted-foreground">
        <Loader2 aria-hidden="true" className="size-4 animate-spin text-primary" />
        <p>Memeriksa ketersediaan minggu ini...</p>
      </div>
    )
  }
  if (availabilityError || !availability) {
    return (
      <div role="alert" className="flex items-start gap-3 border border-destructive/40 bg-destructive/5 px-5 py-4 text-sm text-destructive">
        <AlertTriangle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
        <p>Ketersediaan tidak dapat dimuat. Silakan muat ulang halaman.</p>
      </div>
    )
  }

  const week = formatWeekRange(availability.weekStart, availability.weekEnd)
  const bookedNames = TIERS.filter((t) => availability.booked.includes(t.id)).map((t) => t.name)

  if (bookedNames.length === 0) {
    return (
      <div className="flex items-start gap-3 border border-border bg-card px-5 py-4 text-sm text-foreground/80">
        <CalendarDays aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-primary" />
        <p>
          Semua varian produk masih tersedia untuk minggu <span className="font-medium text-foreground">{week}</span>.
        </p>
      </div>
    )
  }

  const allBooked = bookedNames.length === TIERS.length
  return (
    <div role="alert" className="flex items-start gap-3 border border-destructive/40 bg-destructive/5 px-5 py-4 text-sm text-destructive">
      <AlertTriangle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
      <div className="flex flex-col gap-1">
        <p className="font-medium">
          {allBooked
            ? "Semua varian produk sudah penuh (Fully Booked) di minggu ini."
            : `Varian bertema ${bookedNames.join(" & ")} sudah penuh (Fully Booked) di minggu ini.`}
        </p>
        <p className="text-destructive/80">
          {`Minggu ${week}. Kuota pesanan (1 pesanan per minggu) untuk tema tersebut telah terpenuhi. `}
          {allBooked
            ? "Silakan pilih tanggal acara di minggu lain."
            : "Silakan pilih varian tema lain yang masih tersedia atau ubah tanggal acara."}
        </p>
      </div>
    </div>
  )
}

export function ProductSelection({
  value,
  onToggle,
  hasDate,
  availability,
  loading,
  availabilityError,
}: ProductSelectionProps) {
  const selectable = hasDate && !loading && !availabilityError && Boolean(availability)

  return (
    <section aria-labelledby="products-heading" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <SectionHeading index="03" eyebrow="Produk Satuan" title="Pilih detail yang Anda butuhkan" id="products-heading" />
      <p className="-mt-4 mb-6 text-sm text-muted-foreground">
        Pilih satu tingkatan untuk setiap produk. Ketuk kembali untuk membatalkan pilihan.
      </p>

      <div className="mb-8" aria-live="polite">
        <ProductAvailabilityNotice
          hasDate={hasDate}
          availability={availability}
          loading={loading}
          availabilityError={availabilityError}
        />
      </div>

      <ul className="flex flex-col divide-y divide-border border-y border-border">
        {PRODUCTS.map((product, i) => {
          const selectedTier = value[product.id]
          const groupId = `product-${product.id}`
          return (
            <li key={product.id} className="grid gap-6 py-8 lg:grid-cols-[1fr_2fr] lg:items-center">
              <div className="flex gap-5">
                <span aria-hidden="true" className="font-serif text-lg italic text-primary">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 id={groupId} className="font-serif text-2xl font-light md:text-3xl">
                    {product.name}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">{product.description}</p>
                </div>
              </div>
              <div role="radiogroup" aria-labelledby={groupId} className="grid grid-cols-3 gap-2 md:gap-3">
                {TIERS.map((tier) => {
                  const isBooked = availability?.booked.includes(tier.id) ?? false
                  const disabled = !selectable || isBooked
                  const selected = selectedTier === tier.id && !isBooked

                  return (
                    <button
                      key={tier.id}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      aria-disabled={disabled}
                      disabled={disabled}
                      onClick={() => onToggle(product.id, tier.id)}
                      className={cn(
                        "relative flex min-h-16 touch-manipulation flex-col items-start gap-1 border px-2 py-4 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring md:px-5",
                        selected
                          ? "border-primary bg-primary text-primary-foreground"
                          : isBooked
                            ? "border-destructive/30 bg-muted/40 cursor-not-allowed opacity-60"
                            : !selectable
                              ? "border-border bg-card cursor-not-allowed opacity-60"
                              : "border-border bg-card hover:border-primary/60",
                      )}
                    >
                      {isBooked ? (
                        <span className="absolute -top-2.5 right-2 bg-destructive px-1.5 py-0.5 text-[8px] uppercase tracking-wider text-primary-foreground">
                          Fully Booked
                        </span>
                      ) : null}
                      <span
                        className={cn(
                          "text-[10px] uppercase tracking-[0.2em] md:tracking-[0.25em]",
                          selected
                            ? "text-primary-foreground/80"
                            : isBooked
                              ? "text-destructive line-through"
                              : "text-muted-foreground",
                        )}
                      >
                        {tier.name}
                      </span>
                      <span
                        className={cn(
                          "font-serif text-base md:text-xl",
                          isBooked && "line-through decoration-1 text-muted-foreground",
                        )}
                      >
                        {formatIDR(PRODUCT_PRICES[product.id][tier.id])}
                      </span>
                      {isBooked ? (
                        <span className="text-[10px] font-medium text-destructive mt-0.5">
                          Penuh
                        </span>
                      ) : null}
                    </button>
                  )
                })}
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
