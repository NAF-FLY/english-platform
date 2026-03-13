import type { ReactNode } from 'react'

import type { Route } from 'next'
import { redirect } from 'next/navigation'

import { signOutAction } from '@/app/(cabinet)/actions'
import { SignOutButton } from '@/src/modules/auth/ui/sign-out-button'
import {
  getCabinetNavigation,
  getCurrentProfileReadModel,
} from '@/src/modules/profile/application'
import { buildSignInRedirectDestination } from '@/src/server/guards/auth-route-policy'
import { WorkspaceShell } from '@/src/shared/ui/workspace-shell'

type CabinetLayoutProps = {
  children: ReactNode
}

export const dynamic = 'force-dynamic'

export default async function CabinetLayout({ children }: CabinetLayoutProps) {
  const profile = await getCurrentProfileReadModel()

  if (!profile) {
    redirect(asRoute(buildSignInRedirectDestination('/cabinet')))
  }

  return (
    <WorkspaceShell
      navigation={getCabinetNavigation(profile)}
      note={profile.workspaceNote}
      subtitle={profile.subtitle}
      title="English Platform"
      userActions={<SignOutButton action={signOutAction} label="Выйти из кабинета" />}
      userEmail={profile.email}
      userName={profile.displayName}
      userRole={profile.roleSummary}
    >
      {children}
    </WorkspaceShell>
  )
}

function asRoute(pathname: string): Route {
  return pathname as Route
}
