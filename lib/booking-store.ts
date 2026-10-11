import "server-only"
import { TIERS, type TierId } from "./catalog"
import { getWeekRange, type WeekAvailability } from "./availability"

export type Booking = { orderId: string; tiers: TierId[]; weddingDate: string }

// In-memory store (no database connected). Bookings reset when the server restarts;
// swap these functions for database queries to make the quota permanent.
const globalStore = globalThis as unknown as { __jesnaBookings?: Map<string, Booking[]> }

function getStore() {
  if (!globalStore.__jesnaBookings) {
    globalStore.__jesnaBookings = new Map<string, Booking[]>()
  }
  return globalStore.__jesnaBookings
}

export function getWeekAvailability(isoDate: string): WeekAvailability {
  const { weekStart, weekEnd } = getWeekRange(isoDate)
  const bookings = getStore().get(weekStart) ?? []
  // Tier berstatus 'Fully Booked' jika sudah ada minimal 1 pesanan (baik dari Paket Jesna maupun Produk Satuan) di minggu tersebut
  const booked = TIERS.map((t) => t.id).filter((id) =>
    bookings.some((b) => b.tiers.includes(id))
  )
  return { weekStart, weekEnd, booked }
}

/** Memeriksa dan mereservasi slot mingguan untuk satu atau beberapa tier sekaligus secara sinkron. */
export function reserveWeeklySlots(booking: {
  orderId: string
  tiers: TierId[]
  weddingDate: string
}): { ok: true } | { ok: false; availability: WeekAvailability } {
  const store = getStore()
  const { weekStart } = getWeekRange(booking.weddingDate)
  const bookings = store.get(weekStart) ?? []
  const currentBookedTiers = new Set(bookings.flatMap((b) => b.tiers))

  // Jika ada tier yang diminta sudah berstatus booked di minggu tersebut, tolak pemesanan
  const hasConflict = booking.tiers.some((tier) => currentBookedTiers.has(tier))
  if (hasConflict) {
    return { ok: false, availability: getWeekAvailability(booking.weddingDate) }
  }

  store.set(weekStart, [...bookings, booking])
  return { ok: true }
}

/** Kompatibilitas mundur untuk pemesanan single-tier */
export function reserveWeeklySlot(booking: { orderId: string; tier: TierId; weddingDate: string }) {
  return reserveWeeklySlots({
    orderId: booking.orderId,
    tiers: [booking.tier],
    weddingDate: booking.weddingDate,
  })
}

export function releaseWeeklySlot(orderId: string, weddingDate: string) {
  const store = getStore()
  const { weekStart } = getWeekRange(weddingDate)
  store.set(
    weekStart,
    (store.get(weekStart) ?? []).filter((b) => b.orderId !== orderId),
  )
}
