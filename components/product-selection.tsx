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
import { SectionHeading } from "./section-heading"

export function ProductSelection({
  value,
  onToggle,
}: {
  value: ProductSelections
  onToggle: (product: ProductId, tier: TierId) => void
}) {
  return (
    <section aria-labelledby="products-heading" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <SectionHeading index="03" eyebrow="Produk Satuan" title="Pilih detail yang Anda butuhkan" id="products-heading" />
      <p className="-mt-4 mb-8 text-sm text-muted-foreground">
        Pilih satu tingkatan untuk setiap produk. Ketuk kembali untuk membatalkan pilihan.
      </p>
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
                  const selected = selectedTier === tier.id
                  return (
                    <button
                      key={tier.id}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => onToggle(product.id, tier.id)}
                      className={cn(
                        "flex flex-col items-start gap-1 border px-3 py-4 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring md:px-5",
                        selected
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-card hover:border-primary/60",
                      )}
                    >
                      <span
                        className={cn(
                          "text-[10px] uppercase tracking-[0.2em] md:tracking-[0.25em]",
                          selected ? "text-primary-foreground/80" : "text-muted-foreground",
                        )}
                      >
                        {tier.name}
                      </span>
                      <span className="font-serif text-base md:text-xl">
                        {formatIDR(PRODUCT_PRICES[product.id][tier.id])}
                      </span>
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
