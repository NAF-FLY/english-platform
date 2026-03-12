import Link from 'next/link'
import type { ComponentProps, ReactNode } from 'react'

import { cn } from '@/src/shared/utils/cn'

import { Container } from './container'

type LinkHref = ComponentProps<typeof Link>['href']

type NavigationItem = {
  href: LinkHref
  label: string
}

type AreaLayoutProps = {
  children: ReactNode
  description: string
  navigation: NavigationItem[]
  subtitle: string
  title: string
  tone?: 'cool' | 'default' | 'warm'
}

export function AreaLayout({
  children,
  description,
  navigation,
  subtitle,
  title,
  tone = 'default',
}: AreaLayoutProps) {
  return (
    <div className="area-shell" data-tone={tone}>
      <header className="area-header">
        <Container>
          <div className="area-header__bar">
            <div className="brand-lockup">
              <span className="brand-mark">EP</span>
              <div className="brand-copy">
                <p className="brand-title">{title}</p>
                <p className="brand-subtitle">{subtitle}</p>
              </div>
            </div>
            <nav aria-label={`${subtitle} navigation`} className="area-nav">
              {navigation.map((item) => (
                <Link className="nav-link" href={item.href} key={item.label}>
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </Container>
      </header>

      <main className="area-main">
        <Container className={cn('stack-lg')}>
          {children}
          <footer className="area-footer">{description}</footer>
        </Container>
      </main>
    </div>
  )
}
