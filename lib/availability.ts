import type { TierId } from "./catalog"

export type WeekAvailability = {
  weekStart: string
  weekEnd: string
  booked: TierId[]
}

const DAY_MS = 86_400_000

export function isIsoDate(value: unknown): value is string {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value))
}

/** Booking weeks run Monday through Sunday, computed in UTC so server and browser agree. */
export function getWeekRange(isoDate: string) {
  const date = new Date(`${isoDate}T00:00:00Z`)
  const offsetFromMonday = (date.getUTCDay() + 6) % 7
  const start = new Date(date.getTime() - offsetFromMonday * DAY_MS)
  const end = new Date(start.getTime() + 6 * DAY_MS)
  return { weekStart: start.toISOString().slice(0, 10), weekEnd: end.toISOString().slice(0, 10) }
}

const dateFormatter = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" })
const dayFormatter = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", timeZone: "UTC" })

export function formatWeekRange(weekStart: string, weekEnd: string) {
  const start = new Date(`${weekStart}T00:00:00Z`)
  const end = new Date(`${weekEnd}T00:00:00Z`)
  return `${dayFormatter.format(start)} \u2013 ${dateFormatter.format(end)}`
}
