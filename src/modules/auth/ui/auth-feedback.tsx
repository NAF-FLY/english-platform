import type { ReactNode } from 'react'

type AuthFeedbackProps = {
  children: ReactNode
  tone?: 'error' | 'muted' | 'success' | 'warning'
}

export function AuthFeedback({
  children,
  tone = 'muted',
}: AuthFeedbackProps) {
  return (
    <div className="auth-feedback" data-tone={tone} role={tone === 'error' ? 'alert' : 'status'}>
      {children}
    </div>
  )
}
