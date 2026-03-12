import type { HTMLAttributes, ReactNode } from 'react'

import { cn } from '@/src/shared/utils/cn'

type SurfaceProps = HTMLAttributes<HTMLElement> & {
  children: ReactNode
  variant?: 'accent' | 'cool' | 'default' | 'raised'
}

export function Surface({
  children,
  className,
  variant = 'default',
  ...props
}: SurfaceProps) {
  return (
    <section className={cn('surface', className)} data-variant={variant} {...props}>
      {children}
    </section>
  )
}
