import { runServerBoundary } from '@/src/server/guards/run-server-boundary'
import { AuthShell } from '@/src/shared/ui/auth-shell'
import { ButtonLink } from '@/src/shared/ui/button-link'
import { DetailList } from '@/src/shared/ui/detail-list'
import { FeatureList } from '@/src/shared/ui/feature-list'
import { SectionHeading } from '@/src/shared/ui/section-heading'
import { Surface } from '@/src/shared/ui/surface'

const signInReadiness = [
  {
    description: 'Подключение email/password и secure callback-маршрутов для Supabase Auth.',
    label: 'Следом подключается',
  },
  {
    description: 'Переход в кабинет, если сессия уже активна и пользователь возвращается к урокам.',
    label: 'Поведение после входа',
  },
  {
    description: 'Единые сообщения об ошибках и понятные статусы без утечки технических деталей.',
    label: 'Слой ошибок',
  },
] as const

const signInSignals = [
  {
    description: 'Кнопки social entry уже занимают правильное место и не потребуют визуальной перестройки после интеграции.',
    title: 'Социальный вход встроен как равноправный сценарий.',
  },
  {
    description: 'Email и пароль уже оформлены как спокойная форма без агрессивных состояний и лишнего шума.',
    title: 'Основной вход строится на минимальной когнитивной нагрузке.',
  },
  {
    description: 'Восстановление доступа и remember me остаются внизу формы, как в согласованном референсе.',
    title: 'Служебные действия не ломают главный путь.',
  },
] as const

export default async function SignInPage() {
  return runServerBoundary({
    boundary: 'auth:sign-in',
    async operation() {
      return (
        <AuthShell
          badge="Возвращение в ритм"
          description="Экран входа повторяет структуру утверждённого референса: крупный заголовок, social entry, email-форма и тихие служебные действия."
          footer="Экран пока работает как UI-shell. Подключение Supabase Auth и обработка callback-маршрутов начнутся в следующей фазе."
          title="С возвращением к ежедневной практике"
        >
          <Surface className="stack-md" variant="raised">
            <div className="auth-socials">
              <button className="auth-social-button" type="button">
                Продолжить через Google
              </button>
              <button className="auth-social-button" type="button">
                Продолжить через Apple ID
              </button>
            </div>

            <div className="auth-divider">
              <span>или войти через email</span>
            </div>

            <form className="auth-form">
              <div className="auth-field">
                <label htmlFor="sign-in-email">Email</label>
                <input
                  autoComplete="email"
                  id="sign-in-email"
                  name="email"
                  placeholder="student@example.com"
                  type="email"
                />
              </div>

              <div className="auth-field">
                <label htmlFor="sign-in-password">Пароль</label>
                <input
                  autoComplete="current-password"
                  id="sign-in-password"
                  name="password"
                  placeholder="••••••••"
                  type="password"
                />
              </div>

              <div className="auth-checkbox-row">
                <label className="auth-checkbox" htmlFor="remember-session">
                  <input defaultChecked id="remember-session" type="checkbox" />
                  Запомнить меня
                </label>
                <span>Сброс пароля появится после интеграции доступа.</span>
              </div>
            </form>

            <div className="action-row">
              <ButtonLink href="/cabinet" variant="primary">
                Открыть кабинет
              </ButtonLink>
              <ButtonLink href="/sign-up" variant="secondary">
                Создать аккаунт
              </ButtonLink>
              <ButtonLink href="/" variant="ghost">
                Вернуться на лендинг
              </ButtonLink>
            </div>

            <p className="auth-note">
              Форма не отправляет данные и служит ориентиром для следующего этапа интеграции.
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
