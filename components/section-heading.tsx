export function SectionHeading({
  index,
  eyebrow,
  title,
  id,
}: {
  index: string
  eyebrow: string
  title: string
  id?: string
}) {
  return (
    <div className="mb-10 flex flex-col gap-4 border-b border-border pb-6 md:flex-row md:items-end md:justify-between">
      <div>
        <p className="mb-3 text-[11px] uppercase tracking-[0.35em] text-primary">{eyebrow}</p>
        <h2 id={id} className="scroll-mt-24 font-serif text-3xl font-light leading-tight text-balance md:text-4xl">
          {title}
        </h2>
      </div>
      <span aria-hidden="true" className="font-serif text-5xl font-light italic text-border md:text-6xl">
        {index}
      </span>
    </div>
  )
}
