import 'server-only'

import type { Route } from 'next'
import { cache } from 'react'

import type { PlatformRole } from '@/src/lib/supabase'
import { getRequestAccessSnapshot } from '@/src/server/guards/get-request-access-snapshot'
import { AppError } from '@/src/shared/types'

export type CurrentProfileReadModel = {
  email: string | null
  displayName: string
  isAdmin: boolean
  isInternal: boolean
  isLearner: boolean
  primaryRole: PlatformRole
  roleLabel: string
  roleLabels: string[]
  roleSummary: string
  subtitle: string
  userId: string
  username: string | null
  workspaceNote: string
}

type NavigationItem = {
  current?: boolean
  href: Route
  label: string
}

export const getCurrentProfileReadModel = cache(async (): Promise<CurrentProfileReadModel | null> => {
  const access = await getRequestAccessSnapshot()

  if (!access.user) {
    return null
  }

  try {
    const roles = access.user.roles
    const primaryRole = resolvePrimaryRole(roles)
    const roleLabels = roles
      .map(getRoleLabel)
      .sort((left, right) => roleOrder[left].localeCompare(roleOrder[right], 'ru'))
    const displayName = resolveDisplayName(access.user.profile?.display_name, access.user.email)

    return {
      email: access.user.email,
      displayName,
      isAdmin: access.isAdmin,
      isInternal: access.isInternal,
      isLearner: roles.includes('learner'),
      primaryRole,
      roleLabel: getRoleLabel(primaryRole),
      roleLabels,
      roleSummary: roleLabels.join(' + '),
      subtitle: getWorkspaceSubtitle(primaryRole, access.isInternal),
      userId: access.user.id,
      username: access.user.profile?.username ?? null,
      workspaceNote: getWorkspaceNote(primaryRole, access.isInternal),
    }
  } catch (error) {
    if (error instanceof AppError) {
      throw error
    }

    throw new AppError('UNEXPECTED', 'Failed to build current profile read model.', {
      cause: error,
      context: {
        boundary: 'profile',
        operation: 'getCurrentProfileReadModel',
        table: 'profiles',
      },
    })
  }
})

export function getCabinetNavigation(profile: CurrentProfileReadModel): NavigationItem[] {
  const navigation: NavigationItem[] = [
    { current: true, href: '/cabinet', label: 'Обзор' },
    { href: '/cabinet#lessons' as Route, label: 'Уроки' },
    { href: '/cabinet#progress' as Route, label: 'Прогресс' },
    { href: '/cabinet#profile' as Route, label: 'Профиль' },
  ]

  if (profile.isInternal) {
    navigation.push({
      href: '/cabinet#internal' as Route,
      label: profile.isAdmin ? 'Платформа' : 'Команда',
    })
  }

  return navigation
}

export function getPublicAreaNavigation(
  profile: CurrentProfileReadModel | null,
): NavigationItem[] {
  if (!profile) {
    return [
      { href: '/', label: 'Обзор' },
      { href: '/sign-in', label: 'Вход' },
      { href: '/sign-up', label: 'Регистрация' },
      { href: '/cabinet', label: 'Кабинет' },
    ]
  }

  const navigation: NavigationItem[] = [
    { href: '/', label: 'Обзор' },
    { href: '/cabinet', label: 'Кабинет' },
    { href: '/cabinet#progress' as Route, label: 'Прогресс' },
    { href: '/cabinet#profile' as Route, label: 'Профиль' },
  ]

  if (profile.isInternal) {
    navigation.push({
      href: '/cabinet#internal' as Route,
      label: profile.isAdmin ? 'Платформа' : 'Команда',
    })
  }

  return navigation
}

function resolvePrimaryRole(roles: PlatformRole[]): PlatformRole {
  if (roles.includes('admin')) {
    return 'admin'
  }

  if (roles.includes('staff')) {
    return 'staff'
  }

  return 'learner'
}

function resolveDisplayName(displayName: string | null | undefined, email: string | null) {
  if (displayName && displayName.trim().length > 0) {
    return displayName.trim()
  }

  if (email) {
    return email.split('@')[0] ?? 'Learner'
  }

  return 'Learner'
}

function getRoleLabel(role: PlatformRole): string {
  switch (role) {
    case 'admin':
      return 'Администратор'
    case 'staff':
      return 'Команда'
    default:
      return 'Ученик'
  }
}

function getWorkspaceSubtitle(primaryRole: PlatformRole, isInternal: boolean) {
  if (primaryRole === 'admin') {
    return 'Кабинет платформы'
  }

  if (isInternal) {
    return 'Кабинет команды'
  }

  return 'Рабочее пространство ученика'
}

function getWorkspaceNote(primaryRole: PlatformRole, isInternal: boolean) {
  if (primaryRole === 'admin') {
    return 'Расширенный доступ уже распознан. Этот shell можно безопасно наращивать внутренними инструментами без отдельного входа.'
  }

  if (isInternal) {
    return 'Командный доступ сохранен рядом с ученическим кабинетом, чтобы внутренние сценарии не требовали отдельной auth-ветки.'
  }

  return 'Кабинет уже работает от реальной сессии и профиля. Следующие модули уроков, упражнений и прогресса можно подключать поверх этой защищенной оболочки.'
}

const roleOrder: Record<string, string> = {
  Администратор: '1',
  Команда: '2',
  Ученик: '3',
}
