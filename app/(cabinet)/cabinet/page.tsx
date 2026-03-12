import { runServerBoundary } from '@/src/server/guards/run-server-boundary'
import { Badge } from '@/src/shared/ui/badge'
import { ButtonLink } from '@/src/shared/ui/button-link'
import { DetailList } from '@/src/shared/ui/detail-list'
import { FeatureList } from '@/src/shared/ui/feature-list'
import { ProgressBar } from '@/src/shared/ui/progress-bar'
import { SectionHeading } from '@/src/shared/ui/section-heading'
import { StatGrid } from '@/src/shared/ui/stat-grid'
import { Surface } from '@/src/shared/ui/surface'

const focusAreas = [
  {
    description: 'Новый урок должен открываться как основной сценарий дня, а не тонуть среди вторичных карточек.',
    label: 'Следующий урок',
  },
  {
    description: 'Метрики серии, завершения и силы навыка подаются в крупном и быстро считываемом формате.',
    label: 'Прогресс',
  },
  {
    description: 'Профиль и предпочтения позже лягут в ту же боковую навигацию без перестройки shell.',
    label: 'Профиль',
  },
] as const

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

export default async function CabinetPage() {
  return runServerBoundary({
    boundary: 'cabinet:home',
    async operation() {
      return (
        <div className="stack-lg">
          <header className="workspace-header">
            <div className="workspace-header__copy">
              <Badge tone="accent">Панель ученика</Badge>
              <h1 className="workspace-header__title">Сегодня маршрут уже виден как настоящий кабинет.</h1>
              <p className="workspace-header__description">
                Дашборд следует структуре одобренного референса: боковая
                навигация, обзор текущего курса, крупная серия занятий и
                отдельные панели прогресса, готовые к данным из будущих модулей.
              </p>
            </div>
            <div className="action-row">
              <ButtonLink href="/" variant="secondary">
                На лендинг
              </ButtonLink>
              <ButtonLink href="/sign-in" variant="ghost">
                Перейти ко входу
              </ButtonLink>
            </div>
          </header>

          <section className="dashboard-grid">
            <Surface className="stack-md" variant="raised">
              <div className="stack-md">
                <Badge tone="muted">Текущий курс</Badge>
                <SectionHeading
                  description="Здесь позже будет подключён реальный read-model курса. Сейчас блок уже задаёт правильный масштаб и иерархию для ежедневного возвращения пользователя."
                  eyebrow="English for Business"
                  title="Следующий шаг: переговоры и реакция в рабочем диалоге"
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
                    label: 'Следующий урок',
                    meta: 'Словарь и реакция в деловых диалогах',
                    tone: 'accent',
                    value: 'Урок 06',
                  },
                  {
                    label: 'Серия',
                    meta: 'До недельной цели осталось 2 дня',
                    tone: 'success',
                    value: '12 дней',
                  },
                  {
                    label: 'Фокус недели',
                    meta: 'Повторение + живой разговорный блок',
                    tone: 'cool',
                    value: 'B1 → B2',
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
                description="Недавние результаты оформлены через общий progress-примитив, который потом можно использовать и в упражнениях, и в профиле."
                eyebrow="Последние результаты"
                title="Срез по недавним блокам"
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
              description="Даже без реального профиля экран уже поддерживает блоки достижений и статусов без отдельной одноразовой вёрстки."
              eyebrow="Вехи"
              title="Разблокированные учебные сигналы"
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
                Маршрут уроков позже подключится к module application-слою и
                защищённым read-models.
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
                Sidebar-shell заранее предусматривает отдельные зоны для
                предпочтений, персонализации и статуса обучения.
              </p>
            </Surface>
          </section>
        </div>
      )
    },
  })
}
