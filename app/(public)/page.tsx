import { runServerBoundary } from '@/src/server/guards/run-server-boundary'
import { Badge } from '@/src/shared/ui/badge'
import { ButtonLink } from '@/src/shared/ui/button-link'
import { DetailList } from '@/src/shared/ui/detail-list'
import { FeatureList } from '@/src/shared/ui/feature-list'
import { ProgressBar } from '@/src/shared/ui/progress-bar'
import { SectionHeading } from '@/src/shared/ui/section-heading'
import { StatGrid } from '@/src/shared/ui/stat-grid'
import { Surface } from '@/src/shared/ui/surface'

const learningPillars = [
  {
    description:
      'Каждый урок подаётся как короткий модуль с чётким следующим шагом, а не как бессвязный каталог.',
    title: 'Маршрут строится вокруг уроков, а не вокруг меню.',
  },
  {
    description:
      'Тренировки, мини-квизы и повторение будут расти из общей дизайн-системы без визуальных скачков между экранами.',
    title: 'Практика и проверка живут в той же системе ритма.',
  },
  {
    description:
      'Кабинет уже подготовлен под прогресс, серию занятий и профиль, чтобы интеграции добавлялись модульно.',
    title: 'Прогресс фиксируется в рабочем пространстве ученика.',
  },
] as const

const readinessSignals = [
  {
    description:
      'Публичная зона уже объясняет метод, обещание продукта и направление ближайшего урока.',
    label: 'Лендинг',
  },
  {
    description:
      'Страницы входа и регистрации получили настоящую форму, social entry-зону и спокойный системный тон.',
    label: 'Авторизация',
  },
  {
    description:
      'Кабинет работает как заготовка под уроки, прогресс, профиль и будущие защищённые маршруты.',
    label: 'Кабинет',
  },
] as const

const weeklySnapshot = [
  {
    description: '4 из 5 сессий уже закрыты, чтобы довести неделю до целевого ритма.',
    label: 'Недельная цель',
    progress: 80,
    tone: 'accent' as const,
    value: '80%',
  },
  {
    description: 'Повторение слов и конструкций будет распределено по коротким слотам внутри кабинета.',
    label: 'Повторение',
    progress: 68,
    tone: 'cool' as const,
    value: '68%',
  },
  {
    description: 'Следующий шаг нацелен на диалоги и реакцию в реальном темпе, а не только на чтение правил.',
    label: 'Разговорный блок',
    progress: 52,
    tone: 'success' as const,
    value: '52%',
  },
] as const

