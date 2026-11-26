import type { Metadata, Viewport } from 'next'
import '../src/index.css'

export const metadata: Metadata = {
  title: 'OA-GIMS — OPEC Aurum Gems Integrated Management System',
  description: 'Empowering members, managing loans, and building communities with the OPEC Aurum Gems Integrated Management System.',
  applicationName: 'OA-GIMS',
  robots: { index: true, follow: true },
  icons: { icon: '/gem.svg' },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#07070d',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="bg-ink text-white antialiased">{children}</body>
    </html>
  )
}
