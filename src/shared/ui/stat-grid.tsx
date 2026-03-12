type StatGridItem = {
  label: string
  meta?: string
  tone?: 'accent' | 'cool' | 'default' | 'success'
  value: string
}

type StatGridProps = {
  items: readonly StatGridItem[]
}

export function StatGrid({ items }: StatGridProps) {
  return (
    <div className="stat-grid">
      {items.map((item) => (
        <article className="stat-card" data-tone={item.tone ?? 'default'} key={item.label}>
          <span className="stat-card__label">{item.label}</span>
          <p className="stat-card__value">{item.value}</p>
          {item.meta ? <p className="stat-card__meta">{item.meta}</p> : null}
        </article>
      ))}
    </div>
  )
}
