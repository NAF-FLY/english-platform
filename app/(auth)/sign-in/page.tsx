import type { Route } from 'next'

import { submitSignInAction } from '@/app/(auth)/actions'
import { SignInForm } from '@/src/modules/auth/ui/sign-in-form'
import { runServerBoundary } from '@/src/server/guards/run-server-boundary'
import {
  buildAuthRouteHref,
  sanitizeReturnToPath,
} from '@/src/server/guards/auth-route-policy'
import { AuthShell } from '@/src/shared/ui/auth-shell'
import { ButtonLink } from '@/src/shared/ui/button-link'
import { DetailList } from '@/src/shared/ui/detail-list'
import { FeatureList } from '@/src/shared/ui/feature-list'
import { SectionHeading } from '@/src/shared/ui/section-heading'
import { Surface } from '@/src/shared/ui/surface'

const signInReadiness = [
  {
    description: 'Вход по email и паролю идет через server action и SSR-cookie без клиентского auth-store.',
    label: 'Следом подключается',
  },
  {
    description: 'Безопасный `returnTo` возвращает пользователя в нужный раздел после успешной авторизации.',
    label: 'Поведение после входа',
  },
  {
    description: 'Ошибки неподтвержденного email, неверного пароля и callback-сбоев показываются одним UX-контрактом.',
    label: 'Слой ошибок',
  },
] as const

const signInSignals = [
  {
    description: 'Google и Apple сохранены в интерфейсе, но честно помечены как отложенный MVP scope.',
    title: 'Социальный вход больше не выглядит рабочим обещанием.',
  },
  {
    description: 'Форма теперь реально отправляет данные и удерживает пользователя в одном спокойном потоке.',
    title: 'Основной вход уже рабочий, а не декоративный.',
  },
  {
    description: 'Восстановление пароля остается отдельно, чтобы не размывать текущий auth milestone.',
    title: 'Служебные сценарии остаются за границей MVP.',
  },
] as const

export const dynamic = 'force-dynamic'

type SignInPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function SignInPage({
  searchParams,
}: SignInPageProps) {
  return runServerBoundary({
    boundary: 'auth:sign-in',
    async operation() {
      const resolvedSearchParams = await searchParams
      const safeReturnTo = sanitizeReturnToPath(getSearchParam(resolvedSearchParams.returnTo))
      const signUpHref = buildAuthRouteHref('/sign-up', safeReturnTo)
      const notice = resolveSignInNotice(
        getSearchParam(resolvedSearchParams.notice),
        safeReturnTo,
      )

      return (
        <AuthShell
          badge="Возвращение в ритм"
          description="Вход остается лаконичным: отложенные social entry, короткая email-форма, безопасный redirect и понятные состояния без технического шума."
          footer="Если подтверждение email уже прошло, успешный вход сразу вернет вас к урокам или в кабинет."
          title="С возвращением к ежедневной практике"
        >
          <Surface className="stack-md" variant="raised">
            <SignInForm
              action={submitSignInAction}
              initialReturnTo={safeReturnTo ?? ''}
              notice={notice}
            />

            <div className="action-row">
              <ButtonLink href={asRoute(signUpHref)} variant="secondary">
                Создать аккаунт
              </ButtonLink>
              <ButtonLink href="/" variant="ghost">
                Вернуться на лендинг
              </ButtonLink>
            </div>

            <p className="auth-note">
              В MVP доступен только email/password. После входа маршрут защиты и middleware сами
              доведут пользователя до кабинета.
            </p>
          </Surface>

          <Surface>
            <SectionHeading
              description="Страница уже собрана так, чтобы настоящие auth-потоки вошли без смены композиции."
              eyebrow="Готовность shell"
              title="Что здесь уже стабилизировано"
            />
            <DetailList items={signInReadiness} />
          </Surface>

          <Surface variant="accent">
            <SectionHeading
              description="Эти правила будут одинаково работать для sign in, sign up и будущих сценариев восстановления доступа."
              eyebrow="Принципы"
              title="Как теперь устроен вход"
            />
            <FeatureList items={signInSignals} />
          </Surface>
        </AuthShell>
      )
    },
  })
}

function getSearchParam(value: string | string[] | undefined): string | null {
  if (Array.isArray(value)) {
    return value[0] ?? null
  }

  return value ?? null
}

function resolveSignInNotice(
  notice: string | null,
  returnTo: string | null,
): string | null {
  if (notice === 'signed-out') {
    return 'Сессия завершена. Можно войти снова с этого же устройства.'
  }

  if (returnTo) {
    return 'После входа вернем вас к разделу, который вы пытались открыть.'
  }

  return null
}

function asRoute(pathname: string): Route {
  return pathname as Route
}
