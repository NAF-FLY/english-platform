type ProgressBarProps = {
  description?: string
  label: string
  progress: number
  tone?: 'accent' | 'cool' | 'success'
  value: string
}

export function ProgressBar({
  description,
  label,
  progress,
  tone = 'accent',
  value,
}: ProgressBarProps) {
  const normalizedProgress = Math.max(0, Math.min(100, progress))

  return (
    <div className="progress-bar">
      <div className="progress-bar__row">
        <span>{label}</span>
        <span className="progress-bar__value">{value}</span>
      </div>
      <div
        aria-hidden="true"
        className="progress-bar__track"
        role="presentation"
      >
        <div
          className="progress-bar__fill"
          data-tone={tone === 'accent' ? 'accent' : tone}
          style={{ width: `${normalizedProgress}%` }}
        />
      </div>
      {description ? <p className="progress-bar__description">{description}</p> : null}
    </div>
  )
}
