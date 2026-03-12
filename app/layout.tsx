import type { Metadata, Viewport } from 'next'
import { Manrope, Rubik } from 'next/font/google'
import type { ReactNode } from 'react'

import { getMetadataBase, reportRuntimeConfiguration } from '@/src/lib/env'

import './globals.css'

const bodyFont = Manrope({
  display: 'swap',
  subsets: ['latin', 'cyrillic'],
  variable: '--font-body',
})

const accentFont = Rubik({
  display: 'swap',
  subsets: ['latin', 'cyrillic'],
  variable: '--font-heading',
})

void reportRuntimeConfiguration()

export const metadata: Metadata = {
  metadataBase: getMetadataBase(),
  applicationName: 'English Platform',
  title: {
    default: 'English Platform',
    template: '%s | English Platform',
  },
  description: 'Платформа для структурированного изучения английского по методу Polyglot 16.',
  keywords: [
    'изучение английского',
    'Polyglot 16',
    'Supabase',
    'Next.js',
    'языковая практика',
  ],
  openGraph: {
    title: 'English Platform',
    description: 'Платформа для структурированного изучения английского по методу Polyglot 16.',
    locale: 'ru_RU',
    siteName: 'English Platform',
    type: 'website',
  },
}

export const viewport: Viewport = {
  themeColor: '#f8fafc',
}

type RootLayoutProps = {
  children: ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="ru">
      <body className={`${bodyFont.variable} ${accentFont.variable} app-body`}>
        {children}
      </body>
    </html>
  )
}
