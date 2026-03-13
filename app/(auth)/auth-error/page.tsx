import type { Route } from 'next'

import { runServerBoundary } from '@/src/server/guards/run-server-boundary'
import {
  buildAuthRouteHref,
  sanitizeReturnToPath,
} from '@/src/server/guards/auth-route-policy'
import { AuthFeedback } from '@/src/modules/auth/ui/auth-feedback'
import { AuthShell } from '@/src/shared/ui/auth-shell'
import { ButtonLink } from '@/src/shared/ui/button-link'
import { Surface } from '@/src/shared/ui/surface'

type AuthErrorPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

type AuthErrorReason = 'invalid-link' | 'missing-code'

const reasonContent: Record<AuthErrorReason, { description: string; title: string }> = {
  'invalid-link': {
    description: 'Ссылка подтверждения устарела, уже была использована или открылась вне активной auth-сессии.',
    title: 'Ссылка больше не действует',
  },
  'missing-code': {
    description: 'Подтверждение открылось без кода обмена. Обычно это значит, что письмо было обрезано или маршрут открылся не полностью.',
    title: 'Подтверждение не завершилось',
  },
}

export const dynamic = 'force-dynamic'

export default async function AuthErrorPage({
  searchParams,
}: AuthErrorPageProps) {
  return runServerBoundary({
    boundary: 'auth:auth-error',
    async operation() {
      const resolvedSearchParams = await searchParams
      const reason = getReason(resolvedSearchParams.reason)
      const safeReturnTo = sanitizeReturnToPath(getSearchParam(resolvedSearchParams.returnTo))
      const signInHref = buildAuthRouteHref('/sign-in', safeReturnTo)
      const signUpHref = buildAuthRouteHref('/sign-up', safeReturnTo)
      const content = reasonContent[reason]

      return (
        <AuthShell
          badge="Проверка доступа"
          description="Ошибки callback-маршрута не обрывают сценарий: пользователь всегда получает понятное объяснение и короткий следующий шаг."
          footer="Если письмо пришло давно, запросите новый вход или повторите регистрацию с тем же email."
          title={content.title}
        >
          <Surface className="stack-md" variant="raised">
            <AuthFeedback tone="warning">
              {content.description}
            </AuthFeedback>

            <div className="stack-md">
              <p className="auth-note">
                Новый вход обновит SSR-сессию и при наличии безопасного `returnTo`
                вернет вас туда, куда вы собирались попасть изначально.
              </p>
            </div>

            <div className="action-row">
              <ButtonLink href={asRoute(signInHref)} variant="primary">
                Открыть вход
              </ButtonLink>
              <ButtonLink href={asRoute(signUpHref)} variant="secondary">
                Зарегистрироваться заново
              </ButtonLink>
              <ButtonLink href="/" variant="ghost">
                Вернуться на лендинг
              </ButtonLink>
            </div>
          </Surface>
        </AuthShell>
      )
    },
  })
}

function getReason(value: string | string[] | undefined): AuthErrorReason {
  const normalizedValue = getSearchParam(value)

  return normalizedValue === 'missing-code' ? 'missing-code' : 'invalid-link'
}

function getSearchParam(value: string | string[] | undefined): string | null {
  if (Array.isArray(value)) {
    return value[0] ?? null
  }

  return value ?? null
}

function asRoute(pathname: string): Route {
  return pathname as Route
}
