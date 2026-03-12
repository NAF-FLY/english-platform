type DetailListItem = {
  description: string
  label: string
}

type DetailListProps = {
  items: readonly DetailListItem[]
}

export function DetailList({ items }: DetailListProps) {
  return (
    <dl className="detail-list">
      {items.map((item) => (
        <div className="detail-list__item" key={item.label}>
          <dt className="detail-list__label">{item.label}</dt>
          <dd className="detail-list__description">{item.description}</dd>
        </div>
      ))}
    </dl>
  )
}
