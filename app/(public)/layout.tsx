import type { ReactNode } from 'react'

import {
  getCurrentProfileReadModel,
  getPublicAreaNavigation,
} from '@/src/modules/profile/application'
import { AreaLayout } from '@/src/shared/ui/area-layout'

type PublicLayoutProps = {
  children: ReactNode
}

export const dynamic = 'force-dynamic'

export default async function PublicLayout({ children }: PublicLayoutProps) {
  const profile = await getCurrentProfileReadModel()
  const description = profile
    ? `Сессия активна для ${profile.displayName}. Публичная зона теперь ведет обратно в кабинет без повторного входа.`
    : 'Публичная зона продукта: вводный контекст, маршрут авторизации и вход в защищенный кабинет.'

  return (
    <AreaLayout
      description={description}
      navigation={getPublicAreaNavigation(profile)}
      subtitle="Публичная зона"
      title="English Platform"
      tone="default"
    >
      {children}
    </AreaLayout>
  )
}
