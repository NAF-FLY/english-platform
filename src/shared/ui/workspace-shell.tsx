import Link from 'next/link'
import type { ComponentProps, ReactNode } from 'react'

type LinkHref = ComponentProps<typeof Link>['href']

type WorkspaceNavigationItem = {
  current?: boolean
  href: LinkHref
  label: string
}

type WorkspaceShellProps = {
  children: ReactNode
  navigation: readonly WorkspaceNavigationItem[]
  note: string
  subtitle: string
  title: string
  userActions?: ReactNode
  userEmail?: string | null
  userName: string
  userRole: string
}

export function WorkspaceShell({
  children,
  navigation,
  note,
  subtitle,
  title,
  userActions,
  userEmail = null,
  userName,
  userRole,
}: WorkspaceShellProps) {
  return (
    <div className="workspace-shell">
      <aside className="workspace-sidebar">
        <div className="workspace-brand">
          <span aria-hidden="true" className="workspace-brand__mark">
            EP
          </span>
          <div>
            <p className="workspace-brand__title">{title}</p>
            <p className="workspace-brand__subtitle">{subtitle}</p>
          </div>
        </div>

        <nav aria-label="Навигация кабинета" className="workspace-nav">
          {navigation.map((item, index) => (
            <Link
              className="workspace-nav__link"
              data-current={item.current ? 'true' : 'false'}
              href={item.href}
              key={item.label}
            >
              <span aria-hidden="true" className="workspace-nav__index">
                {String(index + 1).padStart(2, '0')}
              </span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="workspace-user">
          <p className="workspace-user__name">{userName}</p>
          <p className="workspace-user__meta">{userRole}</p>
          {userEmail ? <p className="workspace-user__meta">{userEmail}</p> : null}
          {userActions ? (
            <div className="workspace-user__actions">{userActions}</div>
          ) : null}
        </div>

        <p className="workspace-note">{note}</p>
      </aside>

      <main className="workspace-main">
        <div className="workspace-layout">{children}</div>
      </main>
    </div>
  )
}
