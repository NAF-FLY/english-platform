import type { ReactNode } from 'react'

import { Container } from '@/src/shared/ui/container'

type AuthLayoutProps = {
  children: ReactNode
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="auth-route">
      <Container className="auth-route__container">{children}</Container>
    </div>
  )
}
