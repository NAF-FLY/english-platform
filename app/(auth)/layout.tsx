import type { ReactNode } from 'react'

import { redirect } from 'next/navigation'

import { getCurrentProfileReadModel } from '@/src/modules/profile/application'
import { Container } from '@/src/shared/ui/container'

type AuthLayoutProps = {
  children: ReactNode
}

export const dynamic = 'force-dynamic'

export default async function AuthLayout({ children }: AuthLayoutProps) {
  const profile = await getCurrentProfileReadModel()

  if (profile) {
    redirect('/cabinet')
  }

  return (
    <div className="auth-route">
      <Container className="auth-route__container">{children}</Container>
    </div>
  )
}
