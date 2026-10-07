import { NextResponse } from "next/server"
import { isIsoDate } from "@/lib/availability"
import { getWeekAvailability } from "@/lib/booking-store"

export async function GET(request: Request) {
  const date = new URL(request.url).searchParams.get("date")
  if (!isIsoDate(date)) {
    return NextResponse.json({ error: "Tanggal tidak valid." }, { status: 400 })
  }
  return NextResponse.json(getWeekAvailability(date), { headers: { "Cache-Control": "no-store" } })
}
