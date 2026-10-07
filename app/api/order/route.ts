import { NextResponse } from "next/server"
import {
  buildOrderLines,
  isProductId,
  isTierId,
  type OrderMode,
  type ProductSelections,
} from "@/lib/catalog"
import { releaseWeeklySlot, reserveWeeklySlot } from "@/lib/booking-store"

type IncomingOrder = {
  client?: { fullName?: unknown; whatsapp?: unknown; weddingDate?: unknown }
  orderType?: unknown
  packageTier?: unknown
  products?: Record<string, unknown>
}

const clean = (value: unknown, max = 120) => (typeof value === "string" ? value.trim().slice(0, max) : "")

export async function POST(request: Request) {
  let body: IncomingOrder
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Format permintaan tidak valid." }, { status: 400 })
  }

  const fullName = clean(body.client?.fullName)
  const whatsapp = clean(body.client?.whatsapp, 20).replace(/[^\d+]/g, "")
  const weddingDate = clean(body.client?.weddingDate, 10)

  if (fullName.length < 2) {
    return NextResponse.json({ error: "Nama lengkap wajib diisi." }, { status: 400 })
  }
  if (!/^\+?\d{9,15}$/.test(whatsapp)) {
    return NextResponse.json({ error: "Nomor WhatsApp tidak valid." }, { status: 400 })
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(weddingDate) || Number.isNaN(Date.parse(weddingDate))) {
    return NextResponse.json({ error: "Tanggal acara tidak valid." }, { status: 400 })
  }

  const orderType = body.orderType
  if (orderType !== "paket_jesna" && orderType !== "produk_satuan") {
    return NextResponse.json({ error: "Jenis pesanan tidak valid." }, { status: 400 })
  }

  const packageTier = isTierId(body.packageTier) ? body.packageTier : null
  if (orderType === "paket_jesna" && !packageTier) {
    return NextResponse.json({ error: "Pilih salah satu tier paket." }, { status: 400 })
  }
  const products: ProductSelections = {}
  for (const [key, value] of Object.entries(body.products ?? {})) {
    if (isProductId(key) && isTierId(value)) products[key] = value
  }

  // Prices are recomputed from the server-side catalog; client totals are never trusted.
  const items = buildOrderLines(orderType as OrderMode, packageTier, products)
  if (items.length === 0) {
    return NextResponse.json({ error: "Pilih minimal satu paket atau produk." }, { status: 400 })
  }

  const grandTotal = items.reduce((sum, item) => sum + item.price, 0)
  const orderId = `JWO-${Date.now().toString(36).toUpperCase()}`

  let reservedSlot = false
  if (orderType === "paket_jesna" && packageTier) {
    const reservation = reserveWeeklySlot({ orderId, tier: packageTier, weddingDate })
    if (!reservation.ok) {
      return NextResponse.json(
        {
          error: "Paket ini sudah penuh (Fully Booked) untuk minggu tanggal acara Anda. Silakan pilih paket atau tanggal lain.",
          availability: reservation.availability,
        },
        { status: 409 },
      )
    }
    reservedSlot = true
  }
  const releaseOnFailure = () => {
    if (reservedSlot) releaseWeeklySlot(orderId, weddingDate)
  }

  const payload = {
    orderId,
    source: "jesna-wedding-os",
    submittedAt: new Date().toISOString(),
    client: { fullName, whatsapp, weddingDate },
    orderType,
    items,
    grandTotal,
    currency: "IDR",
  }

  const webhookUrl = process.env.N8N_WEBHOOK_URL
  if (webhookUrl) {
    try {
      const res = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        releaseOnFailure()
        return NextResponse.json({ error: "Gagal mengirim pesanan. Silakan coba lagi." }, { status: 502 })
      }
    } catch {
      releaseOnFailure()
      return NextResponse.json({ error: "Gagal mengirim pesanan. Silakan coba lagi." }, { status: 502 })
    }
  }

  return NextResponse.json({ ok: true, payload })
}
