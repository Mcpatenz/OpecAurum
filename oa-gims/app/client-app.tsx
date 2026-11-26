'use client'

import dynamic from 'next/dynamic'

const Application = dynamic(
  () => import('../src/main').then((module) => module.Application),
  { ssr: false, loading: () => <div className="grid min-h-screen place-items-center bg-ink text-sm text-white/60">Loading OA-GIMS…</div> },
)

export default function ClientApp() {
  return <Application />
}
