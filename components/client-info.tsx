import { SectionHeading } from "./section-heading"

export type ClientData = { fullName: string; whatsapp: string; weddingDate: string }
export type ClientErrors = Partial<Record<keyof ClientData, string>>

const fields: {
  key: keyof ClientData
  label: string
  type: string
  placeholder?: string
  autoComplete?: string
  inputMode?: "tel" | "text"
}[] = [
  { key: "fullName", label: "Nama Lengkap", type: "text", placeholder: "Nama sesuai identitas", autoComplete: "name" },
  {
    key: "whatsapp",
    label: "Nomor WhatsApp",
    type: "tel",
    placeholder: "08xx xxxx xxxx",
    autoComplete: "tel",
    inputMode: "tel",
  },
  { key: "weddingDate", label: "Tanggal Acara", type: "date" },
]

export function ClientInfo({
  data,
  errors,
  onChange,
}: {
  data: ClientData
  errors: ClientErrors
  onChange: (key: keyof ClientData, value: string) => void
}) {
  const today = new Date().toISOString().slice(0, 10)

  return (
    <section aria-labelledby="client-heading" className="scroll-mt-24">
      <SectionHeading index="01" eyebrow="Informasi Klien" title="Ceritakan sedikit tentang Anda" id="client-heading" />
      <div className="grid gap-6 md:grid-cols-3 md:gap-8">
        {fields.map((field) => {
          const error = errors[field.key]
          const inputId = `client-${field.key}`
          return (
            <div key={field.key} className="flex flex-col gap-2">
              <label
                htmlFor={inputId}
                className="flex min-h-11 items-center text-[11px] uppercase tracking-[0.25em] text-muted-foreground"
              >
                {field.label}
              </label>
              <input
                id={inputId}
                name={field.key}
                type={field.type}
                value={data[field.key]}
                placeholder={field.placeholder}
                autoComplete={field.autoComplete}
                inputMode={field.inputMode}
                min={field.type === "date"?"": undefined}
                required
                aria-invalid={Boolean(error)}
                aria-describedby={error ? `${inputId}-error` : undefined}
                onChange={(e) => onChange(field.key, e.target.value)}
                className="h-12 w-full scroll-mt-24 touch-manipulation border-0 border-b border-input bg-transparent px-0 font-serif text-xl text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none aria-[invalid=true]:border-destructive"
              />
              {error ? (
                <p id={`${inputId}-error`} className="text-xs text-destructive">
                  {error}
                </p>
              ) : null}
            </div>
          )
        })}
      </div>
    </section>
  )
}