export default async function LandingPage() {
  return runServerBoundary({
    boundary: 'public:landing',
    async operation() {
      return (
        <div className="stack-lg">
          <Surface className="hero-grid" variant="raised">
            <div className="stack-md">
              <Badge tone="accent">Polyglot 16</Badge>
              <p className="eyebrow">Платформа с единым маршрутом для уроков, практики и личного кабинета</p>
              <h1 className="page-title">
                Английский собирается в устойчивый учебный ритм, а не в набор случайных экранов.
              </h1>
              <p className="lead">
                English Platform использует общий визуальный язык для первого
                контакта, авторизации и кабинета, чтобы путь ученика выглядел
                как цельная система: от обещания результата до следующего
                урока, повторения и личного прогресса.
              </p>
              <div className="action-row">
                <ButtonLink href="/sign-up" variant="primary">
                  Начать с регистрации
                </ButtonLink>
                <ButtonLink href="/cabinet" variant="secondary">
                  Посмотреть кабинет
                </ButtonLink>
              </div>
              <FeatureList items={learningPillars} />
            </div>

            <div className="hero-preview">
              <StatGrid
                items={[
                  {
                    label: 'Траектория',
                    meta: 'От первого урока до ежедневной практики в одном потоке.',
                    tone: 'accent',
                    value: '16 блоков',
                  },
                  {
                    label: 'Ритм недели',
                    meta: 'Пять коротких учебных сессий без перегруза.',
                    tone: 'cool',
                    value: '5 сессий',
                  },
                  {
                    label: 'Короткий старт',
                    meta: 'Маршрут входа занимает минуты, а не отдельный onboarding-проект.',
                    tone: 'success',
                    value: '10 минут',
                  },
                ]}
              />

              <div className="preview-panel">
                <h2 className="preview-panel__title">Снимок будущей учебной недели</h2>
                <p className="preview-panel__meta">
                  Структура перенесена из утверждённого референса: крупные
                  метрики наверху, спокойные карточки и читаемые полосы
                  прогресса без шумных декоративных блоков.
                </p>
                <div className="progress-stack">
                  {weeklySnapshot.map((item) => (
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
              </div>
            </div>
          </Surface>

          <section className="split-grid">
            <Surface>
              <SectionHeading
                description="Публичная зона больше не показывает техническое состояние проекта. Вместо этого она объясняет, как пользователь движется через продукт."
                eyebrow="Что видно сразу"
                title="Маршрут читается с первого экрана"
              />
              <FeatureList
                items={[
                  {
                    description:
                      'Лендинг сразу показывает, что ученик получит последовательность уроков, а не разрозненный каталог.',
                    title: 'Путь начинается с понятного обещания результата.',
                  },
                  {
                    description:
                      'Основные действия сводятся к двум понятным переходам: создать доступ или открыть рабочее пространство.',
                    title: 'Основные CTA соответствуют реальным следующим шагам.',
                  },
                  {
                    description:
                      'Карточки и полосы прогресса уже визуально совместимы с будущим кабинетом, поэтому переход ощущается естественным.',
                    title: 'Публичная зона заранее готовит пользователя к кабинету.',
                  },
                ]}
              />
            </Surface>

            <Surface variant="cool">
              <SectionHeading
                description="Эта фаза переводит проект с технических заглушек на продуктовые оболочки, которые можно наращивать модулями."
                eyebrow="Готовность"
                title="Что уже можно развивать дальше"
              />
              <DetailList items={readinessSignals} />
            </Surface>
          </section>

          <section className="metrics-layout">
            <Surface>
              <SectionHeading
                description="Визуальная система теперь одинаково поддерживает обзорные метрики, ленты прогресса и поясняющие панели."
                eyebrow="Система"
                title="Токены и примитивы собраны под один язык интерфейса"
              />
              <StatGrid
                items={[
                  {
                    label: 'Основной цвет',
                    meta: 'Лавандовый акцент из согласованного референса.',
                    tone: 'accent',
                    value: '#9381FF',
                  },
                  {
                    label: 'Поверхности',
                    meta: 'Белые и тонированные панели с мягкой глубиной.',
                    tone: 'default',
                    value: '3 уровня',
                  },
                  {
                    label: 'Примитивы',
                    meta: 'Shell, списки, прогресс и метрики переиспользуются между зонами.',
                    tone: 'cool',
                    value: '9+ блоков',
                  },
                ]}
              />
            </Surface>

            <Surface variant="accent">
              <SectionHeading
                description="После этой фазы можно без визуального долга подключать Supabase Auth, guarded-роуты и модульные read-models."
                eyebrow="Следующий шаг"
                title="Интеграции теперь добавляются поверх готовых оболочек"
              />
              <FeatureList
                items={[
                  {
                    description:
                      'Sign in / sign up уже имеют реальную композицию формы, поэтому интеграция Supabase войдёт без перестройки страницы.',
                    title: 'Auth потоки можно подключать к существующему каркасу.',
                  },
                  {
                    description:
                      'Кабинет уже использует sidebar-shell, метрики и блоки прогресса, пригодные для уроков, упражнений и профиля.',
                    title: 'Защищённая зона готова к росту по модулям.',
                  },
                  {
                    description:
                      'Один набор токенов управляет фоном, радиусами, цветом акцента и поведением базовых карточек на всех экранах.',
                    title: 'Дизайн больше не живёт в отдельных разрозненных файлах.',
                  },
                ]}
              />
            </Surface>
          </section>
        </div>
      )
    },
  })
}
