import Link from 'next/link'
import type { ComponentProps, ReactNode } from 'react'

type LinkHref = ComponentProps<typeof Link>['href']

type ButtonLinkProps = {
  children: ReactNode
  href: LinkHref
  variant?: 'ghost' | 'primary' | 'secondary'
}

export function ButtonLink({
  children,
  href,
  variant = 'primary',
}: ButtonLinkProps) {
  return (
    <Link className="button-link" data-variant={variant} href={href}>
      {children}
    </Link>
  )
}
