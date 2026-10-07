import "server-only"
import { TIERS, type TierId } from "./catalog"
import { getWeekRange, type WeekAvailability } from "./availability"

type Booking = { orderId: string; tier: TierId; weddingDate: string }

// In-memory store (no database connected). Bookings reset when the server restarts;
// swap these functions for database queries to make the quota permanent.
const globalStore = globalThis as unknown as { __jesnaBookings?: Map<string, Booking[]> }

function getStore() {
  if (!globalStore.__jesnaBookings) {
    const seed = new Map<string, Booking[]>()
    const demoWeek = getWeekRange("2026-10-14").weekStart
    seed.set(demoWeek, [{ orderId: "JWO-DEMO", tier: "essential", weddingDate: "2026-10-14" }])
    globalStore.__jesnaBookings = seed
  }
  return globalStore.__jesnaBookings
}

export function getWeekAvailability(isoDate: string): WeekAvailability {
  const { weekStart, weekEnd } = getWeekRange(isoDate)
  const bookings = getStore().get(weekStart) ?? []
  const booked = TIERS.map((t) => t.id).filter((id) => bookings.some((b) => b.tier === id))
  return { weekStart, weekEnd, booked }
}

/** Checks and reserves in one synchronous step so two requests can't claim the same weekly slot. */
export function reserveWeeklySlot(booking: Booking): { ok: true } | { ok: false; availability: WeekAvailability } {
  const store = getStore()
  const { weekStart } = getWeekRange(booking.weddingDate)
  const bookings = store.get(weekStart) ?? []
  if (bookings.some((b) => b.tier === booking.tier)) {
    return { ok: false, availability: getWeekAvailability(booking.weddingDate) }
  }
  store.set(weekStart, [...bookings, booking])
  return { ok: true }
}

export function releaseWeeklySlot(orderId: string, weddingDate: string) {
  const store = getStore()
  const { weekStart } = getWeekRange(weddingDate)
  store.set(
    weekStart,
    (store.get(weekStart) ?? []).filter((b) => b.orderId !== orderId),
  )
}
