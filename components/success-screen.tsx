import { formatIDR, type OrderLine } from "@/lib/catalog"

export type OrderConfirmation = {
  orderId: string
  client: { fullName: string; whatsapp: string; weddingDate: string }
  items: OrderLine[]
  grandTotal: number
}

export function SuccessScreen({ order, onReset }: { order: OrderConfirmation; onReset: () => void }) {
  const firstName = order.client.fullName.split(" ")[0]
  const date = new Date(`${order.client.weddingDate}T00:00:00`).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })

  return (
    <section
      aria-labelledby="success-heading"
      className="mx-auto flex min-h-svh max-w-2xl flex-col items-center justify-center px-6 py-20 text-center animate-in fade-in zoom-in-95 duration-700"
    >
      <div aria-hidden="true" className="mb-10 flex size-20 items-center justify-center rounded-full border border-primary">
        <span className="font-serif text-3xl italic text-primary">JN</span>
      </div>
      <p className="mb-4 text-[11px] uppercase tracking-[0.4em] text-primary">Pesanan Diterima</p>
      <h1 id="success-heading" className="font-serif text-5xl font-light leading-tight text-balance md:text-6xl">
        Terima kasih, <em className="italic text-primary">{firstName}</em>
      </h1>
      <p className="mt-6 max-w-md leading-relaxed text-muted-foreground text-pretty">
        Detail pesanan Anda telah kami terima. Tim Jesna akan menghubungi Anda melalui WhatsApp di{" "}
        <span className="text-foreground">{order.client.whatsapp}</span> dalam 1x24 jam.
      </p>

      <div className="mt-12 w-full border border-border bg-card p-8 text-left">
        <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-border pb-4">
          <span className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground">No. Pesanan</span>
          <span className="font-mono text-sm">{order.orderId}</span>
        </div>
        <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-border py-4">
          <span className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground">Tanggal Acara</span>
          <span className="font-serif text-lg">{date}</span>
        </div>
        <ul className="flex flex-col gap-3 border-b border-border py-4">
          {order.items.map((item) => (
            <li key={item.category} className="flex justify-between gap-4">
              <span>
                {item.label} <span className="text-muted-foreground">· {item.tierName}</span>
              </span>
              <span className="tabular-nums">{formatIDR(item.price)}</span>
            </li>
          ))}
        </ul>
        <div className="flex items-baseline justify-between pt-4">
          <span className="text-[11px] uppercase tracking-[0.3em] text-primary">Total</span>
          <span className="font-serif text-3xl text-primary tabular-nums">{formatIDR(order.grandTotal)}</span>
        </div>
      </div>

      <button
        type="button"
        onClick={onReset}
        className="mt-10 border-b border-foreground pb-1 text-xs uppercase tracking-[0.3em] transition-colors hover:border-primary hover:text-primary cursor-pointer"
      >
        Buat Pesanan Baru
      </button>
    </section>
  )
}
