
"use client"

import { useEffect, useMemo, useState, type FormEvent } from "react"
import useSWR from "swr"

import { isIsoDate, type WeekAvailability } from "@/lib/availability"
import {
  buildOrderLines,
  type OrderMode,
  type ProductId,
  type ProductSelections,
  type TierId,
} from "@/lib/catalog"

import { ClientInfo, type ClientData, type ClientErrors } from "./client-info"
import { Hero } from "./hero"
import { OrderModeChoice } from "./order-mode-choice"
import { PackageTiers } from "./package-tiers"
import { ProductSelection } from "./product-selection"
import { SummaryBar } from "./summary-bar"
import { SuccessScreen, type OrderConfirmation } from "./success-screen"

const emptyClient: ClientData = {
  fullName: "",
  whatsapp: "",
  weddingDate: "",
}

type FormDiagnosticState = {
  pointerDownCount: number
  clickCount: number
  modeHandlerCount: number
  packageInDom: boolean | null
  productsInDom: boolean | null
  modeHitTest: {
    option: string
    tag: string
    id: string
    className: string
    isButtonOrDescendant: boolean
  } | null
}

function validateClient(data: ClientData): ClientErrors {
  const errors: ClientErrors = {}

  if (data.fullName.trim().length < 2) {
    errors.fullName = "Mohon isi nama lengkap Anda."
  }

  const whatsapp = data.whatsapp.replace(/[\s-]/g, "")
  if (!/^\+?\d{9,15}$/.test(whatsapp)) {
    errors.whatsapp = "Nomor WhatsApp tidak valid."
  }

  if (!data.weddingDate) {
    errors.weddingDate = "Mohon pilih tanggal acara."
  }

  return errors
}

const fetchAvailability = async (
  url: string
): Promise<WeekAvailability> => {
  const res = await fetch(url)

  if (!res.ok) {
    throw new Error("Gagal memuat ketersediaan.")
  }

  return res.json()
}

interface OrderExperienceProps {
  onConfirmationChange?: (confirmed: boolean) => void
}

