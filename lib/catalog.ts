export type TierId = "essential" | "signature" | "bespoke"
export type ProductId = "seserahan" | "mahar" | "buket" | "ringbox"
export type OrderMode = "paket_jesna" | "produk_satuan"

export const TIERS: { id: TierId; name: string; tagline: string }[] = [
  { id: "essential", name: "Essential", tagline: "Sederhana, bersih, dan bermakna" },
  { id: "signature", name: "Signature", tagline: "Detail khas Jesna yang paling dicintai" },
  { id: "bespoke", name: "Bespoke", tagline: "Dirancang sepenuhnya untuk kisah Anda" },
]

export const PACKAGE_PRICES: Record<TierId, number> = {
  essential: 700_000,
  signature: 950_000,
  bespoke: 1_500_000,
}

export const PACKAGE_DETAILS: Record<TierId, string[]> = {
  essential: [
    "Sewa dan jasa hias seserahan 5 box tema clean and modern", 
    "Sewa dan jasa hias mahar akrilik", 
    "Sewa dan jasa hias buket tangan essential type", 
    "Sewa dan jasa hias ringbox kayu bludru",
  ],
  signature: [
    "Sewa dan jasa hias seserahan 5 box tema classy",
    "Sewa dan jasa hias mahar bingkai kaca",
    "Sewa dan jasa hias buket tangan signature type",
    "Sewa dan jasa hias ringbox kayu natural",
  ],
  bespoke: [
    "Sewa dan jasa hias seserahan 5 box tema kustom",
    "Sewa dan jasa hias mahar desain eksklusif",
    "Sewa dan jasa hias buket tangan custom by request",
    "Sewa dan jasa hias ringbox custom by request",
  ],
}

export const PRODUCTS: { id: ProductId; name: string; description: string }[] = [
  { id: "seserahan", name: "Seserahan", description: "Sewa dan jasa hias hantaran yang tertata dalam kotak eksklusif" },
  { id: "mahar", name: "Mahar", description: "Sewa dan jasa hias bingkai mahar dengan komposisi yang rapi" },
  { id: "buket", name: "Buket", description: "Sewa dan jasa hias rangkaian bunga tangan untuk sang pengantin" },
  { id: "ringbox", name: "Ringbox", description: "Sewa dan jasa hias wadah cincin untuk momen paling sakral" },
]

export const PRODUCT_PRICES: Record<ProductId, Record<TierId, number>> = {
  seserahan: { essential: 350_000, signature: 400_000, bespoke: 600_000 },
  mahar: { essential: 150_000, signature: 250_000, bespoke: 400_000 },
  buket: { essential: 150_000, signature: 250_000, bespoke: 400_000 },
  ringbox: { essential: 125_000, signature: 200_000, bespoke: 350_000 },
}

export type ProductSelections = Partial<Record<ProductId, TierId>>

export type OrderLine = {
  category: "paket_jesna" | ProductId
  label: string
  tier: TierId
  tierName: string
  price: number
}

const tierName = (tier: TierId) => TIERS.find((t) => t.id === tier)?.name ?? tier

export function buildOrderLines(
  mode: OrderMode | null,
  packageTier: TierId | null,
  products: ProductSelections,
): OrderLine[] {
  if (mode === "paket_jesna" && packageTier) {
    return [
      {
        category: "paket_jesna",
        label: "Paket Jesna",
        tier: packageTier,
        tierName: tierName(packageTier),
        price: PACKAGE_PRICES[packageTier],
      },
    ]
  }
  if (mode === "produk_satuan") {
    return PRODUCTS.flatMap((product) => {
      const tier = products[product.id]
      if (!tier) return []
      return [
        {
          category: product.id,
          label: product.name,
          tier,
          tierName: tierName(tier),
          price: PRODUCT_PRICES[product.id][tier],
        },
      ]
    })
  }
  return []
}

const idrFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
})

export function formatIDR(value: number) {
  return idrFormatter.format(value).replace(/\u00a0/g, " ")
}

export function isTierId(value: unknown): value is TierId {
  return value === "essential" || value === "signature" || value === "bespoke"
}

export function isProductId(value: unknown): value is ProductId {
  return PRODUCTS.some((p) => p.id === value)
}
