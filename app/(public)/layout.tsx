import type { ReactNode } from 'react'

import { AreaLayout } from '@/src/shared/ui/area-layout'

type PublicLayoutProps = {
  children: ReactNode
}

export default function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <AreaLayout
      description="Публичная зона продукта: вводный контекст, текущий статус платформенного каркаса и вход в будущие сценарии авторизации и кабинета."
      navigation={[
        { href: '/', label: 'Обзор' },
        { href: '/sign-in', label: 'Вход' },
        { href: '/sign-up', label: 'Регистрация' },
        { href: '/cabinet', label: 'Кабинет' },
      ]}
      subtitle="Публичная зона"
      title="English Platform"
      tone="default"
    >
      {children}
    </AreaLayout>
  )
}
