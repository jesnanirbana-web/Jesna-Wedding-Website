import { cn } from "@/lib/utils"
import type { OrderMode } from "@/lib/catalog"
import { SectionHeading } from "./section-heading"

const options: { id: OrderMode; numeral: string; title: string; description: string }[] = [
  {
    id: "paket_jesna",
    numeral: "I",
    title: "Paket Jesna",
    description:
      "Rangkaian detail pernikahan yang dirancang secara harmonis untuk menciptakan tampilan yang cohesive dan personal",
  },
  {
    id: "produk_satuan",
    numeral: "II",
    title: "Produk Satuan",
    description: "Hanya membutuhkan satu atau beberapa detail? Pilih produk yang Anda butuhkan secara terpisah",
  },
]

export function OrderModeChoice({
  value,
  onChange,
  error,
}: {
  value: OrderMode | null
  onChange: (mode: OrderMode) => void
  error?: string
}) {
  return (
    <section aria-labelledby="mode-heading">
      <SectionHeading
        index="02"
        eyebrow="Pilihan Pesanan"
        title="Bagaimana Anda ingin mewujudkan detail pernikahan Anda"
        id="mode-heading"
      />
      <div role="radiogroup" aria-labelledby="mode-heading" className="grid gap-4 md:grid-cols-2">
        {options.map((option) => {
          const selected = value === option.id
          return (
            <button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(option.id)}
              className={cn(
                "group relative flex touch-manipulation flex-col items-start gap-6 border p-8 text-left transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring md:p-10",
                selected
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card hover:border-primary/60",
              )}
            >
              <div className="flex w-full items-center justify-between">
                <span className={cn("font-serif text-2xl italic", selected ? "text-primary-foreground/90" : "text-primary")}>
                  {option.numeral}
                </span>
                <span
                  aria-hidden="true"
                  className={cn(
                    "flex size-5 items-center justify-center rounded-full border",
                    selected ? "border-primary-foreground" : "border-input",
                  )}
                >
                  {selected ? <span className="size-2.5 rounded-full bg-primary-foreground" /> : null}
                </span>
              </div>
              <div>
                <h3 className="font-serif text-3xl font-light md:text-4xl">{option.title}</h3>
                <p
                  className={cn(
                    "mt-3 max-w-sm leading-relaxed text-pretty",
                    selected ? "text-primary-foreground/80" : "text-muted-foreground",
                  )}
                >
                  {option.description}
                </p>
              </div>
            </button>
          )
        })}
      </div>
      {error ? <p className="mt-3 text-xs text-destructive">{error}</p> : null}
    </section>
  )
}
