import type { ReactNode } from 'react'

import { WorkspaceShell } from '@/src/shared/ui/workspace-shell'

type CabinetLayoutProps = {
  children: ReactNode
}

export default function CabinetLayout({ children }: CabinetLayoutProps) {
  return (
    <WorkspaceShell
      navigation={[
        { current: true, href: '/cabinet', label: 'Обзор' },
        { href: '/cabinet#lessons', label: 'Уроки' },
        { href: '/cabinet#progress', label: 'Прогресс' },
        { href: '/cabinet#profile', label: 'Профиль' },
      ]}
      note="Sidebar-shell, обзорные метрики и секции кабинета уже готовы для следующих модулей: уроков, упражнений, прогресса и профиля."
      subtitle="Рабочее пространство ученика"
      title="English Platform"
      userName="Анна Миронова"
      userRole="Траектория: разговорный B1 → уверенный B2"
    >
      {children}
    </WorkspaceShell>
  )
}
