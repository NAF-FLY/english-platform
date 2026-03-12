type FeatureListItem = {
  description?: string
  title: string
}

type FeatureListProps = {
  items: readonly FeatureListItem[]
}

export function FeatureList({ items }: FeatureListProps) {
  return (
    <ul className="feature-list">
      {items.map((item) => (
        <li className="feature-list__item" key={item.title}>
          <strong className="feature-list__title">{item.title}</strong>
          {item.description ? (
            <p className="feature-list__description">{item.description}</p>
          ) : null}
        </li>
      ))}
    </ul>
  )
}