export function OrderExperience({
  onConfirmationChange,
}: OrderExperienceProps = {}) {
  const [client, setClient] = useState<ClientData>(emptyClient)
  const [clientErrors, setClientErrors] = useState<ClientErrors>({})
  const [mode, setMode] = useState<OrderMode | null>(null)
  const [packageTier, setPackageTier] = useState<TierId | null>(null)
  const [products, setProducts] = useState<ProductSelections>({})
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [confirmation, setConfirmation] =
    useState<OrderConfirmation | null>(null)

  const [formDebugEnabled, setFormDebugEnabled] = useState(false)
  const [formDiagnostic, setFormDiagnostic] =
    useState<FormDiagnosticState>({
      pointerDownCount: 0,
      clickCount: 0,
      modeHandlerCount: 0,
      packageInDom: null,
      productsInDom: null,
      modeHitTest: null,
    })

  useEffect(() => {
    setFormDebugEnabled(
      new URLSearchParams(window.location.search).get("formDebug") === "1"
    )
  }, [])

  const hasDate = isIsoDate(client.weddingDate)

  const {
    data: availability,
    error: availabilityError,
    isLoading: availabilityLoading,
    mutate: refreshAvailability,
  } = useSWR(
    hasDate
      ? `/api/availability?date=${client.weddingDate}`
      : null,
    fetchAvailability,
    { keepPreviousData: false }
  )

  // Diagnostic: check whether the conditional components exist in the DOM.
  useEffect(() => {
    if (!formDebugEnabled) return

    setFormDiagnostic((current) => ({
      ...current,
      packageInDom:
        document.querySelector(
          'section[aria-labelledby="package-heading"]'
        ) !== null,
      productsInDom:
        document.querySelector(
          'section[aria-labelledby="products-heading"]'
        ) !== null,
    }))
  }, [formDebugEnabled, mode])

  // Diagnostic: record the element at every pointerdown while debugging.
  useEffect(() => {
    if (!formDebugEnabled) return

    const handlePointerDown = (event: PointerEvent) => {
      const topElement = document.elementFromPoint(
        event.clientX,
        event.clientY
      )

      const modeSection = document.querySelector(
        'section[aria-labelledby="mode-heading"]'
      )

      const modeButtons = modeSection
        ? Array.from(
            modeSection.querySelectorAll<HTMLButtonElement>(
              'button[role="radio"]'
            )
          )
        : []

      const hitButton = modeButtons.find((button) => {
        const rect = button.getBoundingClientRect()

        return (
          event.clientX >= rect.left &&
          event.clientX <= rect.right &&
          event.clientY >= rect.top &&
          event.clientY <= rect.bottom
        )
      })

      setFormDiagnostic((current) => ({
        ...current,
        modeHitTest: {
          option:
            hitButton?.querySelector("h3")?.textContent?.trim() ??
            "Bukan area tombol",
          tag: topElement?.tagName.toLowerCase() ?? "tidak ditemukan",
          id: topElement?.id ?? "",
          className: topElement?.getAttribute("class") ?? "",
          isButtonOrDescendant: hitButton
            ? hitButton.contains(topElement)
            : false,
        },
      }))
    }

    document.addEventListener("pointerdown", handlePointerDown, true)

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown, true)
    }
  }, [formDebugEnabled])

  // Remove booked product selections if the selected date changes.
  useEffect(() => {
    if (!availability?.booked?.length) return

    setProducts((prev) => {
      let changed = false
      const next: ProductSelections = {}

      for (const [key, tier] of Object.entries(prev) as [
        ProductId,
        TierId,
      ][]) {
        if (availability.booked.includes(tier)) {
          changed = true
        } else {
          next[key] = tier
        }
      }

      return changed ? next : prev
    })
  }, [availability])

  // A booked package tier cannot remain selected.
  const activeTier =
    packageTier &&
    hasDate &&
    availability &&
    !availability.booked.includes(packageTier)
      ? packageTier
      : null

  // Exclude products whose tiers are fully booked.
  const activeProducts = useMemo(() => {
    if (!availability?.booked?.length) return products

    const filtered: ProductSelections = {}

    for (const [key, tier] of Object.entries(products) as [
      ProductId,
      TierId,
    ][]) {
      if (!availability.booked.includes(tier)) {
        filtered[key] = tier
      }
    }

    return filtered
  }, [products, availability])

  const lines = useMemo(
    () => buildOrderLines(mode, activeTier, activeProducts),
    [mode, activeTier, activeProducts]
  )

  const total = lines.reduce((sum, line) => sum + line.price, 0)

  const updateClient = (key: keyof ClientData, value: string) => {
    setClient((prev) => ({ ...prev, [key]: value }))

    if (clientErrors[key]) {
      setClientErrors((prev) => ({
        ...prev,
        [key]: undefined,
      }))
    }
  }

  const toggleProduct = (product: ProductId, tier: TierId) => {
    if (availability?.booked.includes(tier)) return

    setFormError(null)

    setProducts((prev) => {
      const next = { ...prev }

      if (next[product] === tier) {
        delete next[product]
      } else {
        next[product] = tier
      }

      return next
    })
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const errors = validateClient(client)
    setClientErrors(errors)

    if (Object.keys(errors).length > 0) {
      setFormError("Mohon lengkapi informasi klien.")
      document
        .getElementById("client-heading")
        ?.scrollIntoView({ behavior: "smooth", block: "start" })
      return
    }

    if (!mode) {
      setFormError("Pilih cara Anda ingin memesan.")
      return
    }

    if (
      mode === "paket_jesna" &&
      availability &&
      packageTier &&
      availability.booked.includes(packageTier)
    ) {
      setFormError(
        "Paket yang Anda pilih sudah penuh (Fully Booked) di minggu tersebut. Pilih paket atau tanggal lain."
      )
      return
    }

    if (mode === "produk_satuan" && availability) {
      const selectedTiers = Object.values(products) as TierId[]
      const bookedSelected = selectedTiers.filter((tier) =>
        availability.booked.includes(tier)
      )

      if (bookedSelected.length > 0) {
        setFormError(
          "Satu atau lebih varian produk yang Anda pilih bertema tier yang sudah penuh (Fully Booked) di minggu tersebut. Silakan ubah pilihan produk atau tanggal acara."
        )
        return
      }
    }

    if (lines.length === 0) {
      setFormError(
        mode === "paket_jesna"
          ? "Pilih salah satu tier paket yang tersedia."
          : "Pilih minimal satu produk."
      )
      return
    }

    setSubmitting(true)
    setFormError(null)

    try {
      const res = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client: {
            ...client,
            whatsapp: client.whatsapp.replace(/[\s-]/g, ""),
          },
          orderType: mode,
          packageTier: mode === "paket_jesna" ? activeTier : null,
          products: mode === "produk_satuan" ? activeProducts : {},
        }),
      })

      const data = await res.json()

      if (res.status === 409 && data.availability) {
        await refreshAvailability(data.availability, {
          revalidate: false,
        })

        setPackageTier(null)
        setProducts({})

        document
          .getElementById(
            mode === "paket_jesna"
              ? "package-heading"
              : "products-heading"
          )
          ?.scrollIntoView({ behavior: "smooth", block: "start" })
      }

      if (!res.ok) {
        throw new Error(data.error ?? "Terjadi kesalahan.")
      }

      setConfirmation(data.payload)
      onConfirmationChange?.(true)
      window.scrollTo({ top: 0 })
    } catch (err) {
      setFormError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan. Silakan coba lagi."
      )
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
    onConfirmationChange?.(false)
    window.scrollTo({ top: 0 })
  }

  if (confirmation) {
    return <SuccessScreen order={confirmation} onReset={reset} />
  }

  return (
    <>
      <Hero />

      <main
        id="order"
        className="scroll-mt-0 border-t border-border"
      >
        <form
          onSubmit={handleSubmit}
          noValidate
          className="px-6 pt-14 md:px-12 md:pt-28"
        >
          <div className="mx-auto mb-12 max-w-6xl text-center md:mb-20">
            <p className="text-[11px] uppercase tracking-[0.4em] text-primary">
              Formulir Pesanan
            </p>

            <p className="mx-auto mt-4 max-w-xl font-serif text-2xl font-light italic leading-relaxed text-muted-foreground text-pretty md:text-3xl">
              Setiap detail dirangkai dengan tenang, teliti, dan penuh makna.
            </p>
          </div>

          {formDebugEnabled ? (
            <aside
              aria-label="Diagnostik sementara interaksi form"
              className="mx-auto mb-8 max-w-6xl border border-amber-700/40 bg-amber-50 p-4 text-sm text-stone-900"
            >
              <p className="font-medium">
                Diagnostik form aktif · Efek React dijalankan
              </p>

              <dl className="mt-2 grid gap-1 sm:grid-cols-2">
                <div>
                  <dt className="inline">Pointerdown: </dt>
                  <dd className="inline">
                    {formDiagnostic.pointerDownCount}
                  </dd>
                </div>

                <div>
                  <dt className="inline">Click: </dt>
                  <dd className="inline">{formDiagnostic.clickCount}</dd>
                </div>

                <div>
                  <dt className="inline">
                    Handler pemilihan mode dijalankan:{" "}
                  </dt>
                  <dd className="inline">
                    {formDiagnostic.modeHandlerCount}
                  </dd>
                </div>

                <div>
                  <dt className="inline">Mode setelah update React: </dt>
                  <dd className="inline">
                    {mode === "paket_jesna"
                      ? "Paket Jesna"
                      : mode === "produk_satuan"
                        ? "Produk Satuan"
                        : "Belum dipilih"}
                  </dd>
                </div>

                <div>
                  <dt className="inline">Input tanggal: </dt>
                  <dd className="inline">
                    {hasDate ? "Valid" : "Tidak valid / belum diisi"}
                  </dd>
                </div>

                <div>
                  <dt className="inline">Ketersediaan: </dt>
                  <dd className="inline">
                    {!hasDate
                      ? "Tidak diminta"
                      : availabilityError
                        ? "Gagal"
                        : availabilityLoading
                          ? "Loading"
                          : availability
                            ? "Berhasil"
                            : "Loading"}
                  </dd>
                </div>

                <div>
                  <dt className="inline">Komponen paket ada di DOM: </dt>
                  <dd className="inline">
                    {formDiagnostic.packageInDom === null
                      ? "Belum diperiksa"
                      : formDiagnostic.packageInDom
                        ? "Ya"
                        : "Tidak"}
                  </dd>
                </div>

                <div>
                  <dt className="inline">Komponen produk ada di DOM: </dt>
                  <dd className="inline">
                    {formDiagnostic.productsInDom === null
                      ? "Belum diperiksa"
                      : formDiagnostic.productsInDom
                        ? "Ya"
                        : "Tidak"}
                  </dd>
                </div>

                <div className="sm:col-span-2">
                  <dt className="inline">
                    Hit-test ketukan tombol mode:{" "}
                  </dt>

                  {formDiagnostic.modeHitTest ? (
                    <dd className="mt-1 grid gap-1 break-all">
                      <span>
                        Area opsi: {formDiagnostic.modeHitTest.option}
                      </span>
                      <span>
                        Tag: {formDiagnostic.modeHitTest.tag}
                      </span>
                      <span>
                        Id: {formDiagnostic.modeHitTest.id || "(kosong)"}
                      </span>
                      <span>
                        Class:{" "}
                        {formDiagnostic.modeHitTest.className || "(kosong)"}
                      </span>
                      <span>
                        Tombol mode atau keturunannya:{" "}
                        {formDiagnostic.modeHitTest.isButtonOrDescendant
                          ? "Ya"
                          : "Tidak"}
                      </span>
                    </dd>
                  ) : (
                    <dd className="inline">
                      Belum ada ketukan terdeteksi di area tombol mode
                    </dd>
                  )}
                </div>
              </dl>

              <p className="mt-2 text-xs">
                Diagnostik ini membantu memeriksa interaksi, tetapi belum
                memastikan penyebab masalah kompatibilitas perangkat.
              </p>
            </aside>
          ) : null}

          <div className="mx-auto flex max-w-6xl flex-col gap-16 md:gap-24">
            <ClientInfo
              data={client}
              errors={clientErrors}
              onChange={updateClient}
            />

            <OrderModeChoice
              value={mode}
              onDiagnosticPointerDown={
                formDebugEnabled
                  ? () =>
                      setFormDiagnostic((current) => ({
                        ...current,
                        pointerDownCount: current.pointerDownCount + 1,
                      }))
                  : undefined
              }
              onDiagnosticClick={
                formDebugEnabled
                  ? () =>
                      setFormDiagnostic((current) => ({
                        ...current,
                        clickCount: current.clickCount + 1,
                      }))
                  : undefined
              }
              onChange={(m) => {
                if (formDebugEnabled) {
                  setFormDiagnostic((current) => ({
                    ...current,
                    modeHandlerCount: current.modeHandlerCount + 1,
                  }))
                }

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
                onChange={(tier) => {
                  setPackageTier(tier)
                  setFormError(null)
                }}
              />
            ) : null}

            {mode === "produk_satuan" ? (
              <ProductSelection
                value={products}
                onToggle={toggleProduct}
                hasDate={hasDate}
                availability={availability}
                loading={availabilityLoading}
                availabilityError={Boolean(availabilityError)}
              />
            ) : null}
          </div>

          <SummaryBar
            lines={lines}
            total={total}
            submitting={submitting}
            error={formError}
          />
        </form>
      </main>
    </>
  )
}