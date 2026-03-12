type SectionHeadingProps = {
  description: string
  eyebrow?: string
  title: string
}

export function SectionHeading({
  description,
  eyebrow,
  title,
}: SectionHeadingProps) {
  return (
    <div className="section-heading">
      {eyebrow ? <p className="section-heading__eyebrow">{eyebrow}</p> : null}
      <h2 className="section-heading__title">{title}</h2>
      <p className="section-heading__description">{description}</p>
    </div>
  )
}
