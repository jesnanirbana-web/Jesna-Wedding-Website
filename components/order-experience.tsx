"use client"

import { useMemo, useState, type FormEvent } from "react"
import useSWR from "swr"
import { isIsoDate, type WeekAvailability } from "@/lib/availability"
import { buildOrderLines, type OrderMode, type ProductId, type ProductSelections, type TierId } from "@/lib/catalog"
import { ClientInfo, type ClientData, type ClientErrors } from "./client-info"
import { Hero } from "./hero"
import { OrderModeChoice } from "./order-mode-choice"
import { PackageTiers } from "./package-tiers"
import { ProductSelection } from "./product-selection"
import { SummaryBar } from "./summary-bar"
import { SuccessScreen, type OrderConfirmation } from "./success-screen"

const emptyClient: ClientData = { fullName: "", whatsapp: "", weddingDate: "" }

function validateClient(data: ClientData): ClientErrors {
  const errors: ClientErrors = {}
  if (data.fullName.trim().length < 2) errors.fullName = "Mohon isi nama lengkap Anda."
  if (!/^\+?\d{9,15}$/.test(data.whatsapp.replace(/[\s-]/g, ""))) errors.whatsapp = "Nomor WhatsApp tidak valid."
  if (!data.weddingDate) errors.weddingDate = "Mohon pilih tanggal acara."
  return errors
}

const fetchAvailability = async (url: string): Promise<WeekAvailability> => {
  const res = await fetch(url)
  if (!res.ok) throw new Error("Gagal memuat ketersediaan.")
  return res.json()
}

export function OrderExperience() {
  const [client, setClient] = useState<ClientData>(emptyClient)
  const [clientErrors, setClientErrors] = useState<ClientErrors>({})
  const [mode, setMode] = useState<OrderMode | null>(null)
  const [packageTier, setPackageTier] = useState<TierId | null>(null)
  const [products, setProducts] = useState<ProductSelections>({})
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [confirmation, setConfirmation] = useState<OrderConfirmation | null>(null)

  const hasDate = isIsoDate(client.weddingDate)
  const {
    data: availability,
    error: availabilityError,
    isLoading: availabilityLoading,
    mutate: refreshAvailability,
  } = useSWR(hasDate ? `/api/availability?date=${client.weddingDate}` : null, fetchAvailability, {
    keepPreviousData: false,
  })

  // A tier that is fully booked for the chosen week can never stay selected.
  const activeTier = packageTier && hasDate && availability && !availability.booked.includes(packageTier) ? packageTier : null

  const lines = useMemo(() => buildOrderLines(mode, activeTier, products), [mode, activeTier, products])
  const total = lines.reduce((sum, line) => sum + line.price, 0)

  const updateClient = (key: keyof ClientData, value: string) => {
    setClient((prev) => ({ ...prev, [key]: value }))
    if (clientErrors[key]) setClientErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  const toggleProduct = (product: ProductId, tier: TierId) => {
    setFormError(null)
    setProducts((prev) => {
      const next = { ...prev }
      if (next[product] === tier) delete next[product]
      else next[product] = tier
      return next
    })
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const errors = validateClient(client)
    setClientErrors(errors)
    if (Object.keys(errors).length > 0) {
      setFormError("Mohon lengkapi informasi klien.")
      document.getElementById("client-heading")?.scrollIntoView({ behavior: "smooth", block: "start" })
      return
    }
    if (!mode) {
      setFormError("Pilih cara Anda ingin memesan.")
      return
    }
    if (mode === "paket_jesna" && availability && packageTier && availability.booked.includes(packageTier)) {
      setFormError("Paket yang Anda pilih sudah penuh (Fully Booked) di minggu tersebut. Pilih paket atau tanggal lain.")
      return
    }
    if (lines.length === 0) {
      setFormError(mode === "paket_jesna" ? "Pilih salah satu tier paket yang tersedia." : "Pilih minimal satu produk.")
      return
    }

    setSubmitting(true)
    setFormError(null)
    try {
      const res = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client: { ...client, whatsapp: client.whatsapp.replace(/[\s-]/g, "") },
          orderType: mode,
          packageTier: mode === "paket_jesna" ? activeTier : null,
          products: mode === "produk_satuan" ? products : {},
        }),
      })
      const data = await res.json()
      if (res.status === 409 && data.availability) {
        await refreshAvailability(data.availability, { revalidate: false })
        setPackageTier(null)
        document.getElementById("package-heading")?.scrollIntoView({ behavior: "smooth", block: "start" })
      }
      if (!res.ok) throw new Error(data.error ?? "Terjadi kesalahan.")
      setConfirmation(data.payload)
      window.scrollTo({ top: 0 })
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Terjadi kesalahan. Silakan coba lagi.")
    } finally {
      setSubmitting(false)
    }
  }

  const reset = () => {
    setClient(emptyClient)
    setMode(null)
    setPackageTier(null)
    setProducts({})
    setFormError(null)
    setConfirmation(null)
    window.scrollTo({ top: 0 })
  }

  if (confirmation) {
    return (
      <main>
        <SuccessScreen order={confirmation} onReset={reset} />
      </main>
    )
  }

  return (
    <>
      <Hero />
      <main id="order" className="scroll-mt-0 border-t border-border">
        <form onSubmit={handleSubmit} noValidate className="px-6 pt-20 md:px-12 md:pt-28">
          <div className="mx-auto mb-20 max-w-6xl text-center">
            <p className="text-[11px] uppercase tracking-[0.4em] text-primary">Formulir Pesanan</p>
            <p className="mx-auto mt-4 max-w-xl font-serif text-2xl font-light italic leading-relaxed text-muted-foreground text-pretty md:text-3xl">
              Setiap detail dirangkai dengan tenang, teliti, dan penuh makna.
            </p>
          </div>
          <div className="mx-auto flex max-w-6xl flex-col gap-24">
            <ClientInfo data={client} errors={clientErrors} onChange={updateClient} />
            <OrderModeChoice
              value={mode}
              onChange={(m) => {
                setMode(m)
                setFormError(null)
              }}
            />
            {mode === "paket_jesna" ? (
              <PackageTiers
                value={activeTier}
                hasDate={hasDate}
                availability={availability}
                loading={availabilityLoading}
                availabilityError={Boolean(availabilityError)}
                onChange={(t) => {
                  setPackageTier(t)
                  setFormError(null)
                }}
              />
            ) : null}
            {mode === "produk_satuan" ? <ProductSelection value={products} onToggle={toggleProduct} /> : null}
          </div>
          <SummaryBar lines={lines} total={total} submitting={submitting} error={formError} />
        </form>
      </main>

    </>
  )
}
