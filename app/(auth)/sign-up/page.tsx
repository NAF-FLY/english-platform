import type { Route } from 'next'

import { submitSignUpAction } from '@/app/(auth)/actions'
import { SignUpForm } from '@/src/modules/auth/ui/sign-up-form'
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

const onboardingBenefits = [
  {
    description: 'Регистрация не создает скрытую сессию: пользователь явно подтверждает email и понимает следующий шаг.',
    title: 'Стартовый flow теперь честный и предсказуемый.',
  },
  {
    description: 'Подтверждение email, просроченные ссылки и возврат в нужный раздел уже встроены в общий маршрут.',
    title: 'Технические сценарии не выбиваются из UX.',
  },
  {
    description: 'Та же система состояний затем переиспользуется во входе, callback-ошибках и следующих auth-экранах.',
    title: 'UI-контракт уже общий для всей auth-зоны.',
  },
] as const

const onboardingDetails = [
  {
    description: 'Имя, email и пароль отправляются в Supabase Auth, а профиль и роль ученика создаются через текущий DB-trigger.',
    label: 'Сценарий старта',
  },
  {
    description: 'После успешной регистрации пользователь остается на странице и получает явный статус ожидания письма.',
    label: 'Куда ведёт CTA',
  },
  {
    description: 'Занятый email, подтверждение и callback-ошибки уже используют один и тот же визуальный контракт сообщений.',
    label: 'Что добавится',
  },
] as const

export const dynamic = 'force-dynamic'

type SignUpPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function SignUpPage({
  searchParams,
}: SignUpPageProps) {
  return runServerBoundary({
    boundary: 'auth:sign-up',
    async operation() {
      const resolvedSearchParams = await searchParams
      const safeReturnTo = sanitizeReturnToPath(getSearchParam(resolvedSearchParams.returnTo))
      const signInHref = buildAuthRouteHref('/sign-in', safeReturnTo)
      const notice = safeReturnTo
        ? 'После подтверждения email безопасно вернем вас туда, куда вы собирались попасть.'
        : null

      return (
        <AuthShell
          badge="Первый вход"
          description="Регистрация теперь сразу подключена к Supabase Auth: короткая форма, понятный статус ожидания письма и безаварийный callback-маршрут."
          footer="После письма подтверждения система обменяет код на SSR-сессию и продолжит маршрут без ручных шагов."
          title="Создайте доступ к своему учебному маршруту"
        >
          <Surface className="stack-md" variant="raised">
            <SignUpForm
              action={submitSignUpAction}
              initialReturnTo={safeReturnTo ?? ''}
              notice={notice}
            />

            <div className="action-row">
              <ButtonLink href={asRoute(signInHref)} variant="secondary">
                У меня уже есть аккаунт
              </ButtonLink>
              <ButtonLink href="/" variant="ghost">
                Вернуться на лендинг
              </ButtonLink>
            </div>

            <p className="auth-note">
              Сразу после регистрации кабинет не открывается: сначала требуется подтверждение email.
            </p>
          </Surface>

          <Surface variant="accent">
            <SectionHeading
              description="Регистрация теперь объясняет, зачем пользователь оставляет данные и куда он попадёт дальше."
              eyebrow="Преимущества"
              title="Почему этот shell уже полезен продукту"
            />
            <FeatureList items={onboardingBenefits} />
          </Surface>

          <Surface>
            <SectionHeading
              description="Когда начнётся интеграция Supabase Auth, реализация будет опираться на уже готовую структуру маршрута."
              eyebrow="Следом"
              title="Что ожидается от подключения регистрации"
            />
            <DetailList items={onboardingDetails} />
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

function asRoute(pathname: string): Route {
  return pathname as Route
}
