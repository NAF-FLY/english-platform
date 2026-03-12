import type { ReactNode } from 'react'

type BadgeProps = {
  children: ReactNode
  tone?: 'accent' | 'muted' | 'success'
}

export function Badge({ children, tone = 'muted' }: BadgeProps) {
  return (
    <span className="badge" data-tone={tone}>
      {children}
    </span>
  )
}
