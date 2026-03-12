import type { ReactNode } from 'react'

type AuthShellProps = {
  badge: string
  children: ReactNode
  description: string
  footer?: ReactNode
  title: string
}

export function AuthShell({
  badge,
  children,
  description,
  footer,
  title,
}: AuthShellProps) {
  return (
    <div className="auth-shell">
      <header className="auth-shell__header">
        <span aria-hidden="true" className="auth-shell__mark">
          EP
        </span>
        <p className="auth-shell__eyebrow">{badge}</p>
        <h1 className="auth-shell__title">{title}</h1>
        <p className="auth-shell__description">{description}</p>
      </header>
      {children}
      {footer ? <div className="auth-footer">{footer}</div> : null}
    </div>
  )
}
