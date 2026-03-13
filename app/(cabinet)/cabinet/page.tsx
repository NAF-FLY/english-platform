import type { Route } from 'next'
import { redirect } from 'next/navigation'

import { getCurrentProfileReadModel } from '@/src/modules/profile/application'
import { buildSignInRedirectDestination } from '@/src/server/guards/auth-route-policy'
import { runServerBoundary } from '@/src/server/guards/run-server-boundary'
import { Badge } from '@/src/shared/ui/badge'
import { ButtonLink } from '@/src/shared/ui/button-link'
import { DetailList } from '@/src/shared/ui/detail-list'
import { FeatureList } from '@/src/shared/ui/feature-list'
import { ProgressBar } from '@/src/shared/ui/progress-bar'
import { SectionHeading } from '@/src/shared/ui/section-heading'
import { StatGrid } from '@/src/shared/ui/stat-grid'
import { Surface } from '@/src/shared/ui/surface'

const recentResults = [
  {
    description: 'Переход к живым диалогам и словарным упражнениям внутри следующего цикла.',
    label: 'Деловая лексика',
    progress: 95,
    tone: 'accent' as const,
    value: '95%',
  },
  {
    description: 'Блок под повторение неправильных форм и короткие проверочные квизы.',
    label: 'Неправильные глаголы',
    progress: 88,
    tone: 'cool' as const,
    value: '88%',
  },
  {
    description: 'Серия коротких listening-сценариев для закрепления без перегруза.',
    label: 'Аудирование',
    progress: 76,
    tone: 'success' as const,
    value: '76%',
  },
] as const

const unlockedMilestones = [
  { icon: '07', meta: '7 ранних учебных сессий подряд', title: 'Ранний ритм' },
  { icon: '14', meta: 'Две недели без пропусков', title: 'Серия 14 дней' },
  { icon: '95', meta: 'Лучший результат в проверочном блоке', title: 'Квиз-мастер' },
  { icon: 'B2', meta: 'Траектория уже ведёт к верхнему intermediate', title: 'Курс в фокусе' },
] as const

export const dynamic = 'force-dynamic'

