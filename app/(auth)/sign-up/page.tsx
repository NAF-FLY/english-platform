import { runServerBoundary } from '@/src/server/guards/run-server-boundary'
import { AuthShell } from '@/src/shared/ui/auth-shell'
import { ButtonLink } from '@/src/shared/ui/button-link'
import { DetailList } from '@/src/shared/ui/detail-list'
import { FeatureList } from '@/src/shared/ui/feature-list'
import { SectionHeading } from '@/src/shared/ui/section-heading'
import { Surface } from '@/src/shared/ui/surface'

const onboardingBenefits = [
  {
    description: 'Новый пользователь сразу попадает в понятную стартовую точку вместо пустого кабинета.',
    title: 'Регистрация подготавливает первый учебный шаг.',
  },
  {
    description: 'Сразу после подключения Supabase сюда естественно добавятся подтверждение email и обработка просроченных ссылок.',
    title: 'Технические сценарии уже имеют своё место в композиции.',
  },
  {
    description: 'Тот же набор токенов и отступов будет использоваться на профиле, настройках и защищённых формах.',
    title: 'Экран работает как база для других form-flow страниц.',
  },
] as const

const onboardingDetails = [
  {
    description: 'Имя, email и пароль собираются в короткую последовательность без отвлекающих промежуточных экранов.',
    label: 'Сценарий старта',
  },
  {
    description: 'После успешной регистрации пользователь уходит в кабинет, где уже подготовлены модули уроков и прогресса.',
    label: 'Куда ведёт CTA',
  },
  {
    description: 'Ошибки подтверждения, занятый email и просроченные ссылки позже будут отображаться в том же shell.',
    label: 'Что добавится',
  },
] as const

export default async function SignUpPage() {
  return runServerBoundary({
    boundary: 'auth:sign-up',
    async operation() {
      return (
        <AuthShell
          badge="Первый вход"
          description="Регистрация оформлена в той же структуре, что и вход: лаконичная шапка, карточка формы и поясняющие панели для следующей фазы интеграции."
          footer="После подключения auth-инфраструктуры этот экран станет точкой создания аккаунта без дополнительной визуальной переработки."
          title="Создайте доступ к своему учебному маршруту"
        >
          <Surface className="stack-md" variant="raised">
            <div className="auth-form">
              <div className="auth-field">
                <label htmlFor="sign-up-name">Как к вам обращаться</label>
                <input
                  autoComplete="name"
                  id="sign-up-name"
                  name="name"
                  placeholder="Анна"
                  type="text"
                />
              </div>

              <div className="auth-field">
                <label htmlFor="sign-up-email">Email</label>
                <input
                  autoComplete="email"
                  id="sign-up-email"
                  name="email"
                  placeholder="student@example.com"
                  type="email"
                />
              </div>

              <div className="auth-field">
                <label htmlFor="sign-up-password">Пароль</label>
                <input
                  autoComplete="new-password"
                  id="sign-up-password"
                  name="password"
                  placeholder="Минимум 8 символов"
                  type="password"
                />
              </div>
            </div>

            <div className="action-row">
              <ButtonLink href="/cabinet" variant="primary">
                Перейти в кабинет
              </ButtonLink>
              <ButtonLink href="/sign-in" variant="secondary">
                У меня уже есть аккаунт
              </ButtonLink>
              <ButtonLink href="/" variant="ghost">
                Вернуться на лендинг
              </ButtonLink>
            </div>

            <p className="auth-note">
              Форма пока служит визуальным контрактом для будущего sign up-flow и не отправляет данные.
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
