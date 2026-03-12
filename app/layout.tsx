import type { Metadata } from 'next'
import type { ReactNode } from 'react'

import { getMetadataBase, reportRuntimeConfiguration } from '@/src/lib/env'

import './globals.css'

void reportRuntimeConfiguration()

export const metadata: Metadata = {
  metadataBase: getMetadataBase(),
  title: {
    default: 'English Platform',
    template: '%s | English Platform',
  },
  description:
    'Structured English learning platform based on the Polyglot 16 method.',
}

type RootLayoutProps = {
  children: ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  )
}