export default async function CabinetPage() {
  return runServerBoundary({
    boundary: 'cabinet:home',
    async operation() {
      const profile = await getCurrentProfileReadModel()

      if (!profile) {
        redirect(asRoute(buildSignInRedirectDestination('/cabinet')))
      }

      const focusAreas = [
        {
          description: `Следующий учебный модуль будет открываться как основной сценарий для ${profile.displayName}, а не теряться среди вторичных карточек.`,
          label: 'Следующий урок',
        },
        {
          description: `Статусы ${profile.roleSummary.toLowerCase()} уже распознаны на сервере и готовы дополняться живыми показателями серии и прохождения.`,
          label: 'Прогресс',
        },
        {
          description: profile.username
            ? `Профиль @${profile.username} и персональные настройки сохранятся в той же боковой навигации без перестройки shell.`
            : 'Профиль и персональные настройки позже лягут в ту же боковую навигацию без перестройки shell.',
          label: 'Профиль',
        },
      ] as const

      const internalSignals = profile.isInternal
        ? [
          {
            description: 'Роль распознана по membership-таблице и уже может открывать внутренние read-model без второго аккаунта.',
            label: 'Ролевой доступ',
          },
          {
            description: profile.isAdmin
              ? 'Администраторский уровень можно позже нарастить до moderation и platform settings.'
              : 'Командный уровень можно позже нарастить до review и learner support.',
            label: profile.isAdmin ? 'Админ-контур' : 'Командный контур',
          },
          {
            description: 'Внутренние панели пока остаются placeholder-блоками, чтобы auth milestone не тянул лишнюю доменную логику.',
            label: 'Граница milestone',
          },
        ] as const
        : null

      return (
        <div className="stack-lg">
          <header className="workspace-header">
            <div className="workspace-header__copy">
              <Badge tone={profile.isInternal ? 'success' : 'accent'}>
                {profile.isInternal ? 'Защищенная сессия активна' : 'Кабинет ученика'}
              </Badge>
              <h1 className="workspace-header__title">
                {profile.displayName}, ваш кабинет уже работает от реальной сессии.
              </h1>
              <p className="workspace-header__description">
                Серверный shell подтверждает личность, профиль и роли до
                рендера интерфейса. Дальше на эту же защищенную основу можно
                без дублирования auth-логики подключать уроки, прогресс и
                внутренние панели.
              </p>
            </div>
            <div className="action-row">
              <ButtonLink href="/cabinet#lessons" variant="primary">
                Продолжить маршрут
              </ButtonLink>
              <ButtonLink href="/" variant="secondary">
                На лендинг
              </ButtonLink>
            </div>
          </header>

          <section className="dashboard-grid">
            <Surface className="stack-md" variant="raised">
              <div className="stack-md">
                <Badge tone="muted">Текущий профиль</Badge>
                <SectionHeading
                  description="Read model уже отдает display name, email и role flags. Уроки и прогресс остаются следующими интеграциями, а не хардкодом auth-фазы."
                  eyebrow={profile.username ? `@${profile.username}` : profile.roleSummary}
                  title={`Следующий шаг для ${profile.displayName}: уроки, прогресс и профиль в одном потоке`}
                />
                <div className="action-row">
                  <ButtonLink href="/cabinet#lessons" variant="primary">
                    Продолжить урок
                  </ButtonLink>
                  <ButtonLink href="/cabinet#progress" variant="secondary">
                    Открыть прогресс
                  </ButtonLink>
                </div>
                <ProgressBar
                  description="Референсный dashboard использует крупный главный прогресс-блок. Здесь сохранена та же композиция, но с русским продуктовым текстом."
                  label="Общий прогресс по траектории"
                  progress={68}
                  value="68%"
                />
              </div>

                <StatGrid
                  items={[
                    {
                      label: 'Профиль',
                      meta: profile.email ?? 'Email будет доступен после подтверждения.',
                      tone: 'accent',
                      value: profile.displayName,
                    },
                    {
                      label: 'Роль',
                      meta: 'Роли считаются на сервере и уже влияют на навигацию.',
                      tone: 'success',
                      value: profile.roleLabel,
                    },
                    {
                      label: 'Доступ',
                      meta: profile.isInternal
                        ? 'Внутренний раздел появится в этой же оболочке.'
                        : 'Пока открыт только ученический контур.',
                      tone: 'cool',
                      value: profile.roleSummary,
                    },
                  ]}
                />
            </Surface>

            <Surface className="stack-md" variant="accent">
              <Badge tone="success">Ежедневная серия</Badge>
              <SectionHeading
                description="Правый акцентный блок повторяет ритм референса: одна крупная цифра, короткое пояснение и минимум второстепенного шума."
                eyebrow="Текущий ритм"
                title="12 учебных дней подряд"
              />
              <FeatureList
                items={[
                  {
                    description: 'Ещё две короткие сессии отделяют пользователя от недельной цели.',
                    title: 'Ритм удерживается без перегрузки.',
                  },
                  {
                    description: 'Кабинет позже сможет подмешивать сюда реальные streak-данные и достижения.',
                    title: 'Блок готов к живым метрикам.',
                  },
                ]}
              />
            </Surface>
          </section>

          <section className="panel-grid" id="progress">
            <Surface>
              <SectionHeading
                description="Раздел собран как карта подключения модулей, чтобы кабинет не превратился в монолитный экран с одной длинной лентой."
                eyebrow="Точки роста"
                title="Будущие модули уже имеют своё место"
              />
              <DetailList items={focusAreas} />
            </Surface>

            <Surface variant="cool">
              <SectionHeading
                description="Панель остается placeholder-слоем, но теперь уже находится внутри реально защищенного кабинета, а не на декоративном макете."
                eyebrow="Следующие данные"
                title="Срез по будущим метрикам"
              />
              <div className="progress-stack">
                {recentResults.map((item) => (
                  <ProgressBar
                    description={item.description}
                    key={item.label}
                    label={item.label}
                    progress={item.progress}
                    tone={item.tone}
                    value={item.value}
                  />
                ))}
              </div>
            </Surface>
          </section>

          <Surface id="profile">
            <SectionHeading
              description="Личный блок уже использует реальные поля идентичности, а достижения остаются безопасными заглушками до отдельных progress-модулей."
              eyebrow="Идентичность"
              title={`Профиль ${profile.displayName} уже читается с сервера`}
            />
            <StatGrid
              items={[
                {
                  label: 'User ID',
                  meta: 'Серверный идентификатор активной сессии.',
                  tone: 'default',
                  value: profile.userId.slice(0, 8),
                },
                {
                  label: 'Username',
                  meta: 'Поле профиля из таблицы profiles.',
                  tone: 'cool',
                  value: profile.username ? `@${profile.username}` : 'Не задан',
                },
                {
                  label: 'Контур',
                  meta: 'Определяется по role memberships.',
                  tone: 'accent',
                  value: profile.subtitle,
                },
              ]}
            />
            <div className="achievement-grid">
              {unlockedMilestones.map((item) => (
                <article className="achievement-card" key={item.title}>
                  <span aria-hidden="true" className="achievement-card__icon">
                    {item.icon}
                  </span>
                  <h3 className="achievement-card__title">{item.title}</h3>
                  <p className="achievement-card__meta">{item.meta}</p>
                </article>
              ))}
            </div>
          </Surface>

          <section className="lesson-grid" id="lessons">
            <Surface className="lesson-card">
              <h2 className="lesson-card__title">Уроки</h2>
              <p className="lesson-card__meta">
                Следующий учебный маршрут подключится через module
                application-слой и сохранит этот серверный auth-контракт.
              </p>
            </Surface>

            <Surface className="lesson-card" variant="cool">
              <h2 className="lesson-card__title">Упражнения</h2>
              <p className="lesson-card__meta">
                Общие progress-bar и карточки готовы для коротких заданий и
                проверки закрепления материала.
              </p>
            </Surface>

            <Surface className="lesson-card" variant="accent">
              <h2 className="lesson-card__title">Профиль и настройки</h2>
              <p className="lesson-card__meta">
                Личный контур уже привязан к реальному `profiles` read model, а
                дальше можно добавлять настройки и персонализацию без смены shell.
              </p>
            </Surface>
          </section>

          {internalSignals ? (
            <Surface id="internal" variant="cool">
              <SectionHeading
                description="Этот блок появляется только для staff/admin ролей и подтверждает, что навигация и shell уже реагируют на membership-таблицу."
                eyebrow="Внутренний доступ"
                title={profile.isAdmin ? 'Платформенный контур готов к развитию' : 'Командный контур уже выделен'}
              />
              <DetailList items={internalSignals} />
            </Surface>
          ) : null}
        </div>
      )
    },
  })
}

function asRoute(pathname: string): Route {
  return pathname as Route
}
